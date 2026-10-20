// Giá trị cấu hình của bản demo (là giá trị tạm, chưa phải quyết định cuối cùng của nhóm)

// Thời gian nghỉ trước khi cùng một địa điểm được tự phát lại
export const COOLDOWN_MS = 60000;

// Nguồn ô bản đồ. Nếu bản đồ trong app bị trống, hãy thử đổi sang nhà cung cấp khác
// (ví dụ dịch vụ có khóa API) vì máy chủ OpenStreetMap có chính sách sử dụng riêng.
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap';
