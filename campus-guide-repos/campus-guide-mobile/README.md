# campus-guide-mobile  (tên tạm, có thể đổi)

Phần app di động (React Native CLI, JavaScript) của đồ án "Thuyết minh tự động đa ngôn ngữ" - chủ đề khuôn viên Đại học Sài Gòn.
Hướng 1: FE Dev + CD/CI.

## Phạm vi (đang là giả định, chưa xác nhận với thầy)
- Lõi: tự phát thuyết minh khi người dùng đi vào vùng của một địa điểm (GPS / geofence), theo cách hoạt động của file HTML hệ thống tham khảo.
- Chọn ngôn ngữ, xem danh sách / chi tiết địa điểm, nghe thuyết minh.
- Dự phòng: quét QR để mở địa điểm, dùng demo trong lớp.

## Cấu trúc
- `src/`       mã nguồn (screens, navigation, components, services, hooks, utils, i18n, assets)
- `mock-api/`  dữ liệu giả (bản sao riêng của repo này)
- `__tests__/` kiểm thử
- `.github/workflows/` CI/CD

## Khởi tạo dự án (CHƯA LÀM)
React Native CLI tạo cả thư mục `android/` và `ios/` khi khởi tạo. Hãy khởi tạo theo tài liệu chính thức tại reactnative.dev,
rồi gộp `src/`, `mock-api/`, `.github/` của bộ khung này vào và đối chiếu `.gitignore`.
React Native CLI cần cài môi trường Android (và Xcode nếu muốn iOS) - kiểm tra yêu cầu hiện hành trong tài liệu chính thức.

## Chưa chốt
- Cách hiểu "tự động" theo thầy (đang chờ hỏi thầy)
- Ngôn ngữ phụ ngoài Việt và Anh
- Nguồn dữ liệu (đang dùng mock), công cụ chạy mock API
- Thư viện lấy GPS, giọng đọc (TTS), quét QR
- Bán kính vùng, thời gian debounce / cooldown cho khuôn viên
