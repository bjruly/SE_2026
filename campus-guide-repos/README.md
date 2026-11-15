# campus-guide-repos – Tổng quan dự án

Hệ thống **thuyết minh tự động đa ngôn ngữ** tại khuôn viên Đại học Sài Gòn (cơ sở 273 An Dương Vương, Q.5). Khi người dùng đi vào vùng của một địa điểm, web hoặc app tự phát thuyết minh theo ngôn ngữ họ chọn (**hỗ trợ 7 ngôn ngữ**: Tiếng Việt, English, 中文, 日本語, 한국어, ภาษาไทย, Deutsch). Giới thiệu repository, danh sách thành viên và nhật ký nằm ở `README.md` **ngoài** folder này.

> **Lưu ý:** dữ liệu khởi tạo và dự phòng hiện có **3 địa điểm** (mã DHSG-POI-001–003) với đầy đủ 7 ngôn ngữ, đồng bộ với bản web trên Vercel. Các địa điểm mẫu cũ 004–007 được giữ trong database nếu đã tồn tại nhưng seed sẽ đặt chúng thành không hoạt động; có thể quản lý và kích hoạt lại qua dashboard.

## Các phần của hệ thống

```
 Người dùng                         Nhóm quản trị
 ┌────────┐  ┌──────────┐            ┌─────────────┐
 │  web   │  │  mobile  │            │  dashboard  │
 │Next.js │  │  Expo    │            │  Next.js    │
 └───┬────┘  └────┬─────┘            └──────┬──────┘
     └────────────┼─────────────────────────┘
                  ▼
            ┌──────────┐      ┌─────────────────────┐
            │  server  │ ───▶ │ PostgreSQL (Neon)   │
            │ Express  │      │ địa điểm, bản dịch, │
            └──────────┘      │ tài khoản, thống kê │
                              └─────────────────────┘
```

| Thư mục | Là gì | README |
|---|---|---|
| `web/` | Web PWA cho người dùng (Next.js, MapLibre) | `web/README.md` |
| `mobile/` | App di động (Expo, React Native) | `mobile/README.md` |
| `server/` | Backend API + SQL (Express, PostgreSQL) | `server/README.md`, sơ đồ bảng `server/docs/ERD.md` |
| `dashboard/` | Trang quản trị (Next.js) | `dashboard/README.md` |
| `qr-samples/` | 3 ảnh QR mẫu cho các địa điểm đang hoạt động: DHSG-POI-001–003 | |

Web và app **vẫn chạy được khi không có backend**: chưa cấu hình hoặc không kết nối được API thì dùng file `pois.json` dự phòng (không ghi được thống kê).

Sơ đồ luồng dữ liệu toàn hệ thống (DFD): [`docs/DFD.md`](docs/DFD.md).

## Chức năng

**Web và app (người dùng)**

| Mã | Chức năng |
|---|---|
| F1 | Chọn ngôn ngữ: hỗ trợ 7 ngôn ngữ (Việt, Anh, Trung, Nhật, Hàn, Thái, Đức) |
| F2 | Tự động phát thuyết minh khi đi vào vùng của địa điểm (GPS / Geofence) |
| F3 | Xem bản đồ và vị trí hiện tại (MapLibre vector / OpenStreetMap) |
| F4 | Danh sách và chi tiết địa điểm kèm văn bản thuyết minh |
| F5 | Phát, tạm dừng, tiếp tục, dừng thuyết minh bằng tay (hỗ trợ cả audio URL và TTS) |
| F6 | Quét mã QR camera hoặc mở liên kết QR (?poi= / ?qr=) để mở địa điểm |
| — | Giả lập vị trí để thử F2 mà không cần đi bộ |

**Dashboard (quản trị):** thêm/sửa/xóa địa điểm và bản dịch 7 ngôn ngữ, tích hợp bộ chọn tọa độ bản đồ trực quan (`MapPicker`), nghe thử file audio, tạo và tải mã QR (kiểu chuỗi và kiểu liên kết), thống kê chi tiết lượt nghe và lượt quét QR (theo ngày, địa điểm, ngôn ngữ, cách phát), ước tính số phiên web/app đang online theo thời gian thực, quản lý tài khoản admin với 2 vai trò phân quyền (Quản trị, Biên tập).

