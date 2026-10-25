-- Dữ liệu mẫu (3 điểm với tọa độ tạm). Chạy lại nhiều lần không lỗi.
-- Chạy bằng:  npm run db:seed

INSERT INTO languages (code, name) VALUES ('vi', 'Tiếng Việt'), ('en', 'English'), ('zh', '中文') ON CONFLICT (code) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-001', 'DHSG-POI-001', 10.76, 106.682, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'vi', 'Giới Thiệu về Trường Đại học Sài Gòn', 'Trường Đại học Sài Gòn là một trong những ngôi trường có bề dày lịch sử lâu đời và cảnh quan độc đáo bậc nhất tại Thành phố Hồ Chí Minh') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'en', 'Introduction to Saigon University', 'Saigon University is one of the universities with a long history and unique scenery in Ho Chi Minh City.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-001', 'zh', '介绍西贡大学', '西贡大学是胡志明市历史悠久、风景独特的知名学府之一。') ON CONFLICT (poi_id, lang) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-002', 'DHSG-POI-002', 10.7604, 106.682, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'vi', 'Cảnh quan sân trường', 'nổi bật với vẻ đẹp cổ kính, trầm mặc mang đậm dấu ấn lịch sử hơn một thế kỷ giữa lòng Thành phố Hồ Chí Minh') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'en', 'Campus Scenery', 'It stands out with its ancient and quiet beauty, bearing the historical mark of over a century in the heart of Ho Chi Minh City.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-002', 'zh', '校园风景', '它以古老而宁静的美丽脱颖而出，承载着胡志明市百年历史的印记。') ON CONFLICT (poi_id, lang) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-003', 'DHSG-POI-003', 10.76, 106.6824, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'vi', 'Kiến trúc trăm tuổi phong cách Pháp lẫn Trung Hoa', 'Cổng mặt tiền tòa nhà B mang đặc trưng kiến trúc thấp tầng với mái đón, cửa sổ dạng vòm, đắp nổi những viên gạch gốm men xanh. Hình tượng rồng mây được khảm nổi.Đây là dãy phòng học đầu tiên được xây dựng, khánh thành và đưa vào sử dụng từ năm 1910.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'en', 'Centennial Architecture with French and Chinese Styles', 'The front gate of Building B features low-rise architecture with a welcoming roof, arched windows, and embossed green ceramic tiles. The dragon and cloud motifs are inlaid in relief. This was the first row of classrooms built, inaugurated, and put into use in 1910.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-003', 'zh', '百年历史的法中风格建筑', 'B楼的正门采用低层建筑风格，设有迎宾屋顶、拱形窗户，并镶嵌绿色陶瓷砖。龙云图案以浮雕形式镶嵌。这是第一排教室，于1910年建成、启用。') ON CONFLICT (poi_id, lang) DO NOTHING;

-- Đặt bộ đếm mã địa điểm để địa điểm mới nối tiếp (poi-004, poi-005, ...)
SELECT setval(
  'poi_number_seq',
  GREATEST(m.n, 1),
  m.n > 0
) FROM (
  SELECT COALESCE(MAX(substring(id FROM 5)::int), 0) AS n FROM pois WHERE id ~ '^poi-[0-9]+$'
) AS m;
