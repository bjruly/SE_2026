// Khoảng cách đường chim bay theo công thức Haversine, đơn vị mét.
export function distanceMeters(a, b) {
  const R = 6371000
  const rad = n => n * Math.PI / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const lat1 = rad(a.lat)
  const lat2 = rad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '—'
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}