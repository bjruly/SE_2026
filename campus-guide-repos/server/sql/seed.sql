-- Dữ liệu mẫu (3 điểm với tọa độ tạm). Chạy lại nhiều lần không lỗi.
-- Chạy bằng:  npm run db:seed

INSERT INTO languages (code, name) VALUES ('vi', 'Tiếng Việt'), ('en', 'English'), ('zh', '中文') ON CONFLICT (code) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-001', 'DHSG-POI-001', 10.76, 106.682, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'vi', 'Điểm mẫu 1', 'Đây là nội dung thuyết minh mẫu của điểm số một.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'en', 'Sample point 1', 'This is the sample narration for point number one.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'zh', '示例地点 1', '这是第一个地点的示例讲解内容。') ON CONFLICT (poi_id, lang) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-002', 'DHSG-POI-002', 10.7604, 106.682, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'vi', 'Điểm mẫu 2', 'Đây là nội dung thuyết minh mẫu của điểm số hai.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'en', 'Sample point 2', 'This is the sample narration for point number two.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'zh', '示例地点 2', '这是第二个地点的示例讲解内容。') ON CONFLICT (poi_id, lang) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-003', 'DHSG-POI-003', 10.76, 106.6824, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'vi', 'Điểm mẫu 3', 'Đây là nội dung thuyết minh mẫu của điểm số ba.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'en', 'Sample point 3', 'This is the sample narration for point number three.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'zh', '示例地点 3', '这是第三个地点的示例讲解内容。') ON CONFLICT (poi_id, lang) DO NOTHING;

-- Đặt bộ đếm mã địa điểm để địa điểm mới nối tiếp (poi-004, poi-005, ...)
SELECT setval(
  'poi_number_seq',
  GREATEST(m.n, 1),
  m.n > 0
) FROM (
  SELECT COALESCE(MAX(substring(id FROM 5)::int), 0) AS n FROM pois WHERE id ~ '^poi-[0-9]+$'
) AS m;
