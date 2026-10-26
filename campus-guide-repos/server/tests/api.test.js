import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './helpers.js';

let s;
let adminToken;
let editorToken;

const validPoi = (over = {}) => ({
  latitude: 10.761,
  longitude: 106.683,
  radiusMeters: 30,
  active: true,
  translations: {
    vi: { name: 'Điểm mới', description: 'Mô tả mới' },
    en: { name: 'New point', description: 'New description' },
    zh: { name: '新地点', description: '新描述' },
  },
  ...over,
});

before(async () => {
  s = await startServer();
  await s.addAdmin('admin@test.vn', 'admin');
  await s.addAdmin('editor@test.vn', 'editor');
  adminToken = (await s.login('admin@test.vn')).body.token;
  editorToken = (await s.login('editor@test.vn')).body.token;
});
after(async () => s.close());

test('health và danh sách địa điểm công khai giống hệt file pois.json của web', async () => {
  assert.equal((await s.api('GET', '/api/health')).body.ok, true);
  const r = await s.api('GET', '/api/pois');
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 3);
  const jsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'web', 'data', 'pois.json');
  if (fs.existsSync(jsonPath)) {
    assert.deepEqual(r.body, JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
  }
});

test('đăng nhập: sai mật khẩu bị từ chối, đúng thì có token; không token thì 401', async () => {
  assert.equal((await s.login('admin@test.vn', 'sai-mat-khau')).status, 401);
  assert.equal((await s.login('khong-co@test.vn')).status, 401);
  const me = await s.api('GET', '/api/auth/me', { token: adminToken });
  assert.equal(me.body.user.role, 'admin');
  assert.equal((await s.api('GET', '/api/admin/pois')).status, 401);
  assert.equal((await s.api('GET', '/api/admin/pois', { token: 'rac' })).status, 401);
});

test('Biên tập: thêm và sửa được địa điểm, không xóa được, không quản lý tài khoản', async () => {
  const created = await s.api('POST', '/api/admin/pois', { token: editorToken, body: validPoi() });
  assert.equal(created.status, 201);
  assert.equal(created.body.id, 'poi-004');
  assert.equal(created.body.qrCode, 'DHSG-POI-004');
  assert.equal(created.body.name.zh, '新地点');

  const upd = validPoi({ radiusMeters: 45 });
  upd.translations.vi.name = 'Đã sửa';
  const put = await s.api('PUT', '/api/admin/pois/poi-004', { token: editorToken, body: upd });
  assert.equal(put.status, 200);
  assert.equal(put.body.radiusMeters, 45);
  assert.equal(put.body.name.vi, 'Đã sửa');
  assert.equal(put.body.qrCode, 'DHSG-POI-004'); // mã QR không đổi khi sửa

  assert.equal((await s.api('DELETE', '/api/admin/pois/poi-004', { token: editorToken })).status, 403);
  assert.equal((await s.api('GET', '/api/admin/users', { token: editorToken })).status, 403);
  assert.equal((await s.api('GET', '/api/admin/stats', { token: editorToken })).status, 200);
});

test('Quản trị xóa được địa điểm; địa điểm không còn tồn tại', async () => {
  assert.equal((await s.api('DELETE', '/api/admin/pois/poi-004', { token: adminToken })).status, 204);
  assert.equal((await s.api('GET', '/api/admin/pois/poi-004', { token: adminToken })).status, 404);
  assert.equal((await s.api('DELETE', '/api/admin/pois/poi-004', { token: adminToken })).status, 404);
});

test('kiểm tra dữ liệu địa điểm: thiếu bản dịch, tọa độ sai, bán kính sai đều bị 400', async () => {
  const bad1 = validPoi();
  delete bad1.translations.zh;
  assert.equal((await s.api('POST', '/api/admin/pois', { token: adminToken, body: bad1 })).status, 400);
  assert.equal((await s.api('POST', '/api/admin/pois', { token: adminToken, body: validPoi({ latitude: 200 }) })).status, 400);
  assert.equal((await s.api('POST', '/api/admin/pois', { token: adminToken, body: validPoi({ radiusMeters: 0 }) })).status, 400);
  const bad2 = validPoi();
  bad2.translations.en.name = '   ';
  assert.equal((await s.api('POST', '/api/admin/pois', { token: adminToken, body: bad2 })).status, 400);
});

test('thống kê: ghi sự kiện hợp lệ, từ chối sự kiện sai, tổng hợp đúng', async () => {
  const ev = (body) => s.api('POST', '/api/events', { body });
  assert.equal((await ev({ poiId: 'poi-001', type: 'listen', lang: 'vi', source: 'auto', client: 'web' })).status, 201);
  assert.equal((await ev({ poiId: 'poi-001', type: 'listen', lang: 'en', source: 'manual', client: 'mobile' })).status, 201);
  assert.equal((await ev({ poiId: 'poi-002', type: 'qr_scan', lang: 'zh' })).status, 201);
  assert.equal((await ev({ poiId: 'poi-001', type: 'listen', lang: 'vi', source: 'qr' })).status, 400);
  assert.equal((await ev({ poiId: 'poi-001', type: 'listen', lang: 'fr', source: 'auto' })).status, 400);
  assert.equal((await ev({ poiId: 'khong-co', type: 'listen', lang: 'vi', source: 'auto' })).status, 404);

  const st = await s.api('GET', '/api/admin/stats?days=7', { token: adminToken });
  assert.equal(st.status, 200);
  assert.deepEqual(st.body.totals, { listen: 2, qrScan: 1 });
  assert.equal(st.body.byDay.length, 7);
  assert.equal(st.body.byDay.at(-1).listen, 2);
  const p1 = st.body.byPoi.find((x) => x.poiId === 'poi-001');
  assert.deepEqual([p1.listen, p1.qrScan], [2, 0]);
  assert.equal(st.body.byPoi.find((x) => x.poiId === 'poi-003').listen, 0); // địa điểm chưa có sự kiện vẫn có dòng 0
  assert.deepEqual(st.body.byLang.find((x) => x.lang === 'zh'), { lang: 'zh', listen: 0, qrScan: 1 });
  assert.deepEqual(st.body.bySource.map((x) => x.source).sort(), ['auto', 'manual']);
  assert.equal(st.body.byPoiLang.length, 3);
});

