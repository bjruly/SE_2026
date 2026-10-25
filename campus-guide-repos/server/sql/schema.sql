-- Lược đồ cơ sở dữ liệu (PostgreSQL). Chạy lại nhiều lần không lỗi (IF NOT EXISTS).
-- Chạy bằng:  npm run db:schema

-- Ngôn ngữ hỗ trợ
CREATE TABLE IF NOT EXISTS languages (
  code text PRIMARY KEY,
  name text NOT NULL
);

-- Tài khoản dashboard. Vai trò: 'admin' (Quản trị) hoặc 'editor' (Biên tập)
CREATE TABLE IF NOT EXISTS admins (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_idx ON admins (lower(email));

-- Bộ đếm để sinh mã địa điểm poi-001, poi-002, ...
CREATE SEQUENCE IF NOT EXISTS poi_number_seq;

-- Địa điểm
CREATE TABLE IF NOT EXISTS pois (
  id text PRIMARY KEY,
  qr_code text NOT NULL UNIQUE,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  radius_meters integer NOT NULL CHECK (radius_meters BETWEEN 1 AND 1000),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bản dịch (tên, mô tả, đường dẫn audio) của từng địa điểm theo từng ngôn ngữ
CREATE TABLE IF NOT EXISTS poi_translations (
  poi_id text NOT NULL REFERENCES pois (id) ON DELETE CASCADE,
  lang text NOT NULL REFERENCES languages (code),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text NOT NULL CHECK (length(trim(description)) > 0),
  audio_url text,
  PRIMARY KEY (poi_id, lang)
);

-- Sự kiện thống kê (ẩn danh): lượt nghe và lượt quét QR. Không lưu vị trí hay thông tin cá nhân.
CREATE TABLE IF NOT EXISTS events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  poi_id text NOT NULL REFERENCES pois (id) ON DELETE CASCADE,
  lang text NOT NULL REFERENCES languages (code),
  event_type text NOT NULL CHECK (event_type IN ('listen', 'qr_scan')),
  source text CHECK (source IN ('auto', 'manual', 'qr')),
  client text CHECK (client IN ('web', 'mobile')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (event_type = 'listen' AND source IN ('auto', 'manual'))
    OR (event_type = 'qr_scan' AND source = 'qr')
  )
);
CREATE INDEX IF NOT EXISTS events_poi_time_idx ON events (poi_id, created_at);
CREATE INDEX IF NOT EXISTS events_type_time_idx ON events (event_type, created_at);
