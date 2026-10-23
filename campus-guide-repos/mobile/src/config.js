// Giá trị cấu hình của bản demo (là giá trị tạm, chưa phải quyết định cuối cùng của nhóm)

// Thời gian nghỉ trước khi cùng một địa điểm được tự phát lại
export const COOLDOWN_MS = 60000;

// Nguồn ô bản đồ. Dùng CartoDB Voyager (miễn phí, không cần API key, ổn định).
// Nếu muốn đổi sang OpenStreetMap gốc: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
