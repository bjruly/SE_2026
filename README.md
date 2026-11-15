# Campus Guide – Thuyết minh tự động đa ngôn ngữ (ĐHSG)

Đồ án môn học, **hướng 1: FE Dev** (React Native + React.js, gồm CD/CI). Nhóm 3 thành viên, giao tiếp và nộp bài qua GitHub.

Hệ thống tự động phát thuyết minh theo ngôn ngữ người dùng chọn (hỗ trợ **7 ngôn ngữ**: Tiếng Việt, English, 中文, 日本語, 한국어, ภาษาไทย, Deutsch) khi họ đi vào vùng của một địa điểm trong khuôn viên Đại học Sài Gòn (cơ sở 273 An Dương Vương, Q.5). Repository gồm **web (PWA)**, **app di động (Expo SDK 58)**, **backend + PostgreSQL** và **dashboard quản trị**.

> **Trạng thái hiện tại:** Hệ thống đã hoàn thiện tính năng cho cả 4 thành phần. Web PWA đang chạy trực tiếp trên Vercel (`se-2026-psi.vercel.app`); ứng dụng di động hỗ trợ chạy qua Expo Go lẫn bản web trên Vercel; Dashboard đã tích hợp bộ chọn tọa độ bản đồ trực quan (`MapPicker`), nghe thử audio và thống kê trực tiếp; hệ thống hỗ trợ phát âm thanh qua file `audioUrl` riêng kèm cơ chế tự động chuyển sang giọng đọc thiết bị (TTS). Dữ liệu hiện đồng bộ 3 địa điểm tiêu biểu (DHSG-POI-001–003) với đầy đủ 7 ngôn ngữ.

> 💡 **Tài liệu vấn đáp / Control code:** Xem file [`HUONG-DAN-CONTROL-CODE.md`](./HUONG-DAN-CONTROL-CODE.md) để tra cứu nhanh vị trí code, giải thích luồng xử lý và các câu hỏi thường gặp khi bảo vệ đồ án.

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
   └─ qr-samples/                 3 ảnh QR; hiện chỉ mã 001–003 thuộc bộ demo hoạt động
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

## Đã chốt và hoàn thiện

- **Chủ đề & Phạm vi:** Khuôn viên Đại học Sài Gòn (cơ sở 273 An Dương Vương, Q.5).
- **Đa ngôn ngữ:** Hỗ trợ đầy đủ **7 ngôn ngữ** gồm Tiếng Việt (`vi`), English (`en`), 中文 (`zh`), 日本語 (`ja`), 한국어 (`ko`), ภาษาไทย (`th`), Deutsch (`de`) xuyên suốt Web, Mobile, Server và Dashboard.
- **Nền tảng người dùng:** Web PWA (Next.js 16 App Router) và ứng dụng di động (Expo SDK 58 / React Native).
- **Thuyết minh & Âm thanh:** Tự động phát thuyết minh khi vào vùng địa điểm (GPS / Geofence Haversine) và quét mã QR. Hỗ trợ phát file âm thanh riêng (`audioUrl`) với cơ chế tự động chuyển sang giọng đọc thiết bị (Web Speech API / `expo-speech`) khi không có file hoặc file gặp sự cố; hỗ trợ đầy đủ các nút điều khiển Phát, Tạm dừng, Tiếp tục, Dừng.
- **Bản đồ:** MapLibre GL JS vector (OpenFreeMap) với cơ chế tự động dự phòng sang ô ảnh OpenStreetMap nếu mất kết nối style.
- **Dashboard quản trị:** Ứng dụng Next.js riêng biệt với 2 vai trò phân quyền (Quản trị, Biên tập). Tích hợp bộ chọn tọa độ bản đồ trực quan (`MapPicker`), nghe thử file audio, tạo & tải ảnh mã QR (kiểu mã và liên kết), theo dõi thống kê đa chiều và phiên online theo thời gian thực.
- **Backend & Database:** Node.js (Express 5) + PostgreSQL (Neon), SQL thuần với kết nối pool, băm mật khẩu `bcryptjs`, xác thực JWT 8 giờ, giới hạn tần suất đăng nhập và kiểm tra dữ liệu bằng `zod`.
- **Dữ liệu dự phòng:** Web và app tự động dùng file `pois.json` dự phòng nội bộ nếu API chưa cấu hình hoặc mất mạng.
- **CD/CI:** GitHub Actions tự động kiểm thử và build cho cả Web, Mobile, Server và Dashboard; hỗ trợ triển khai tự động lên GitHub Pages và Vercel.
- **Tài liệu thiết kế:** Đã hoàn thiện tài liệu sơ đồ luồng dữ liệu ([`DFD.md`](./campus-guide-repos/docs/DFD.md)), sơ đồ thực thể liên kết ([`ERD.md`](./campus-guide-repos/server/docs/ERD.md)), và tài liệu đặc tả yêu cầu chi tiết ([`PRD.md`](./campus-guide-repos/PRD-HeThong-ThuyetMinh-DHSG/PRD/PRD-HeThong-ThuyetMinh-DHSG.md)).

