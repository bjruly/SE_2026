# Campus Guide – Thuyết minh tự động đa ngôn ngữ (ĐHSG)

Đồ án môn học, **hướng 1: FE Dev** (React Native + React.js, gồm CD/CI). Nhóm 3 thành viên, giao tiếp và nộp bài qua GitHub.

Hệ thống tự động phát thuyết minh theo ngôn ngữ người dùng chọn (Việt, Anh, Trung) khi họ đi vào vùng của một địa điểm trong khuôn viên Đại học Sài Gòn. Repository gồm **web (PWA)**, **app di động (Expo)**, **backend + PostgreSQL** và **dashboard quản trị**.

> **Trạng thái:** bản demo chạy được, dùng **3 điểm mẫu với tọa độ tạm**. Web đang chạy trên Vercel. Backend, database và dashboard mới chạy thử trên máy, **chưa triển khai thật**. Xem mục "Chưa xác định".

## Cấu trúc repository

```
(thư mục gốc của repository)
├─ README.md                      file này: giới thiệu repository, thành viên, nhật ký
├─ .github/workflows/             CD/CI (ci.yml của nhóm, server-dashboard-ci.yml)
└─ campus-guide-repos/
   ├─ README.md                   tổng quan dự án: chức năng, cách chạy, triển khai, đã kiểm tra gì
   ├─ web/                        web PWA (Next.js, MapLibre)
   ├─ mobile/                     app di động (Expo, React Native)
   ├─ server/                     backend API + SQL (Express, PostgreSQL), có docs/ERD.md
   ├─ dashboard/                  trang quản trị (Next.js)
   └─ qr-samples/                 3 ảnh mã QR mẫu
```

Repository dùng **1 repo chung** cho tất cả các phần.

## Thành viên và phân công

| STT | Họ tên | MSSV | GitHub | Công việc phụ trách | Vai trò |
|---|---|---|---|---|---|
| 1 | Trần Lê Gia Bảo | 3124411038  |  |  | Nhóm trưởng |
| 2 | Tô Thành Nhân  | 3124411198  |  |  | Thành Viên |
| 3 |  Lê Đăng Tiến | 3124411311  |  |  | Thành Viên |

## Mốc quan trọng (theo slide của thầy)

- Tuần 7: kiểm tra tiến độ giữa kỳ
- Tuần 11, 12: báo cáo cuối kỳ (đồ án)

## Bắt đầu nhanh

Cần cài **Node.js** (bản LTS, khuyến nghị 22 trở lên). Mọi lệnh `npm` phải chạy **bên trong thư mục của từng phần** (`web`, `mobile`, `server`, `dashboard`), không chạy ở thư mục gốc hay `campus-guide-repos/`, vì `package.json` nằm trong các thư mục đó (chạy sai chỗ sẽ báo lỗi `ENOENT ... package.json`).

```bash
# Chỉ xem web (không cần backend)
cd campus-guide-repos/web
npm install
npm run dev                 # mở http://localhost:3000
```

Chạy đầy đủ 4 phần (backend, web, dashboard, app) theo từng bước: xem `campus-guide-repos/README.md`.

## Đưa lên GitHub

Các lệnh dưới chạy ở thư mục gốc của repository. Thay `<URL-repo>` bằng địa chỉ repo của bạn:

```bash
git init
git add .
git commit -m "Bản demo đầy đủ: web, mobile, server, dashboard"
git branch -M main
git remote add origin <URL-repo>
git push -u origin main
```

Các thư mục nặng và file bí mật (`node_modules`, `.next`, `out`, `dist`, `.env`) đã được `.gitignore` của từng phần loại ra. **Không bao giờ đưa file `.env` (chứa mật khẩu database) lên GitHub.**

## Đã chốt

- Chủ đề: khuôn viên Đại học Sài Gòn. Ngôn ngữ: Việt, Anh, Trung. Lập trình bằng JavaScript.
- Web PWA (Next.js) và app React Native (Expo); tự động phát thuyết minh khi vào vùng địa điểm (GPS) là chức năng bắt buộc.
- Bản đồ: MapLibre + OpenFreeMap (có dự phòng OpenStreetMap), thay cho bản đồ CartoDB đang báo cần khóa API.
- Backend Node.js (Express) + PostgreSQL (Neon), SQL thuần. Dashboard là ứng dụng riêng, có 2 vai trò: Quản trị, Biên tập.
- Web và app gọi API, mất mạng hoặc API lỗi thì dùng `pois.json` dự phòng.
- Thống kê lượt nghe và lượt quét QR theo địa điểm và ngôn ngữ (ẩn danh, không lưu vị trí).
- Âm thanh hiện là giọng đọc của thiết bị; về sau muốn dùng file audio của nhóm.
- CD/CI bắt buộc. Dùng 1 repo, tên folder dự án là `campus-guide-repos`.

