import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCode, findPoiByCode } from './qr.js';

const pois = [
  { id: 'poi-001', qrCode: 'DHSG-POI-001' },
  { id: 'poi-002', qrCode: 'DHSG-POI-002' },
];

test('tách mã từ mã thuần và từ đường link', () => {
  assert.equal(extractCode('DHSG-POI-001'), 'DHSG-POI-001');
  assert.equal(extractCode('  DHSG-POI-002 '), 'DHSG-POI-002');
  assert.equal(extractCode('https://se-2026-psi.vercel.app/?qr=DHSG-POI-003'), 'DHSG-POI-003');
  assert.equal(extractCode('https://example.vn/?a=1&poi=poi-002#x'), 'poi-002');
  assert.equal(extractCode('https://example.vn/?qr=DHSG%2DPOI%2D001'), 'DHSG-POI-001');
  assert.equal(extractCode(''), '');
});

test('tìm địa điểm theo mã QR hoặc theo id, không phân biệt hoa thường', () => {
  assert.equal(findPoiByCode(pois, 'dhsg-poi-001').id, 'poi-001');
  assert.equal(findPoiByCode(pois, 'POI-002').qrCode, 'DHSG-POI-002');
  assert.equal(findPoiByCode(pois, 'khong-co'), null);
  assert.equal(findPoiByCode(pois, ''), null);
});
