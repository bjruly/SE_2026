// Xử lý nội dung mã QR (thuần JavaScript, kiểm thử được bằng Node)
// Tách mã địa điểm từ nội dung quét được: có thể là mã thuần (DHSG-POI-001) hoặc đường link (…/?qr=DHSG-POI-001)
export function extractCode(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/[?&](?:qr|poi)=([^&#\s]+)/i);
  if (m) {
    try {
      return decodeURIComponent(m[1]).trim();
    } catch {
      return m[1].trim();
    }
  }
  return s;
}

export function findPoiByCode(pois, code) {
  const c = String(code || '').trim().toLowerCase();
  if (!c) return null;
  return pois.find((p) => p.qrCode.toLowerCase() === c || p.id.toLowerCase() === c) || null;
}
