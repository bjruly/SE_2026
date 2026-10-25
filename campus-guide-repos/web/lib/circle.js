// Tạo hình tròn (đa giác nhiều cạnh) quanh một tọa độ với bán kính tính bằng mét,
// dùng để vẽ "vùng tự động phát" của địa điểm trên bản đồ.
export function circlePolygon(lat, lng, radiusMeters, steps = 48) {
  const R = 6371008.8; // bán kính Trái Đất (mét)
  const d = radiusMeters / R;
  const rad = Math.PI / 180;
  const phi1 = lat * rad;
  const lambda1 = lng * rad;
  const ring = [];
  for (let i = 0; i <= steps; i += 1) {
    const theta = (2 * Math.PI * i) / steps;
    const phi2 = Math.asin(Math.sin(phi1) * Math.cos(d) + Math.cos(phi1) * Math.sin(d) * Math.cos(theta));
    const lambda2 =
      lambda1 +
      Math.atan2(Math.sin(theta) * Math.sin(d) * Math.cos(phi1), Math.cos(d) - Math.sin(phi1) * Math.sin(phi2));
    ring.push([lambda2 / rad, phi2 / rad]);
  }
  return { type: 'Polygon', coordinates: [ring] };
}
