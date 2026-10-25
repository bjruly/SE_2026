import jwt from 'jsonwebtoken';
import { HttpError } from '../errors.js';
import { can } from '../permissions.js';

// Yêu cầu đăng nhập: đọc token từ header "Authorization: Bearer <token>",
// rồi tra lại tài khoản trong DB để luôn đúng vai trò hiện tại và bị chặn ngay nếu tài khoản đã bị khóa.
export function requireAuth({ db, config }) {
  return async (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Bạn chưa đăng nhập');
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new HttpError(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    const r = await db.query('SELECT id, email, full_name, role, is_active FROM admins WHERE id = $1', [Number(payload.sub)]);
    const u = r.rows[0];
    if (!u || !u.is_active) throw new HttpError(401, 'UNAUTHENTICATED', 'Tài khoản không tồn tại hoặc đã bị khóa');
    req.user = { id: u.id, email: u.email, fullName: u.full_name, role: u.role };
    next();
  };
}

export function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user || !can(req.user.role, permission)) {
      throw new HttpError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
}
