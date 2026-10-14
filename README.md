# SE_2026

# Thuyết minh tự động đa ngôn ngữ — Khuôn viên Đại học Sài Gòn

Đồ án môn học, **hướng 1: FE Dev** (React Native + React.js, gồm CD/CI). Nhóm 3 thành viên, giao tiếp và nộp bài qua GitHub.
Ý tưởng: app tự phát thuyết minh theo ngôn ngữ người dùng chọn khi họ đi vào vùng của một địa điểm trong khuôn viên.

> **Trạng thái:** đang ở giai đoạn lên kế hoạch, chưa có code. Nhiều quyết định còn là **giả định, chưa xác nhận với thầy** (xem phần Quyết định).
> Tài liệu chi tiết: `docs/PRD.md` (trong repo web).

## Thành viên và phân công

| STT | Họ tên | GitHub | Công việc phụ trách | Trạng thái |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## Mốc quan trọng
- Tuần 7: kiểm tra tiến độ giữa kỳ
- Tuần 11, 12: báo cáo cuối kỳ (đồ án)

## Nhật ký
> Ngày có ghi "ước tính" là ngày suy ra từ dấu thời gian file, chưa chắc chính xác. Hãy sửa lại cho đúng.

| Ngày | Việc đã làm |
|---|---|
| ~12/10/2026 (ước tính) | Nhận đề từ slide của thầy, chọn hướng 1 (FE). Soạn PRD và Use Case bản đầu, sau đó **hủy và làm lại** vì dựa trên giả định chưa đúng. Nhận và đọc bài mẫu của bạn (các file user story) để tham khảo cách làm. |
| ~12–13/10/2026 (ước tính) | Chốt chủ đề **khuôn viên ĐHSG**. Chọn (theo cảm tính, chưa hỏi thầy): 2 repo riêng (web, mobile), React Native CLI, mock API, JavaScript. Dựng bộ khung folder cho 2 repo. |
| ~13/10/2026 (ước tính) | Chọn cách hiểu phần "tự động" theo file HTML hệ thống tham khảo: **GPS/geofence làm lõi, QR làm dự phòng** để demo trong lớp. Sửa lại README và `src/services/README.md` cho khớp. |
| 14/10/2026 | Viết PRD mới cho ĐHSG, đánh dấu rõ phần chắc, giả định, chưa chốt. Đưa vào `docs/PRD.md`. |

## Quyết định
| Nội dung | Lựa chọn | Mức chắc chắn |
|---|---|---|
| Hướng, nhóm, mốc thời gian | Hướng 1, 3 người, tuần 7 và 11–12 | Chắc (theo slide) |
| Chủ đề | Khuôn viên ĐHSG | Chắc (nhóm đã chọn) |
| Cách hiểu "tự động" | GPS/geofence là lõi, QR dự phòng | Giả định, chưa hỏi thầy |
| Cấu trúc repo | 2 repo riêng, mỗi repo giữ bản sao dữ liệu mock | Giả định |
| Mobile | React Native CLI, JavaScript | Giả định |
| Nguồn dữ liệu | Mock API (dữ liệu giả) | Giả định |

## Việc tiếp theo
- [ ] Hỏi thầy các câu ở mục 12 của `docs/PRD.md` (nghĩa của "tự động", nguồn dữ liệu, ngôn ngữ, loại UML, yêu cầu CD)
- [ ] Vẽ UML (use case, activity, sequence...) sau khi thầy trả lời
- [ ] Chốt ngôn ngữ phụ ngoài Việt và Anh
- [ ] Thu thập nội dung thật các địa điểm trong khuôn viên (tên, mô tả, tọa độ)
- [ ] Chọn công cụ khởi tạo web, công cụ chạy mock API, thư viện GPS, TTS, QR
- [ ] Khởi tạo dự án web và mobile, gộp bộ khung vào
