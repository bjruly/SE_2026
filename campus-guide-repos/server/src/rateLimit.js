// Giới hạn số lần thử đăng nhập theo (địa chỉ IP + email), lưu trong bộ nhớ.
// Lưu ý: chạy trên serverless thì bộ nhớ không dùng chung giữa các bản chạy, nên đây chỉ làm chậm kẻ đoán mật khẩu, không chặn tuyệt đối.
export function createLimiter({ max, windowMs }) {
  const hits = new Map();
  return {
    check(key, now = Date.now()) {
      const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
      hits.set(key, list);
      return list.length < max;
    },
    fail(key, now = Date.now()) {
      const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
      list.push(now);
      hits.set(key, list);
    },
    reset(key) {
      hits.delete(key);
    },
  };
}