Hệ thống hỗ trợ phát âm thanh qua **file audio riêng** (nếu địa điểm có điền đường dẫn `audioUrl`) hoặc tự động dùng **giọng đọc của thiết bị (Web Speech API / `expo-speech`)** khi không có file audio hoặc file gặp sự cố. Trình quản trị Dashboard hỗ trợ nghe thử file audio trực tiếp trong form trước khi lưu.

## Chạy toàn bộ trên máy

Cần **Node.js** (LTS, khuyến nghị 22 trở lên). Làm theo thứ tự (Windows PowerShell: dùng `npm.cmd` / `npx.cmd` nếu `npm` bị chặn):

1. **Backend** (`server/README.md`): tạo database PostgreSQL (ví dụ Neon), điền `.env`, rồi `npm install`, `npm run db:schema`, `npm run db:seed`, `npm run admin:create`, `npm run dev` (cổng 4000).
2. **Web**: `cd web`, `npm install`, copy `.env.example` thành `.env.local`, `npm run dev` (cổng 3000).
3. **Dashboard**: `cd dashboard`, `npm install`, copy `.env.example` thành `.env.local`, `npm run dev -- -p 3001`.
4. **App di động**: `cd mobile`, `npm install`, copy `.env.example` thành `.env` (nhớ dùng IP máy tính, không dùng localhost), `npx expo start`, quét QR bằng Expo Go.

Mỗi phần chạy ở một cửa sổ terminal riêng. Chỉ muốn xem web/app mà không cần backend: bỏ qua bước 1 và 3, không tạo file `.env`.

## Cách thử tính năng tự động phát (không cần đi bộ)

1. Chọn ngôn ngữ.
2. Bấm **Tự động phát: TẮT** để chuyển sang **BẬT**.
3. Ở phần **Giả lập vị trí**, chọn **Ngoài vùng**, rồi chọn **Tại Điểm mẫu 1**: ứng dụng tự phát thuyết minh của điểm đó.
4. Chọn lại **Ngoài vùng**, rồi vào lại cùng điểm: ở chế độ giả lập, thuyết minh phát lại ngay để tiện kiểm thử. Với GPS thật, cùng địa điểm vẫn có thời gian nghỉ 60 giây để tránh phát lặp do tín hiệu dao động.
5. Khi đang giả lập, chạm lên bản đồ để đặt vị trí tùy ý.
6. Xem kết quả trong dashboard, trang **Thống kê**.

## Thay dữ liệu thật

- **Cách chính:** đăng nhập dashboard, thêm/sửa địa điểm (tên, mô tả 7 ngôn ngữ, tọa độ chọn trực quan trên bản đồ `MapPicker` hoặc nhập tay, bán kính vùng). Mã địa điểm và mã QR tự sinh; mã QR không đổi khi sửa. Tải ảnh QR ở trang **Mã QR**.
- **Dữ liệu dự phòng:** web/app dùng file `web/data/pois.json` và `mobile/src/data/pois.json` khi không gọi được API. Muốn cập nhật cho khớp dữ liệu thật: mở `<địa chỉ backend>/api/pois`, lưu nội dung thành hai file đó (hình dạng giống hệt nhau).
- Hai file `lib/geofence.js` của `web/` và `mobile/` (logic vùng địa điểm), và `lib/qr.js` là **bản sao giống hệt nhau**; sửa ở đâu thì sửa cả hai nơi.

## Triển khai

Web, dashboard và backend là ba project triển khai riêng; app mobile được đóng gói/phân phối bằng Expo (hỗ trợ cả Expo Go lẫn bản web trên Vercel).

Thứ tự triển khai:

