import pg from 'pg';

// Kết nối PostgreSQL. Giao diện chung cho cả bản chạy thật và bản kiểm thử:
//   db.query(text, params) -> { rows }
//   db.tx(async (q) => { ... })  chạy nhiều câu lệnh trong một giao dịch (lỗi thì hoàn tác tất cả)
//   db.close()
export function createPgDb(connectionString) {
  if (!connectionString) throw new Error('Chưa có DATABASE_URL.');
  const pool = new pg.Pool({
    connectionString,
    max: 5, // chạy trên serverless nên giữ số kết nối mỗi bản chạy thấp
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  return {
    query: (text, params) => pool.query(text, params),
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn((text, params) => client.query(text, params));
        await client.query('COMMIT');
        return result;
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch {
          /* bỏ qua */
        }
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
