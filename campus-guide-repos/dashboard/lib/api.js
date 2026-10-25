// Gọi backend. Token đăng nhập lưu trong localStorage của trình duyệt.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
export const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL || '').replace(/\/$/, '');

const KEY = 'tm_token';

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* bỏ qua */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* bỏ qua */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa và NEXT_PUBLIC_API_URL.');
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* không phải JSON */
  }
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('tm-unauthorized'));
    }
    throw new ApiError(res.status, data?.error?.message || `Lỗi ${res.status}`, data?.error?.details);
  }
  return data;
}