1. Tạo PostgreSQL trên Neon.
2. Deploy `server/` lên Vercel với **Root Directory** `campus-guide-repos/server`, cấu hình `DATABASE_URL`, `JWT_SECRET` (ít nhất 32 ký tự ngẫu nhiên) và `CORS_ORIGINS`.
3. Chạy `db:schema`, `db:seed` và `admin:create` theo `server/README.md`. Không dùng mật khẩu mẫu trong `.env.example`.
4. Deploy `dashboard/` với **Root Directory** `campus-guide-repos/dashboard`; đặt `NEXT_PUBLIC_API_URL` bằng URL backend và `NEXT_PUBLIC_WEB_URL` bằng URL web nếu muốn tạo QR dạng liên kết.
5. Deploy `web/` với **Root Directory** `campus-guide-repos/web`; đặt `NEXT_PUBLIC_API_URL` bằng URL backend.
6. Deploy `mobile/` (nếu muốn mở giao diện mobile trên web): tạo project Vercel với **Root Directory** `campus-guide-repos/mobile`, đặt `EXPO_PUBLIC_API_URL` bằng URL backend API.

Dashboard có thể build/deploy tách rời, nhưng không thể đăng nhập hay quản lý dữ liệu nếu API và database chưa hoạt động. Sau khi thay biến môi trường trên Vercel, cần redeploy project tương ứng. Xem hướng dẫn chi tiết ở README từng phần.

## CD/CI

- `.github/workflows/ci.yml` (của nhóm): Unit Test, build Next.js (web), bundle Expo (mobile), triển khai lên GitHub Pages (đã hỗ trợ dynamic `basePath`).
- `.github/workflows/server-dashboard-ci.yml`: kiểm thử `server` (chạy trên PGlite) và build `dashboard`.

## Đã kiểm tra gì, chưa kiểm tra gì

**Đã kiểm tra:**
- `server`: 11 bài kiểm thử API đạt trên cả PGlite lẫn PostgreSQL 16 thật; chạy thử toàn bộ (schema, seed 7 ngôn ngữ, tạo admin, đăng nhập, phân quyền, CORS, rate limiting) trên PostgreSQL.
- `web`: 9 bài kiểm thử đơn vị đạt, build thành công; kiểm tra tải trang, lấy dữ liệu từ API, dự phòng khi API lỗi, đổi 7 ngôn ngữ, tự động phát đúng 1 lần, thời gian nghỉ, QR dạng mã và dạng liên kết, phát file audioUrl và fallback sang TTS; sự kiện thống kê vào đúng database.
- `dashboard`: build thành công; tích hợp component `MapPicker` tương tác OpenStreetMap, nghe thử audio, đăng nhập, thống kê, thêm/sửa/xóa địa điểm, mã QR, tạo tài khoản, phân quyền Quản trị và Biên tập.
- `mobile`: Expo SDK 58, đóng gói thành công cho Android, iOS và web; trang bản đồ trong app đạt các kiểm tra WebView và đồng bộ dữ liệu với web.

**Cần chuẩn bị cho buổi báo cáo / nghiệm thu:**
- Chạy thử app trên điện thoại thật qua Expo Go ngoài sân trường (GPS thật, camera quét QR thật, giọng đọc thiết bị).
- Kiểm tra hiển thị nền bản đồ vector OpenFreeMap khi kết nối mạng ngoài (hệ thống có sẵn cơ chế tự động chuyển sang OpenStreetMap nếu style tải quá 8 giây).
- Triển khai chính thức lên Vercel và Neon phục vụ hội đồng chấm đồ án.
- Sử dụng tài liệu [`HUONG-DAN-CONTROL-CODE.md`](../HUONG-DAN-CONTROL-CODE.md) để đối chiếu vị trí code và giải thích kiến trúc hệ thống.

## Thông số cấu hình hệ thống

- Bán kính vùng mặc định: 25 mét; thời gian nghỉ trước khi phát lại cùng địa điểm: 60 giây (`COOLDOWN_MS`); khi nhiều vùng chồng nhau: phát điểm gần nhất hoặc hiển thị hộp thoại chọn.
- Quyền của Biên tập: được thêm và sửa địa điểm, xem thống kê, tạo mã QR; **không được xóa địa điểm và không quản lý tài khoản**.
- Tọa độ và nội dung của 3 địa điểm khởi tạo (mã DHSG-POI-001–003) tại khuôn viên ĐHSG 273 An Dương Vương.
