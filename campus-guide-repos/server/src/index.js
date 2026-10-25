// Điểm vào của backend.
// - Chạy trên máy:  npm run dev  (mở cổng PORT)
// - Chạy trên Vercel: Vercel tự nhận file này và dùng app được export mặc định bên dưới
import { loadConfig } from './config.js';
import { createPgDb } from './db.js';
import { createApp } from './app.js';

const config = loadConfig();
const db = createPgDb(config.databaseUrl);
const app = createApp({ db, config });

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend đang chạy tại http://localhost:${config.port}`);
  });
}

export default app;
