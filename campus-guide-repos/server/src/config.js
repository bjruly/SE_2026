import 'dotenv/config';

// Đọc cấu hình từ biến môi trường (file .env khi chạy trên máy, hoặc cài đặt của Vercel khi triển khai)
export function loadConfig(env = process.env) {
  const jwtSecret = env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET phải có ít nhất 32 ký tự. Hãy đặt trong file .env hoặc cài đặt môi trường.');
  }
  const configuredCorsOrigins = (env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const deployedClientOrigins = [
    'https://se-2026-psi.vercel.app',
    'https://dashboard-pearl-seven-93.vercel.app',
    'https://se2026-mobile-phi.vercel.app',
  ];

  return {
    port: Number(env.PORT) || 4000,
    databaseUrl: env.DATABASE_URL || '',
    jwtSecret,
    jwtExpiresIn: '8h',
    corsOrigins: [...new Set([...configuredCorsOrigins, ...deployedClientOrigins])],
    qrPrefix: 'DHSG-',
    loginRateLimit: { max: 10, windowMs: 15 * 60 * 1000 },
  };
}
