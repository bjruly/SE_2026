// Cấu hình bản đồ. Mặc định dùng OpenFreeMap (bản đồ vector miễn phí, không cần khóa API).
// Đổi nguồn bản đồ bằng biến môi trường (xem .env.example), không cần sửa code:
//   NEXT_PUBLIC_MAP_PROVIDER = openfreemap (mặc định) | osm
//   NEXT_PUBLIC_MAP_STYLE_URL = đường dẫn style MapLibre tự chọn (ưu tiên cao nhất)
export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Giới hạn xem quanh khuôn viên ĐHSG, tạm căn theo tọa độ các điểm mẫu.
export const CAMPUS_MAP_BOUNDS = [
  [106.6805, 10.7588],
  [106.6835, 10.7612],
];
export const CAMPUS_MAP_MIN_ZOOM = 16.5;
export const CAMPUS_MAP_INITIAL_ZOOM = 17.5;
export const CAMPUS_MAP_FIT_MAX_ZOOM = 18;
export const CAMPUS_MAP_MAX_ZOOM = 20;

// Style ô ảnh OpenStreetMap chuẩn, dùng khi chọn provider "osm" hoặc làm phương án dự phòng
export const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

export function getMapStyle() {
  const custom = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  if (custom) return custom;
  if (process.env.NEXT_PUBLIC_MAP_PROVIDER === 'osm') return OSM_RASTER_STYLE;
  return OPENFREEMAP_STYLE;
}