test('địa điểm bị tắt (active = false) không hiện công khai và không nhận sự kiện', async () => {
  const body = validPoi({ active: false });
  const created = await s.api('POST', '/api/admin/pois', { token: adminToken, body });
  const id = created.body.id;
  const pub = await s.api('GET', '/api/pois');
  assert.equal(pub.body.some((p) => p.id === id), false);
  assert.equal((await s.api('POST', '/api/events', { body: { poiId: id, type: 'listen', lang: 'vi', source: 'auto' } })).status, 404);
  assert.equal((await s.api('GET', '/api/admin/pois', { token: adminToken })).body.some((p) => p.id === id), true);
});

test('presence chỉ tính heartbeat gần đây, phân biệt web/mobile và yêu cầu quyền xem thống kê', async () => {
  const presence = (sessionId, client) => s.api('POST', '/api/presence', { body: { sessionId, client } });
  assert.equal((await presence('session-web-0001', 'web')).status, 204);
  assert.equal((await presence('session-mobile-001', 'mobile')).status, 204);
  assert.equal((await presence('session-web-0001', 'web')).status, 204);
  assert.equal((await presence('invalid', 'web')).status, 400);
  assert.equal((await presence('session-other-0001', 'unknown')).status, 400);

  await s.db.query(`UPDATE online_sessions SET last_seen_at = now() - interval '3 minutes' WHERE session_id = $1`, ['session-mobile-001']);
  const online = await s.api('GET', '/api/admin/online', { token: adminToken });
  assert.equal(online.status, 200);
  assert.deepEqual(online.body, { total: 1, byClient: { web: 1, mobile: 0 } });
  assert.equal((await s.api('GET', '/api/admin/online')).status, 401);
  assert.equal((await s.api('GET', '/api/admin/online', { token: editorToken })).status, 200);
});

test('quản lý tài khoản: tạo, trùng email, không tự khóa mình, khóa người khác thì token hết tác dụng', async () => {
  const mk = (email) => s.api('POST', '/api/admin/users', { token: adminToken, body: { email, fullName: 'Người mới', role: 'editor', password: 'matkhau-moi-1' } });
  const c = await mk('moi@test.vn');
  assert.equal(c.status, 201);
  assert.equal((await mk('MOI@test.vn')).status, 409);
  assert.equal((await s.api('POST', '/api/admin/users', { token: adminToken, body: { email: 'x@test.vn', fullName: 'X', role: 'editor', password: 'ngan' } })).status, 400);

  const me = (await s.api('GET', '/api/auth/me', { token: adminToken })).body.user;
  assert.equal((await s.api('PATCH', `/api/admin/users/${me.id}`, { token: adminToken, body: { role: 'editor' } })).status, 400);
  assert.equal((await s.api('PATCH', `/api/admin/users/${me.id}`, { token: adminToken, body: { isActive: false } })).status, 400);

  const newToken = (await s.login('moi@test.vn', 'matkhau-moi-1')).body.token;
  assert.equal((await s.api('GET', '/api/auth/me', { token: newToken })).status, 200);
  assert.equal((await s.api('PATCH', `/api/admin/users/${c.body.id}`, { token: adminToken, body: { isActive: false } })).status, 200);
  assert.equal((await s.api('GET', '/api/auth/me', { token: newToken })).status, 401);
  assert.equal((await s.login('moi@test.vn', 'matkhau-moi-1')).status, 401);
});

test('đổi mật khẩu', async () => {
  await s.addAdmin('doi@test.vn', 'editor', 'mat-khau-cu-1');
  const t = (await s.login('doi@test.vn', 'mat-khau-cu-1')).body.token;
  assert.equal((await s.api('POST', '/api/auth/change-password', { token: t, body: { currentPassword: 'sai-mat-khau', newPassword: 'mat-khau-moi-1' } })).status, 400);
  assert.equal((await s.api('POST', '/api/auth/change-password', { token: t, body: { currentPassword: 'mat-khau-cu-1', newPassword: 'mat-khau-moi-1' } })).status, 200);
  assert.equal((await s.login('doi@test.vn', 'mat-khau-cu-1')).status, 401);
  assert.equal((await s.login('doi@test.vn', 'mat-khau-moi-1')).status, 200);
});

test('đăng nhập sai quá nhiều lần thì bị giới hạn (429)', async () => {
  let last;
  for (let i = 0; i < 11; i += 1) last = await s.login('admin@test.vn', `sai-${i}`);
  assert.equal(last.status, 429);
});
