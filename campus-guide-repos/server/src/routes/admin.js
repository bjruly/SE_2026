import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { HttpError, parse } from '../errors.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { createPoi, deletePoi, getPoi, listPois, updatePoi } from '../poiRepo.js';
import { createUserBody, poiBody, updateUserBody } from '../validation.js';

const userShape = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.full_name,
  role: u.role,
  isActive: u.is_active,
  createdAt: u.created_at,
});

// Các API dành cho dashboard (phải đăng nhập, kiểm tra quyền theo vai trò)
export function adminRoutes({ db, config }) {
  const r = Router();
  r.use(requireAuth({ db, config }));

  // ---- Địa điểm ----
  r.get('/pois', requirePermission('poi:read'), async (_req, res) => {
    res.json(await listPois(db.query, { onlyActive: false }));
  });

  r.get('/pois/:id', requirePermission('poi:read'), async (req, res) => {
    const poi = await getPoi(db.query, req.params.id);
    if (!poi) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy địa điểm');
    res.json(poi);
  });

  r.post('/pois', requirePermission('poi:create'), async (req, res) => {
    const body = parse(poiBody, req.body);
    res.status(201).json(await createPoi(db, body, config.qrPrefix));
  });

  r.put('/pois/:id', requirePermission('poi:update'), async (req, res) => {
    const body = parse(poiBody, req.body);
    const poi = await updatePoi(db, req.params.id, body);
    if (!poi) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy địa điểm');
    res.json(poi);
  });

  r.delete('/pois/:id', requirePermission('poi:delete'), async (req, res) => {
    const ok = await deletePoi(db, req.params.id);
    if (!ok) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy địa điểm');
    res.status(204).end();
  });

  // ---- Thống kê ----
  r.get('/stats', requirePermission('stats:read'), async (req, res) => {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const DAY = 86400000;
    const since = new Date(Date.now() - (days - 1) * DAY).toISOString().slice(0, 10); // ngày UTC
    const today = new Date().toISOString().slice(0, 10);
    const inRange = "(e.created_at AT TIME ZONE 'UTC')::date >= $1::date";
    const counts = `count(e.id) FILTER (WHERE e.event_type = 'listen')::int AS listen,
                    count(e.id) FILTER (WHERE e.event_type = 'qr_scan')::int AS qr_scan`;

    const [totals, byPoi, byLang, byPoiLang, bySource, byDay] = await Promise.all([
      db.query(`SELECT ${counts} FROM events e WHERE ${inRange}`, [since]),
      db.query(
        `SELECT p.id AS poi_id, t.name, ${counts}
         FROM pois p
         LEFT JOIN poi_translations t ON t.poi_id = p.id AND t.lang = 'vi'
         LEFT JOIN events e ON e.poi_id = p.id AND ${inRange}
         GROUP BY p.id, t.name ORDER BY listen DESC, qr_scan DESC, p.id`,
        [since],
      ),
      db.query(
        `SELECT l.code AS lang, ${counts}
         FROM languages l LEFT JOIN events e ON e.lang = l.code AND ${inRange}
         GROUP BY l.code ORDER BY l.code`,
        [since],
      ),
      db.query(
        `SELECT e.poi_id, e.lang, ${counts}
         FROM events e WHERE ${inRange}
         GROUP BY e.poi_id, e.lang ORDER BY e.poi_id, e.lang`,
        [since],
      ),
      db.query(
        `SELECT e.source, count(*)::int AS count
         FROM events e WHERE e.event_type = 'listen' AND ${inRange}
         GROUP BY e.source ORDER BY e.source`,
        [since],
      ),
      db.query(
        `SELECT to_char(d.day, 'YYYY-MM-DD') AS day, ${counts}
         FROM generate_series($1::date, $2::date, interval '1 day') AS d(day)
         LEFT JOIN events e ON (e.created_at AT TIME ZONE 'UTC')::date = d.day::date
         GROUP BY d.day ORDER BY d.day`,
        [since, today],
      ),
    ]);

    res.json({
      range: { days, from: since, to: today, timezone: 'UTC' },
      totals: { listen: totals.rows[0].listen, qrScan: totals.rows[0].qr_scan },
      byPoi: byPoi.rows.map((x) => ({ poiId: x.poi_id, name: x.name, listen: x.listen, qrScan: x.qr_scan })),
      byLang: byLang.rows.map((x) => ({ lang: x.lang, listen: x.listen, qrScan: x.qr_scan })),
      byPoiLang: byPoiLang.rows.map((x) => ({ poiId: x.poi_id, lang: x.lang, listen: x.listen, qrScan: x.qr_scan })),
      bySource: bySource.rows.map((x) => ({ source: x.source, count: x.count })),
      byDay: byDay.rows.map((x) => ({ day: x.day, listen: x.listen, qrScan: x.qr_scan })),
    });
  });

  r.get('/online', requirePermission('stats:read'), async (_req, res) => {
    await db.query(`DELETE FROM online_sessions WHERE last_seen_at < now() - interval '1 day'`);
    const q = await db.query(
      `SELECT client, count(*)::int AS count
       FROM online_sessions
       WHERE last_seen_at >= now() - interval '2 minutes'
       GROUP BY client`,
    );
    const byClient = { web: 0, mobile: 0 };
    for (const row of q.rows) byClient[row.client] = row.count;
    res.json({ total: byClient.web + byClient.mobile, byClient });
  });

  // ---- Tài khoản admin (chỉ Quản trị) ----
  r.get('/users', requirePermission('user:manage'), async (_req, res) => {
    const q = await db.query('SELECT * FROM admins ORDER BY id');
    res.json(q.rows.map(userShape));
  });

  r.post('/users', requirePermission('user:manage'), async (req, res) => {
    const b = parse(createUserBody, req.body);
    const hash = await bcrypt.hash(b.password, 10);
    const q = await db.query(
      `INSERT INTO admins (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [b.email, hash, b.fullName, b.role],
    );
    res.status(201).json(userShape(q.rows[0]));
  });

  r.patch('/users/:id', requirePermission('user:manage'), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new HttpError(400, 'VALIDATION', 'Mã tài khoản không hợp lệ');
    const b = parse(updateUserBody, req.body);
    const cur = await db.query('SELECT * FROM admins WHERE id = $1', [id]);
    if (!cur.rows.length) throw new HttpError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản');
    // Không cho tự hạ quyền hoặc tự khóa chính mình, để luôn còn ít nhất một Quản trị hoạt động
    if (id === req.user.id && ((b.role && b.role !== 'admin') || b.isActive === false)) {
      throw new HttpError(400, 'SELF_LOCKOUT', 'Không thể tự hạ vai trò hoặc tự khóa tài khoản của chính mình');
    }
    const hash = b.password ? await bcrypt.hash(b.password, 10) : null;
    const q = await db.query(
      `UPDATE admins SET
         full_name = COALESCE($2, full_name),
         role = COALESCE($3, role),
         is_active = COALESCE($4, is_active),
         password_hash = COALESCE($5, password_hash),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, b.fullName ?? null, b.role ?? null, b.isActive ?? null, hash],
    );
    res.json(userShape(q.rows[0]));
  });

  return r;
}
