// Điểm vào của backend.
// - Chạy trên máy:  npm run dev  (mở cổng PORT)
// - Chạy trên Vercel: Vercel tự nhận file này và dùng app được export mặc định bên dưới
import express from 'express';
import { loadConfig } from './config.js';
import { createPgDb } from './db.js';
import { createApp } from './create-app.js';

const config = loadConfig();
const db = createPgDb(config.databaseUrl);
const app = createApp({ db, config, expressFactory: express });

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend đang chạy tại http://localhost:${config.port}`);
  });
}

export default app;
