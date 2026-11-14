// Lấy dữ liệu địa điểm từ backend (API); nếu chưa cấu hình, lỗi hoặc mất mạng thì dùng file pois.json dự phòng.
// Ghi sự kiện thống kê (lượt nghe, lượt quét QR) gửi lên backend; lỗi thì bỏ qua, không làm phiền người dùng.
import fallbackPois from '@/data/pois.json';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
export { fallbackPois };

const EXTRA_LANGS = ['ja', 'ko', 'th', 'de'];

// Production API có thể được deploy trước dữ liệu dịch mới. Bổ sung fallback
// để người dùng không thấy nội dung trống trong lúc chờ cập nhật database.
function withLanguageFallback(pois) {
  return pois.map((poi) => {
    const fallback = fallbackPois.find((item) => item.id === poi.id);
    const name = { ...(poi.name || {}) };
    const description = { ...(poi.description || {}) };
    const audioUrl = { ...(poi.audioUrl || {}) };
    for (const lang of EXTRA_LANGS) {
      name[lang] ||= fallback?.name?.[lang] || name.en || '';
      description[lang] ||= fallback?.description?.[lang] || description.en || '';
      audioUrl[lang] ??= fallback?.audioUrl?.[lang] ?? null;
    }
    return { ...poi, name, description, audioUrl };
  });
}

// Áp dụng luôn cho dữ liệu cục bộ khi web chạy không có API.
withLanguageFallback(fallbackPois).forEach((poi, index) => Object.assign(fallbackPois[index], poi));

function isValidPoi(p) {
  return (
    p &&
    typeof p.id === 'string' &&
    typeof p.qrCode === 'string' &&
    typeof p.latitude === 'number' &&
    typeof p.longitude === 'number' &&
    typeof p.radiusMeters === 'number' &&
    p.name && p.description
  );
}

export async function fetchPois(timeoutMs = 6000) {
  if (!API_URL) throw new Error('Chưa cấu hình NEXT_PUBLIC_API_URL');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/api/pois`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.every(isValidPoi)) throw new Error('Dữ liệu từ API không đúng định dạng');
    return withLanguageFallback(data);
  } finally {
    clearTimeout(timer);
  }
}

// event: { poiId, type: 'listen' | 'qr_scan', lang, source?: 'auto' | 'manual' }
export function sendEvent(event) {
  if (!API_URL) return;
  try {
    fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, client: 'web' }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* bỏ qua */
  }
}

const PRESENCE_SESSION_KEY = 'tm_presence_session';
const FALLBACK_PRESENCE_SESSION_ID =
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

function getPresenceSessionId() {
  try {
    let sessionId = localStorage.getItem(PRESENCE_SESSION_KEY);
    if (!sessionId) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      sessionId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(PRESENCE_SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return FALLBACK_PRESENCE_SESSION_ID;
  }
}

export async function sendPresence() {
  if (!API_URL) return;
  const res = await fetch(`${API_URL}/api/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: getPresenceSessionId(), client: 'web' }),
    keepalive: true,
  });
  if (!res.ok) throw new Error(`Gửi online heartbeat thất bại (HTTP ${res.status})`);
}
