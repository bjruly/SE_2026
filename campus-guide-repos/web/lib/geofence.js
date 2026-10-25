// Logic "vùng địa điểm" (geofence). Không phụ thuộc React nên kiểm thử được bằng Node.
// Bản sao giống hệt nằm ở mobile/src/lib/geofence.js — sửa ở đâu thì sửa cả hai nơi.

const EARTH_RADIUS_M = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

// Khoảng cách giữa 2 tọa độ {lat, lng} theo mét (công thức Haversine)
export function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Các địa điểm mà vị trí hiện tại đang nằm trong vùng, gần nhất đứng đầu
export function insideZones(position, pois) {
  return pois
    .map((poi) => ({
      poi,
      distance: distanceMeters(position, { lat: poi.latitude, lng: poi.longitude }),
    }))
    .filter((z) => z.distance <= z.poi.radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

// Theo dõi việc "đi vào vùng".
// - Chỉ báo khi chuyển từ ngoài vùng vào trong vùng (đứng yên trong vùng không báo lại).
// - Sau khi đã phát (markPlayed), phải chờ cooldownMs mới được báo lại cho cùng địa điểm.
// - Nhiều vùng chồng nhau: chọn địa điểm gần nhất.
// cooldownMs là giá trị tạm của bản demo, chưa phải quyết định cuối cùng của nhóm.
export function createGeofenceTracker({ cooldownMs = 60000 } = {}) {
  let inside = new Set();
  const lastPlayed = new Map();

  return {
    update(position, pois, nowMs = Date.now()) {
      const zones = insideZones(position, pois);
      const ids = new Set(zones.map((z) => z.poi.id));
      const entered = zones.filter((z) => {
        if (inside.has(z.poi.id)) return false;
        const last = lastPlayed.get(z.poi.id);
        return last === undefined || nowMs - last >= cooldownMs;
      });
      inside = ids;
      return {
        insideIds: ids,
        candidate: entered.length ? entered[0].poi : null,
        nearbyPois: zones.map((z) => z.poi),
      };
    },
    markPlayed(id, nowMs = Date.now()) {
      lastPlayed.set(id, nowMs);
    },
    // Quên trạng thái "đang ở trong vùng" (ví dụ khi mất vị trí), giữ nguyên thời gian nghỉ
    clearInside() {
      inside = new Set();
    },
    clearCooldowns() {
      lastPlayed.clear();
    },
    reset() {
      inside = new Set();
      lastPlayed.clear();
    },
  };
}
