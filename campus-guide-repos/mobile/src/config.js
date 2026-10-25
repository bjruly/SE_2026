// Giá trị cấu hình của bản demo (là giá trị tạm, chưa phải quyết định cuối cùng của nhóm)

// Thời gian nghỉ trước khi cùng một địa điểm được tự phát lại
export const COOLDOWN_MS = 60000;

// Địa chỉ backend (thư mục server). Để trống = chỉ dùng file src/data/pois.json và không ghi thống kê.
// Đặt trong file .env (xem .env.example). Lưu ý: điện thoại thật KHÔNG truy cập được "localhost" của máy tính,
// hãy dùng địa chỉ IP trong mạng (ví dụ http://192.168.1.10:4000) hoặc địa chỉ backend đã triển khai.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

// Nguồn bản đồ: mặc định OpenFreeMap (bản đồ vector, miễn phí, không cần khóa).
//   EXPO_PUBLIC_MAP_PROVIDER = openfreemap (mặc định) | osm (ô ảnh OpenStreetMap chuẩn)
//   EXPO_PUBLIC_MAP_STYLE_URL = đường dẫn style MapLibre tự chọn (ưu tiên cao nhất)
export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
export const MAP_STYLE =
  process.env.EXPO_PUBLIC_MAP_STYLE_URL || (process.env.EXPO_PUBLIC_MAP_PROVIDER === 'osm' ? 'osm' : OPENFREEMAP_STYLE);
