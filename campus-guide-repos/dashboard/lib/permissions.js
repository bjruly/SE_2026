// Bản sao bảng quyền của backend (server/src/permissions.js) CHỈ để ẩn/hiện nút cho gọn.
// Backend mới là nơi quyết định cuối cùng; nếu sửa ở đây thì phải sửa cả bên backend.
const PERMISSIONS = {
  'poi:create': ['admin', 'editor'],
  'poi:update': ['admin', 'editor'],
  'poi:delete': ['admin'],
  'stats:read': ['admin', 'editor'],
  'user:manage': ['admin'],
};

export function can(role, permission) {
  return (PERMISSIONS[permission] || []).includes(role);
}

export const ROLE_LABEL = { admin: 'Quản trị', editor: 'Biên tập' };
