-- Dữ liệu mẫu (6 địa điểm, mã 001-006). Chạy lại nhiều lần không lỗi.
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

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-004', 'DHSG-POI-004', 10.7596600504704, 106.68156140674834, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-004', 'vi', 'Sân bóng', E'Và đây là khu sân bóng của Trường Đại học Sài Gòn, nơi nhịp sống sinh viên trở nên sôi động nhất.\n\nSau những giờ học căng thẳng, các bạn sinh viên đến đây để chạy, để chơi bóng và để nạp lại năng lượng. Sân cũng là nơi diễn ra các giờ giáo dục thể chất của nhà trường.\n\nNhưng sân bóng này không chỉ để rèn luyện sức khỏe. Đây còn là nơi diễn ra những cuộc tranh tài giữa các khoa. Mỗi trận đấu là một câu chuyện về tinh thần đồng đội, về sự cố gắng và những tiếng cổ vũ vang lên từ bạn bè.\n\nGiữa trung tâm Quận 5 đông đúc, khoảng sân này như một nhịp thở nhẹ nhàng của trường. Ở đây, sinh viên giải tỏa áp lực, kết nối với nhau và tạo nên những kỷ niệm khó quên.\n\nXin mời quý khách cùng tiếp tục hành trình khám phá khuôn viên Trường Đại học Sài Gòn.') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-004', 'en', 'Football Field', E'And this is the football field of Saigon University, where student life becomes most vibrant.\n\nAfter demanding classes, students come here to run, play football, and recharge. The field is also used for the university''s physical education classes.\n\nBut this field is not only for exercise. It also hosts competitions between faculties. Every match tells a story of teamwork and perseverance, accompanied by friends cheering from the sidelines.\n\nAmid the bustle of District 5, this open space is like a gentle breath for the university. Here, students relieve stress, connect with one another, and create unforgettable memories.\n\nPlease continue your journey exploring the Saigon University campus.') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-004', 'zh', '足球场', E'这里是西贡大学的足球场，也是校园生活最热闹的地方。\n\n紧张的课程结束后，学生们来到这里跑步、踢球、恢复活力。这里也是学校开展体育课的场地。\n\n但这个足球场不仅用于锻炼身体，这里还举办各学院之间的比赛。每一场比赛都讲述着团队合作与努力拼搏的故事，也伴随着朋友们热情的加油声。\n\n在繁忙的第五郡中心，这片场地仿佛是校园的一次轻柔呼吸。在这里，学生们释放压力、彼此交流，并留下难忘的回忆。\n\n欢迎各位继续探索西贡大学校园。') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-005', 'DHSG-POI-005', 10.759058633501438, 106.68186891198688, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-005', 'vi', 'Khu D', 'Khu D là một trong những khu vực trong khuôn viên Trường Đại học Sài Gòn.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-005', 'en', 'Building D', 'Building D is one of the areas on the Saigon University campus.') ON CONFLICT (poi_id, lang) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-005', 'zh', 'D区', 'D区是西贡大学校园内的区域之一。') ON CONFLICT (poi_id, lang) DO NOTHING;

INSERT INTO pois (id, qr_code, latitude, longitude, radius_meters) VALUES ('poi-006', 'DHSG-POI-006', 10.7598811277565, 106.6825540799044, 25) ON CONFLICT (id) DO NOTHING;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-006', 'vi', 'Trung Tâm Học Liệu (KLF)', E'Và bây giờ, chúng ta đến với Trung tâm Học liệu của Trường Đại học Sài Gòn, hay còn gọi là KLF.\n\nĐây là địa chỉ quen thuộc của sinh viên khi cần tài liệu cho việc học. Ví dụ, các bạn sinh viên đến đây để nhận giáo trình cho các học phần tiếng Anh, cùng tài khoản học trực tuyến đi kèm.\n\nMọi thông tin về thời gian nhận tài liệu đều được cập nhật trên trang thông tin của thư viện nhà trường, giúp sinh viên chủ động sắp xếp thời gian.\n\nCó thể nói, Trung tâm Học liệu là nơi đồng hành cùng sinh viên trên hành trình học tập, từ những cuốn sách đầu tiên cho đến việc học trực tuyến.\n\nXin mời quý khách cùng tiếp tục hành trình khám phá khuôn viên Trường Đại học Sài Gòn.') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-006', 'en', 'Learning Resource Center (KLF)', E'And now, we arrive at Saigon University''s Learning Resource Center, also known as KLF.\n\nThis is a familiar place for students looking for learning materials. For example, students come here to receive textbooks for their English courses, along with the accompanying online learning account.\n\nInformation about collection times is updated on the university library''s information page, helping students plan their visits.\n\nThe Learning Resource Center accompanies students throughout their studies, from their first books to online learning.\n\nPlease continue your journey exploring the Saigon University campus.') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO poi_translations (poi_id, lang, name, description) VALUES ('poi-006', 'zh', '学习资源中心（KLF）', E'现在，我们来到西贡大学的学习资源中心，也就是大家熟知的KLF。\n\n学生需要学习资料时，常常会来到这里。例如，学生可以在这里领取英语课程的教材，以及配套的在线学习账号。\n\n领取资料的时间信息会在学校图书馆的信息页面上更新，方便学生提前安排时间。\n\n可以说，学习资源中心陪伴学生走过求学之路，从最初的书本学习到在线学习。\n\n欢迎各位继续探索西贡大学校园。') ON CONFLICT (poi_id, lang) DO UPDATE SET description = EXCLUDED.description;

-- Đặt bộ đếm mã địa điểm để địa điểm mới nối tiếp (poi-007, poi-008, ...)
-- Chuyển mã địa điểm cũ poi-007 sang poi-006 khi seed đã chạy ở phiên bản trước.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pois WHERE id = 'poi-007') THEN
    UPDATE events SET poi_id = 'poi-006' WHERE poi_id = 'poi-007';
    DELETE FROM pois WHERE id = 'poi-007';
  END IF;
END $$;

SELECT setval(
  'poi_number_seq',
  GREATEST(m.n, 1),
  m.n > 0
) FROM (
  SELECT COALESCE(MAX(substring(id FROM 5)::int), 0) AS n FROM pois WHERE id ~ '^poi-[0-9]+$'
) AS m;
