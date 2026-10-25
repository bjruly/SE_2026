import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError, parse } from '../errors.js';
import { changePasswordBody, loginBody } from '../validation.js';
import { requireAuth } from '../middleware/auth.js';
import { createLimiter } from '../rateLimit.js';

const DUMMY_HASH = bcrypt.hashSync('khong-phai-mat-khau-that', 10);

export function authRoutes({ db, config }) {
  const r = Router();
  const limiter = createLimiter(config.loginRateLimit);
  const auth = requireAuth({ db, config });

  r.post('/login', async (req, res) => {
    const { email, password } = parse(loginBody, req.body);
    const key = `${req.ip}|${email.toLowerCase()}`;
    if (!limiter.check(key)) {
      throw new HttpError(429, 'TOO_MANY_ATTEMPTS', 'Đăng nhập sai quá nhiều lần, vui lòng thử lại sau');
    }
    const q = await db.query('SELECT * FROM admins WHERE lower(email) = lower($1)', [email]);
    const u = q.rows[0];
    // luôn so sánh mật khẩu (kể cả khi không có tài khoản) để thời gian phản hồi không lộ email nào tồn tại
    const ok = await bcrypt.compare(password, u ? u.password_hash : DUMMY_HASH);
    if (!u || !ok || !u.is_active) {
      limiter.fail(key);
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
    }
    limiter.reset(key);
    const token = jwt.sign({ sub: String(u.id), role: u.role }, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn,
    });
    res.json({ token, user: { id: u.id, email: u.email, fullName: u.full_name, role: u.role } });
  });

  r.get('/me', auth, (req, res) => {
    res.json({ user: req.user });
  });

  r.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = parse(changePasswordBody, req.body);
    const q = await db.query('SELECT password_hash FROM admins WHERE id = $1', [req.user.id]);
    const ok = await bcrypt.compare(currentPassword, q.rows[0].password_hash);
    if (!ok) throw new HttpError(400, 'WRONG_PASSWORD', 'Mật khẩu hiện tại không đúng');
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admins SET password_hash = $2, updated_at = now() WHERE id = $1', [req.user.id, hash]);
    res.json({ ok: true });
  });

  return r;
}
