import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/create-app.js';
import { createPgDb } from '../src/db.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(dir, '..', 'sql', f), 'utf8');

export const config = {
  port: 0,
  databaseUrl: '',
  jwtSecret: 'x'.repeat(40),
  jwtExpiresIn: '1h',
  corsOrigins: [],
  qrPrefix: 'DHSG-',
  loginRateLimit: { max: 10, windowMs: 60000 },
};

// Mặc định kiểm thử bằng PGlite (PostgreSQL chạy trong bộ nhớ, không cần cài gì).
// Đặt TEST_DATABASE_URL để kiểm thử trên một PostgreSQL thật (database này sẽ bị XÓA SẠCH trước khi chạy).
export async function startServer() {
  let db;
  let pgInstance;
  if (process.env.TEST_DATABASE_URL) {
    db = createPgDb(process.env.TEST_DATABASE_URL);
    await db.query('DROP SCHEMA public CASCADE');
    await db.query('CREATE SCHEMA public');
    await db.query(read('schema.sql'));
    await db.query(read('seed.sql'));
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    pgInstance = new PGlite();
    await pgInstance.exec(read('schema.sql'));
    await pgInstance.exec(read('seed.sql'));
    db = {
      query: (text, params) => pgInstance.query(text, params),
      tx: (fn) => pgInstance.transaction((t) => fn((text, params) => t.query(text, params))),
      close: () => pgInstance.close(),
    };
  }
  const app = createApp({ db, config });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const api = async (method, url, { token, body } = {}) => {
    const res = await fetch(base + url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };

  const addAdmin = async (email, role, password = 'matkhau-123') => {
    const hash = await bcrypt.hash(password, 4);
    await db.query('INSERT INTO admins (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)', [email, hash, email, role]);
  };
  const login = async (email, password = 'matkhau-123') => (await api('POST', '/api/auth/login', { body: { email, password } }));

  const close = async () => {
    await new Promise((r) => server.close(r));
    await db.close();
  };
  return { db, api, addAdmin, login, close };
}
