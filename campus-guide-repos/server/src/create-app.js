import express from 'express';
import cors from 'cors';
import { HttpError } from './errors.js';
import { publicRoutes } from './routes/public.js';
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';

// Tạo ứng dụng Express. Tách riêng khỏi entrypoint Vercel để dùng chung khi kiểm thử.
export function createApp({ db, config, expressFactory = express }) {
  const app = expressFactory();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, cb) {
        // Không có Origin (app di động, công cụ dòng lệnh) hoặc không giới hạn nguồn, hoặc nằm trong danh sách cho phép
        cb(null, !origin || config.corsOrigins.length === 0 || config.corsOrigins.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', publicRoutes({ db }));
  app.use('/api/auth', authRoutes({ db, config }));
  app.use('/api/admin', adminRoutes({ db, config }));

  app.use((_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Không tìm thấy đường dẫn')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Nội dung gửi lên không phải JSON hợp lệ' } });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: { code: 'TOO_LARGE', message: 'Nội dung gửi lên quá lớn' } });
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: { code: 'DUPLICATE', message: 'Dữ liệu bị trùng (ví dụ email đã tồn tại)' } });
    }
    console.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Lỗi máy chủ' } });
  });

  return app;
}
