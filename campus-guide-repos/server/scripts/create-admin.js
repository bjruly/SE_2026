// Tạo tài khoản Quản trị (admin) đầu tiên từ ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME trong .env.
// Chạy bằng:  npm run admin:create
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const email = (process.env.ADMIN_EMAIL || '').trim();
const password = process.env.ADMIN_PASSWORD || '';
const fullName = (process.env.ADMIN_NAME || 'Quản trị viên').trim();

if (!process.env.DATABASE_URL) {
  console.error('Chưa có DATABASE_URL. Hãy tạo file .env từ .env.example.');
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('ADMIN_EMAIL không hợp lệ.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('ADMIN_PASSWORD phải có ít nhất 8 ký tự.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const hash = await bcrypt.hash(password, 10);
  const r = await client.query(
    `INSERT INTO admins (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (lower(email)) DO NOTHING
     RETURNING id`,
    [email, hash, fullName],
  );
  console.log(r.rows.length ? `Đã tạo tài khoản Quản trị: ${email}` : `Tài khoản ${email} đã tồn tại, không thay đổi gì.`);
} catch (err) {
  console.error('Lỗi:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
