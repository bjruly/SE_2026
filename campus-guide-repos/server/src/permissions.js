// Bảng quyền theo vai trò. Muốn đổi ai được làm gì thì sửa ở đây (một chỗ duy nhất).
//   admin  = Quản trị (toàn quyền, quản lý tài khoản)
//   editor = Biên tập (thêm/sửa địa điểm, xem thống kê)
export const PERMISSIONS = {
  'poi:read': ['admin', 'editor'],
  'poi:create': ['admin', 'editor'],
  'poi:update': ['admin', 'editor'],
  'poi:delete': ['admin'],
  'stats:read': ['admin', 'editor'],
  'user:manage': ['admin'],
};

export const ROLES = ['admin', 'editor'];

export function can(role, permission) {
  return (PERMISSIONS[permission] || []).includes(role);
}
