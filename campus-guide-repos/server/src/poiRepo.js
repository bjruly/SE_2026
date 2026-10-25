// Đọc/ghi địa điểm và bản dịch. Hình dạng dữ liệu trả về giống file pois.json mà web và app đang dùng.
import { LANG_CODES } from './validation.js';

function shape(poi, translations) {
  const name = {};
  const description = {};
  const audioUrl = {};
  for (const lang of LANG_CODES) {
    const t = translations.find((x) => x.lang === lang);
    name[lang] = t ? t.name : '';
    description[lang] = t ? t.description : '';
    audioUrl[lang] = t ? t.audio_url : null;
  }
  return {
    id: poi.id,
    qrCode: poi.qr_code,
    latitude: poi.latitude,
    longitude: poi.longitude,
    radiusMeters: poi.radius_meters,
    active: poi.active,
    createdAt: poi.created_at,
    updatedAt: poi.updated_at,
    name,
    description,
    audioUrl,
  };
}

export async function listPois(q, { onlyActive }) {
  const pois = await q(`SELECT * FROM pois ${onlyActive ? 'WHERE active' : ''} ORDER BY id`);
  const trs = await q(`SELECT * FROM poi_translations ${onlyActive ? 'WHERE poi_id IN (SELECT id FROM pois WHERE active)' : ''}`);
  return pois.rows.map((p) => shape(p, trs.rows.filter((t) => t.poi_id === p.id)));
}

export async function getPoi(q, id) {
  const p = await q('SELECT * FROM pois WHERE id = $1', [id]);
  if (!p.rows.length) return null;
  const trs = await q('SELECT * FROM poi_translations WHERE poi_id = $1', [id]);
  return shape(p.rows[0], trs.rows);
}

async function upsertTranslations(q, id, translations) {
  for (const lang of LANG_CODES) {
    const t = translations[lang];
    await q(
      `INSERT INTO poi_translations (poi_id, lang, name, description, audio_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (poi_id, lang) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, audio_url = EXCLUDED.audio_url`,
      [id, lang, t.name, t.description, t.audioUrl ?? null],
    );
  }
}

export async function createPoi(db, body, qrPrefix) {
  const id = await db.tx(async (q) => {
    const r = await q(
      `INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters, active)
       SELECT n.id, $1 || upper(n.id), $2, $3, $4, $5
       FROM (SELECT 'poi-' || lpad(nextval('poi_number_seq')::text, 3, '0') AS id) AS n
       RETURNING id`,
      [qrPrefix, body.latitude, body.longitude, body.radiusMeters, body.active],
    );
    const newId = r.rows[0].id;
    await upsertTranslations(q, newId, body.translations);
    return newId;
  });
  return getPoi(db.query, id);
}

export async function updatePoi(db, id, body) {
  const found = await db.tx(async (q) => {
    const r = await q(
      `UPDATE pois SET latitude = $2, longitude = $3, radius_meters = $4, active = $5, updated_at = now()
       WHERE id = $1 RETURNING id`,
      [id, body.latitude, body.longitude, body.radiusMeters, body.active],
    );
    if (!r.rows.length) return false;
    await upsertTranslations(q, id, body.translations);
    return true;
  });
  return found ? getPoi(db.query, id) : null;
}

export async function deletePoi(db, id) {
  const r = await db.query('DELETE FROM pois WHERE id = $1 RETURNING id', [id]);
  return r.rows.length > 0;
}
