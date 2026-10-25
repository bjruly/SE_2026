// Chạy một file .sql trên database trong DATABASE_URL.  Ví dụ: node scripts/run-sql.js sql/schema.sql
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Thiếu đường dẫn file .sql. Ví dụ: node scripts/run-sql.js sql/schema.sql');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Chưa có DATABASE_URL. Hãy tạo file .env từ .env.example.');
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(file), 'utf8');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(sql);
  console.log(`Đã chạy xong ${file}`);
} catch (err) {
  console.error('Lỗi khi chạy SQL:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
