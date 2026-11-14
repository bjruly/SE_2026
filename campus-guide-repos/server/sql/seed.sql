-- Dữ liệu mẫu đồng bộ với web/data/pois.json (3 địa điểm, mã 001-003).
-- Chạy bằng: npm run db:seed

INSERT INTO languages (code, name)
VALUES ('vi', 'Tiếng Việt'), ('en', 'English'), ('zh', '中文'),
  ('ja', '日本語'), ('ko', '한국어'), ('th', 'ภาษาไทย'), ('de', 'Deutsch')
ON CONFLICT (code) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters, active) VALUES
  ('poi-001', 'DHSG-POI-001', 10.76, 106.682, 25, true),
  ('poi-002', 'DHSG-POI-002', 10.7604, 106.682, 25, true),
  ('poi-003', 'DHSG-POI-003', 10.76, 106.6824, 25, true)
ON CONFLICT (id) DO UPDATE SET
  qr_code = EXCLUDED.qr_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  radius_meters = EXCLUDED.radius_meters,
  active = true,
  updated_at = now();

INSERT INTO poi_translations (poi_id, lang, name, description) VALUES
  ('poi-001', 'vi', 'Giới Thiệu về Trường Đại học Sài Gòn', 'Trường Đại học Sài Gòn là một trong những ngôi trường có bề dày lịch sử lâu đời và cảnh quan độc đáo bậc nhất tại Thành phố Hồ Chí Minh'),
  ('poi-001', 'en', 'Introduction to Saigon University', 'Saigon University is one of the universities with a long history and unique scenery in Ho Chi Minh City.'),
  ('poi-001', 'zh', '介绍西贡大学', '西贡大学是胡志明市历史悠久、风景独特的知名学府之一。'),
  ('poi-001', 'ja', 'サイゴン大学の紹介', 'サイゴン大学はホーチミン市にある、長い歴史と独特の景観を持つ大学です。'),
  ('poi-001', 'ko', '사이공대학교 소개', '사이공대학교는 오랜 역사와 독특한 경관을 가진 호찌민시의 대학교입니다.'),
  ('poi-001', 'th', 'แนะนำมหาวิทยาลัยไซ่ง่อน', 'มหาวิทยาลัยไซ่ง่อนเป็นมหาวิทยาลัยเก่าแก่ในนครโฮจิมินห์ที่มีทัศนียภาพโดดเด่น'),
  ('poi-001', 'de', 'Einführung in die Saigon-Universität', 'Die Saigon-Universität ist eine traditionsreiche Hochschule mit einer einzigartigen Landschaft in Ho-Chi-Minh-Stadt.'),
  ('poi-002', 'vi', 'Cảnh quan sân trường', 'nổi bật với vẻ đẹp cổ kính, trầm mặc mang đậm dấu ấn lịch sử hơn một thế kỷ giữa lòng Thành phố Hồ Chí Minh'),
  ('poi-002', 'en', 'Campus Scenery', 'It stands out with its ancient and quiet beauty, bearing the historical mark of over a century in the heart of Ho Chi Minh City.'),
  ('poi-002', 'zh', '校园风景', '它以古老而宁静的美丽脱颖而出，承载着胡志明市百年历史的印记。'),
  ('poi-002', 'ja', 'キャンパスの景観', 'このキャンパスは、ホーチミン市の百年の歴史を刻む、古く静かな美しさが特徴です。'),
  ('poi-002', 'ko', '캠퍼스 풍경', '이곳은 호찌민시의 100년 역사를 간직한 고요하고 오래된 아름다움이 돋보입니다.'),
  ('poi-002', 'th', 'ทัศนียภาพภายในมหาวิทยาลัย', 'สถานที่แห่งนี้โดดเด่นด้วยความงดงามเก่าแก่และเงียบสงบ ซึ่งสะท้อนประวัติศาสตร์กว่าศตวรรษของนครโฮจิมินห์'),
  ('poi-002', 'de', 'Campuslandschaft', 'Der Campus besticht durch seine alte, ruhige Schönheit und trägt die über hundertjährige Geschichte von Ho-Chi-Minh-Stadt in sich.'),
  ('poi-003', 'vi', 'Kiến trúc trăm tuổi phong cách Pháp lẫn Trung Hoa', 'Cổng mặt tiền tòa nhà B mang đặc trưng kiến trúc thấp tầng với mái đón, cửa sổ dạng vòm, đắp nổi những viên gạch gốm men xanh. Hình tượng rồng mây được khảm nổi. Đây là dãy phòng học đầu tiên được xây dựng, khánh thành và đưa vào sử dụng từ năm 1910.'),
  ('poi-003', 'en', 'Centennial Architecture with French and Chinese Styles', 'The front gate of Building B features low-rise architecture with a welcoming roof, arched windows, and embossed green ceramic tiles. The dragon and cloud motifs are inlaid in relief. This was the first row of classrooms built, inaugurated, and put into use in 1910.'),
  ('poi-003', 'zh', '百年历史的法中风格建筑', 'B楼的正门采用低层建筑风格，设有迎宾屋顶、拱形窗户，并镶嵌绿色陶瓷砖。龙云图案以浮雕形式镶嵌。这是第一排教室，于1910年建成、启用。')
  ,('poi-003', 'ja', 'フランスと中国の様式を持つ百年建築', 'B棟の正門はフランスと中国の様式を取り入れた建物で、1910年に建設されました。'),
  ('poi-003', 'ko', '프랑스와 중국 양식의 100년 건축물', 'B동 정문은 프랑스와 중국 양식이 어우러진 건축물로 1910년에 지어졌습니다.'),
  ('poi-003', 'th', 'สถาปัตยกรรมอายุกว่าศตวรรษแบบฝรั่งเศสและจีน', 'ประตูทางเข้าอาคาร B ผสมผสานสถาปัตยกรรมฝรั่งเศสและจีน และสร้างขึ้นในปี 1910'),
  ('poi-003', 'de', 'Hundert Jahre alte Architektur im französisch-chinesischen Stil', 'Das Eingangstor von Gebäude B verbindet französische und chinesische Architektur und wurde 1910 errichtet.')
ON CONFLICT (poi_id, lang) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Retain older demo records and their statistics, but hide them from public apps.
UPDATE pois
SET active = false, updated_at = now()
WHERE id IN ('poi-004', 'poi-005', 'poi-006', 'poi-007') AND active;

SELECT setval(
  'poi_number_seq',
  GREATEST(m.n, 1),
  m.n > 0
) FROM (
  SELECT COALESCE(MAX(substring(id FROM 5)::int), 0) AS n
  FROM pois
  WHERE id ~ '^poi-[0-9]+$'
) AS m;
