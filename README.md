# Campus Guide – Thuyết minh tự động đa ngôn ngữ (ĐHSG)

Đồ án môn học, **hướng 1: FE Dev** (React Native + React.js, gồm CD/CI). Nhóm 3 thành viên, giao tiếp và nộp bài qua GitHub.

Ứng dụng tự động phát thuyết minh theo ngôn ngữ người dùng chọn (Việt, Anh, Trung) khi họ đi vào vùng của một địa điểm trong khuôn viên Đại học Sài Gòn. Repository này chứa **bản demo chạy được** cho cả **web (PWA, Next.js)** và **app di động (Expo, React Native)**.

> **Trạng thái:** bản demo chạy được, dùng **3 điểm mẫu với tọa độ tạm**. CD/CI chưa được làm. Xem mục "Chưa xác định" bên dưới.

## Cấu trúc repository

```
(thư mục gốc của repository)
├─ README.md                 file này: giới thiệu repository, thành viên, nhật ký
└─ campus-guide-repos/
   ├─ README.md              tổng quan dự án: chức năng, cách chạy, thay dữ liệu thật
   ├─ web/                   web PWA (Next.js, JavaScript)
   ├─ mobile/                app di động (Expo, JavaScript)
   └─ qr-samples/            3 ảnh mã QR mẫu để thử chức năng quét
```

Repository dùng **1 repo chung** cho cả web và mobile.

## Thành viên và phân công

| STT | Họ tên | MSSV | GitHub | Công việc phụ trách | Vai trò |
|---|---|---|---|---|---|
| 1 | Trần Lê Gia Bảo | 3124411038  |  |  | Nhóm trưởng |
| 2 | Tô Thành Nhân  | 3124411198  |  |  | Thành Viên |
| 3 |  |  |  |  |  |

## Mốc quan trọng (theo slide của thầy)

- Tuần 7: kiểm tra tiến độ giữa kỳ
- Tuần 11, 12: báo cáo cuối kỳ (đồ án)

## Bắt đầu nhanh

Cần cài **Node.js** (bản LTS, khuyến nghị 22 trở lên).

```bash
# Web
cd campus-guide-repos/web
npm install
npm run dev              # mở http://localhost:3000

# App di động (cần ứng dụng Expo Go trên điện thoại, cùng Wi-Fi với máy tính)
cd campus-guide-repos/mobile
npm install
npx expo start           # quét mã QR trên terminal bằng Expo Go
```

Hướng dẫn chi tiết và cách xử lý lỗi thường gặp: xem `campus-guide-repos/README.md`, `campus-guide-repos/web/README.md` và `campus-guide-repos/mobile/README.md`.

## Đưa lên GitHub

Các lệnh dưới chạy ở thư mục gốc của repository (nơi có file README.md này). Thay `<URL-repo>` bằng địa chỉ repo bạn tạo trên GitHub:

```bash
git init
git add .
git commit -m "Bản demo đầu tiên"
git branch -M main
git remote add origin <URL-repo>
git push -u origin main
```

Các thư mục nặng (`node_modules`, `.next`, `out`, `dist`) đã được `.gitignore` của `web/` và `mobile/` loại ra.

## Đã chốt

- Chủ đề: khuôn viên Đại học Sài Gòn.
- Hướng 1 (FE): web PWA (React.js, dùng Next.js) và app React Native (dùng Expo), ngôn ngữ JavaScript.
- Tự động phát thuyết minh khi vào vùng địa điểm (GPS) là chức năng bắt buộc.
- Ngôn ngữ: Việt, Anh, Trung.
- Chức năng khác: xem bản đồ và vị trí hiện tại, danh sách và chi tiết địa điểm, phát/tạm dừng/dừng bằng tay, quét QR.
- Bản đồ: Leaflet + OpenStreetMap cho cả web và app. Dữ liệu địa điểm: file JSON trong mã nguồn, không có backend.
- Âm thanh hiện là giọng đọc của thiết bị; về sau muốn dùng file audio của nhóm.
- CD/CI là bắt buộc. Dùng 1 repo, tên folder dự án là `campus-guide-repos`.

## Chưa xác định (cần nhóm quyết hoặc hỏi thầy)

- **CD/CI:** Đã thiết lập hoàn chỉnh qua GitHub Actions (`.github/workflows/ci.yml`): tự động chạy Unit Test, build Next.js (Web), bundle Expo (Mobile) và tự động triển khai (CD) Web lên GitHub Pages.
- Nghĩa chính xác của "tự động" theo thầy, và thầy cần thấy gì ở mốc tuần 7.
- Dữ liệu thật của các địa điểm trong khuôn viên; thời điểm chuyển sang file audio riêng.
- Loại UML mà môn học yêu cầu.

## Nhật ký

> Ngày ghi "ước tính" là ngày suy ra từ dấu thời gian của các file, chưa chắc chính xác. Nhóm đối chiếu và sửa lại cho đúng.

| Ngày | Việc đã làm |
|---|---|
| 12/10/2026 | Nhận đề từ slide của thầy (3 hướng), chọn hướng 1 (FE). Đọc file mô tả hệ thống du lịch ẩm thực Quận 4 để tham khảo. Soạn PRD và Use Case bản đầu, sau đó hủy để làm lại. Nhận và đọc bài mẫu của bạn (các file user story). |
| ~12–13/10/2026 | Chốt chủ đề khuôn viên ĐHSG. Dựng bộ khung folder đầu tiên (web, mobile); chốt hướng GPS làm lõi, QR dự phòng. |
| ~14/10/2026 | Viết PRD bản ĐHSG đầu tiên. |
| 19/10/2026 | Đọc báo cáo của nhóm (viết cho ẩm thực Quận 4) rồi quay lại chủ đề ĐHSG. Chốt nền tảng web PWA (Next.js) và app React Native (Expo), ngôn ngữ Việt, Anh, Trung, JavaScript, bản đồ Leaflet + OpenStreetMap, dữ liệu mẫu trong mã nguồn. Dựng bản demo web và mobile. |
| 20/10/2026 | Chốt tên folder `campus-guide-repos` và dùng 1 repo. Tạo README giới thiệu repository (file này), tách README dự án vào `campus-guide-repos/README.md`. Bổ sung các dòng nhật ký trước 19/10. |
| 23/10/2026 | Sửa lỗi cú pháp Web QrScanner; đồng bộ Expo SDK 57 cho Mobile; thiết lập quy trình CI/CD hoàn chỉnh bằng GitHub Actions (`.github/workflows/ci.yml`). |
|  |  |
