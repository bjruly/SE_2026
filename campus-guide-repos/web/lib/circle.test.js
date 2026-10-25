import test from 'node:test';
import assert from 'node:assert/strict';
import { circlePolygon } from './circle.js';
import { distanceMeters } from './geofence.js';

test('mọi đỉnh của hình tròn cách tâm đúng bán kính (sai số dưới 0,5 m)', () => {
  const g = circlePolygon(10.76, 106.682, 25);
  const ring = g.coordinates[0];
  assert.equal(ring.length, 49);
  assert.deepEqual(ring[0], ring[48]); // vòng khép kín
  for (const [lng, lat] of ring) {
    const d = distanceMeters({ lat: 10.76, lng: 106.682 }, { lat, lng });
    assert.ok(Math.abs(d - 25) < 0.5, `khoảng cách ${d}`);
  }
});
