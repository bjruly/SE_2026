import { Router } from 'express';
import { listPois } from '../poiRepo.js';
import { parse } from '../errors.js';
import { HttpError } from '../errors.js';
import { eventBody } from '../validation.js';

// Các API công khai (web và app gọi, không cần đăng nhập)
export function publicRoutes({ db }) {
  const r = Router();

  r.get('/health', async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ ok: true });
  });

  // Danh sách địa điểm đang hoạt động, cùng hình dạng với file pois.json
  r.get('/pois', async (_req, res) => {
    const pois = await listPois(db.query, { onlyActive: true });
    res.set('Cache-Control', 'public, max-age=30');
    res.json(pois.map(({ createdAt, updatedAt, active, ...rest }) => rest));
  });

  // Ghi một sự kiện thống kê ẩn danh (lượt nghe hoặc lượt quét QR)
  r.post('/events', async (req, res) => {
    const e = parse(eventBody, req.body);
    const source = e.type === 'qr_scan' ? 'qr' : e.source;
    const ins = await db.query(
      `INSERT INTO events (poi_id, lang, event_type, source, client)
       SELECT p.id, $2, $3, $4, $5 FROM pois p WHERE p.id = $1 AND p.active
       RETURNING id`,
      [e.poiId, e.lang, e.type, source, e.client ?? null],
    );
    if (!ins.rows.length) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy địa điểm');
    res.status(201).json({ ok: true });
  });

  return r;
}