## Chưa xác định (cần nhóm quyết hoặc hỏi thầy)

- Backend và database nằm trong hướng 1 (FE) hay thuộc hướng 2, 3 của slide? Nên hỏi thầy.
- Nghĩa chính xác của "tự động" theo thầy, và thầy cần thấy gì ở mốc tuần 7.
- Triển khai thật server và dashboard (Vercel, Neon); CD cho app mobile tới mức nào.
- Dữ liệu thật của các địa điểm trong khuôn viên; thời điểm chuyển sang file audio riêng.
- Loại UML mà môn học yêu cầu (chưa vẽ).

## Nhật ký

> Ngày ghi "ước tính" là ngày suy ra từ dấu thời gian của file hoặc ảnh chụp, chưa chắc chính xác. Nhóm đối chiếu và sửa lại cho đúng.

| Ngày | Việc đã làm |
|---|---|
| ~12/10/2026 (ước tính) | Nhận đề từ slide của thầy (3 hướng), chọn hướng 1 (FE). Đọc file mô tả hệ thống du lịch ẩm thực Quận 4 để tham khảo. Soạn PRD và Use Case bản đầu, sau đó hủy để làm lại. Nhận và đọc bài mẫu của bạn (các file user story). |
| ~12–13/10/2026 (ước tính) | Chốt chủ đề khuôn viên ĐHSG. Dựng bộ khung folder đầu tiên (web, mobile); chốt hướng GPS làm lõi, QR dự phòng. |
| ~14/10/2026 (ước tính) | Viết PRD bản ĐHSG đầu tiên. |
| 19/10/2026 | Đọc báo cáo của nhóm (viết cho ẩm thực Quận 4) rồi quay lại chủ đề ĐHSG. Chốt nền tảng web PWA (Next.js) và app React Native (Expo), ngôn ngữ Việt, Anh, Trung, JavaScript, dữ liệu mẫu trong mã nguồn. Dựng bản demo web và mobile. |
| 20/10/2026 | Chốt tên folder `campus-guide-repos` và dùng 1 repo. Tạo README giới thiệu repository. Gặp lỗi `npm error ENOENT ... package.json` khi chạy `npm run dev` ở sai thư mục; cách xử lý: `cd web` trước. |
| ~23/10/2026 (ước tính) | Thiết lập CD/CI bằng GitHub Actions (Web CI, Mobile CI, Deploy lên GitHub Pages). Deploy GitHub Pages lỗi 404 do chưa bật Pages trong Settings; cách xử lý: Settings > Pages > Source: GitHub Actions. |
| 24/10/2026 | Web chạy trên Vercel (`se-2026-psi.vercel.app`). Phát hiện bản đồ CartoDB báo "API KEY REQUIRED". Chốt hướng: bản đồ MapLibre + OpenFreeMap, backend Node.js (`server/`), database PostgreSQL (Neon), dashboard riêng (`dashboard/`), 2 vai trò admin, web/app gọi API có dữ liệu dự phòng. |
| 25/10/2026 | Đổi bản đồ web và app sang MapLibre + OpenFreeMap (dự phòng OpenStreetMap). Viết backend (API, `schema.sql`, `seed.sql`, đăng nhập, phân quyền, thống kê), dashboard (địa điểm, mã QR, thống kê, tài khoản), nối web/app với API và ghi sự kiện thống kê. Viết README, sơ đồ ERD và workflow CI cho server/dashboard. |
| 25/10/2026 | Hỏi cách cập nhật web đang chạy trên Vercel (`se-2026-psi.vercel.app`, bản cũ) lên bản mới. Xác định: chỉ cần đẩy code mới lên GitHub là Vercel tự triển khai lại; muốn dùng backend thì phải triển khai `server/` trước, rồi đặt `NEXT_PUBLIC_API_URL` cho web và thêm địa chỉ web vào `CORS_ORIGINS` của server. |
|  |  |