## Kế hoạch báo cáo cuối kỳ

- **Dữ liệu thực địa:** Tiếp tục khảo sát và tinh chỉnh tọa độ GPS thực tế của các công trình trong khuôn viên ĐHSG để tăng độ chính xác ngoài sân trường.
- **Triển khai chính thức:** Triển khai Backend và Database lên dịch vụ đám mây (Neon + Vercel) để kết nối trực tiếp với bản Web và Mobile phục vụ buổi báo cáo.
- **Trình diễn:** Chuẩn bị kịch bản demo tính năng tự động phát bằng cả GPS ngoài trời lẫn chế độ giả lập vị trí tích hợp sẵn trong ứng dụng.
- **Vấn đáp mã nguồn:** Sử dụng tài liệu [`HUONG-DAN-CONTROL-CODE.md`](./HUONG-DAN-CONTROL-CODE.md) để đối chiếu vị trí code và giải thích kiến trúc hệ thống.

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
| 26/10/2026 | Hoàn thiện trang thống kê dashboard: chọn khoảng ngày, xử lý thống kê ở backend và cập nhật giao diện. Bổ sung ghi nhận phiên online từ web/mobile. Chỉnh giao diện web/mobile và bản đồ, thêm bong bóng QR dẫn tới ứng dụng. |
| 28/10/2026 | Có commit “Done test” cho trang thống kê dashboard. |
| 31/10/2026 | Cải thiện bản đồ địa điểm và trải nghiệm phát thuyết minh trên web; chỉnh trang chính, danh sách POI, giao diện và biểu tượng. |
| 02/11/2026 | Tạo tài liệu sơ đồ luồng dữ liệu DFD. |
| 05/11/2026 | Bổ sung tài liệu PRD và hình minh họa, cập nhật POI, cách đánh số địa điểm trên bản đồ, dữ liệu SQL và kiểm thử backend. |
| 08/11/2026 | Thêm MapPicker vào dashboard; hỗ trợ URL audio trong biểu mẫu POI và phần phát thuyết minh trên web. Cập nhật PRD/DFD, UCD và dữ liệu địa điểm. |
| 09/11/2026 | Đồng bộ dữ liệu ba POI campus giữa mobile, SQL seed và tài liệu; xóa một số QR mẫu POI test |
| 11/11/2026 | Đồng bộ giao diện/chức năng mobile với web; cập nhật màn hình POI, QR scanner, biểu tượng và giao diện; nâng Expo SDK 57 lên 58 và cập nhật hook tải POI. |
| 12/11/2026 | Cập nhật cấu hình và hướng dẫn triển khai lại ứng dụng mobile, gồm cấu hình Vercel. |
| 14/11/2026 | Thêm nút dừng thuyết minh trên web và emoji/icon cho năm POI trên web/mobile. |
| 15/11/2026 | Cập nhật DFD; chỉnh giao diện mobile, bong bóng QR và bản dịch web/mobile, bổ sung hỗ trợ thêm bốn ngôn ngữ cùng các cập nhật liên quan đến dữ liệu POI và backend. Tạm hoàn thành đồ án  |
