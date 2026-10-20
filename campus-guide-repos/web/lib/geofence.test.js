import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceMeters, insideZones, createGeofenceTracker } from './geofence.js';
import pois from '../data/pois.json' with { type: 'json' };

const at = (poi) => ({ lat: poi.latitude, lng: poi.longitude });
const FAR = { lat: 10.7640, lng: 106.6900 };

test('khoảng cách 1 độ vĩ độ xấp xỉ 111 km', () => {
  const d = distanceMeters({ lat: 10, lng: 106 }, { lat: 11, lng: 106 });
  assert.ok(Math.abs(d - 111195) < 300);
});

test('đứng đúng tại điểm thì nằm trong vùng, ở xa thì không', () => {
  assert.equal(insideZones(at(pois[0]), pois)[0].poi.id, 'poi-001');
  assert.equal(insideZones(FAR, pois).length, 0);
});

test('đi vào vùng thì báo đúng 1 lần, đứng yên không báo lại', () => {
  const t = createGeofenceTracker({ cooldownMs: 1000 });
  assert.equal(t.update(FAR, pois, 0).candidate, null);
  const r1 = t.update(at(pois[0]), pois, 1000);
  assert.equal(r1.candidate.id, 'poi-001');
  t.markPlayed('poi-001', 1000);
  assert.equal(t.update(at(pois[0]), pois, 2000).candidate, null);
});

test('ra rồi vào lại trong thời gian nghỉ thì không báo; sau thời gian nghỉ thì báo', () => {
  const t = createGeofenceTracker({ cooldownMs: 5000 });
  t.update(FAR, pois, 0);
  t.markPlayed(t.update(at(pois[0]), pois, 1000).candidate.id, 1000);
  t.update(FAR, pois, 2000);
  assert.equal(t.update(at(pois[0]), pois, 3000).candidate, null);
  t.update(FAR, pois, 4000);
  assert.equal(t.update(at(pois[0]), pois, 7000).candidate.id, 'poi-001');
});

test('nhiều vùng chồng nhau thì chọn điểm gần nhất', () => {
  const a = { id: 'a', latitude: 10, longitude: 106, radiusMeters: 100 };
  const b = { id: 'b', latitude: 10.0003, longitude: 106, radiusMeters: 100 };
  const t = createGeofenceTracker();
  const r = t.update({ lat: 10.00025, lng: 106 }, [a, b], 0);
  assert.equal(r.candidate.id, 'b');
});
