# campus-guide-web  (tên tạm, có thể đổi)

Phần giao diện web (React.js) của đồ án "Thuyết minh tự động đa ngôn ngữ" - chủ đề khuôn viên Đại học Sài Gòn.
Hướng 1: FE Dev + CD/CI.

## Phạm vi (đang là giả định, chưa xác nhận với thầy)
- Lõi: tự phát thuyết minh khi người dùng đi vào vùng của một địa điểm (GPS / geofence), theo cách hoạt động của file HTML hệ thống tham khảo.
- Chọn ngôn ngữ, xem danh sách / chi tiết địa điểm, nghe thuyết minh.
- Dự phòng: quét QR để mở địa điểm, dùng demo trong lớp.
- Web làm tới đâu so với mobile: CHƯA CHỐT.

## Cấu trúc
- `src/`       mã nguồn (components, pages, services, hooks, utils, i18n, assets)
- `mock-api/`  dữ liệu giả
- `docs/`      tài liệu chung của nhóm
- `tests/`     kiểm thử
- `.github/workflows/` CI/CD

## Khởi tạo dự án (CHƯA LÀM)
Bộ khung này chỉ có thư mục. Công cụ khởi tạo web (ví dụ Vite hay công cụ khác) chưa được chọn.
Sau khi chọn, khởi tạo theo tài liệu chính thức rồi gộp thư mục `src/` này vào.

## Chưa chốt
- Cách hiểu "tự động" theo thầy (đang chờ hỏi thầy)
- Ngôn ngữ phụ ngoài Việt và Anh
- Nguồn dữ liệu (đang dùng mock), công cụ chạy mock API
- Bán kính vùng, thời gian debounce / cooldown cho khuôn viên
- Web làm tới đâu
