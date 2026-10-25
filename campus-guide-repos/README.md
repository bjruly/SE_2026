# campus-guide-repos – Tổng quan dự án

Hệ thống **thuyết minh tự động đa ngôn ngữ** tại khuôn viên Đại học Sài Gòn. Khi người dùng đi vào vùng của một địa điểm, web hoặc app tự phát thuyết minh theo ngôn ngữ họ chọn (Việt, Anh, Trung). Giới thiệu repository, danh sách thành viên và nhật ký nằm ở `README.md` **ngoài** folder này.

> **Lưu ý:** địa điểm hiện chỉ là **3 điểm mẫu với tọa độ tạm** (chưa phải vị trí thật trong khuôn viên). Dữ liệu thật nhập qua dashboard (xem mục "Thay dữ liệu thật").

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
| `qr-samples/` | 3 ảnh mã QR mẫu để thử chức năng quét | |

Web và app **vẫn chạy được khi không có backend**: chưa cấu hình hoặc không kết nối được API thì dùng file `pois.json` dự phòng (không ghi được thống kê).

## Chức năng

**Web và app (người dùng)**

| Mã | Chức năng |
|---|---|
| F1 | Chọn ngôn ngữ: Việt, Anh, Trung |
| F2 | Tự động phát thuyết minh khi đi vào vùng của địa điểm (GPS) |
| F3 | Xem bản đồ và vị trí hiện tại |
| F4 | Danh sách và chi tiết địa điểm |
| F5 | Phát, tạm dừng, dừng thuyết minh bằng tay |
| F6 | Quét mã QR (hoặc mở liên kết QR) để mở địa điểm |
| — | Giả lập vị trí để thử F2 mà không cần đi bộ |

**Dashboard (quản trị):** thêm/sửa/xóa địa điểm và bản dịch 3 ngôn ngữ, tạo và tải mã QR, thống kê lượt nghe và lượt quét QR theo địa điểm và ngôn ngữ, quản lý tài khoản admin với 2 vai trò (Quản trị, Biên tập).

Âm thanh hiện là **giọng đọc của thiết bị** (đọc văn bản). Nhóm muốn về sau dùng file audio riêng: database và API đã có trường `audioUrl`, nhưng **phần phát file audio và tải file lên chưa được làm**.

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
4. Chọn lại **Ngoài vùng**, rồi vào lại cùng điểm ngay: **không phát lại** vì còn trong thời gian nghỉ (60 giây).
5. Khi đang giả lập, chạm lên bản đồ để đặt vị trí tùy ý.
6. Xem kết quả trong dashboard, trang **Thống kê**.

## Thay dữ liệu thật

- **Cách chính:** đăng nhập dashboard, thêm/sửa địa điểm (tên, mô tả 3 ngôn ngữ, tọa độ, bán kính). Mã địa điểm và mã QR tự sinh; mã QR không đổi khi sửa. Tải ảnh QR ở trang **Mã QR**.
- **Dữ liệu dự phòng:** web/app dùng file `web/data/pois.json` và `mobile/src/data/pois.json` khi không gọi được API. Muốn cập nhật cho khớp dữ liệu thật: mở `<địa chỉ backend>/api/pois`, lưu nội dung thành hai file đó (hình dạng giống hệt nhau).
- Hai file `lib/geofence.js` của `web/` và `mobile/` (logic vùng địa điểm), và `lib/qr.js` là **bản sao giống hệt nhau**; sửa ở đâu thì sửa cả hai nơi.

## Triển khai

Web, dashboard và backend là ba project triển khai riêng; app mobile được đóng gói/phân phối bằng Expo, không deploy lên Vercel.

Thứ tự triển khai:

1. Tạo PostgreSQL trên Neon.
2. Deploy `server/` lên Vercel với **Root Directory** `campus-guide-repos/server`, cấu hình `DATABASE_URL`, `JWT_SECRET` (ít nhất 32 ký tự ngẫu nhiên) và `CORS_ORIGINS`.
3. Chạy `db:schema`, `db:seed` và `admin:create` theo `server/README.md`. Không dùng mật khẩu mẫu trong `.env.example`.
4. Deploy `dashboard/` với **Root Directory** `campus-guide-repos/dashboard`; đặt `NEXT_PUBLIC_API_URL` bằng URL backend và `NEXT_PUBLIC_WEB_URL` bằng URL web nếu muốn tạo QR dạng liên kết.
5. Deploy `web/` với **Root Directory** `campus-guide-repos/web`; đặt `NEXT_PUBLIC_API_URL` bằng URL backend.

Dashboard có thể build/deploy tách rời, nhưng không thể đăng nhập hay quản lý dữ liệu nếu API và database chưa hoạt động. Sau khi thay biến môi trường trên Vercel, cần redeploy project tương ứng. Xem hướng dẫn chi tiết ở README từng phần. **Chưa triển khai thử các project lên Vercel/Neon.**

## CD/CI

- `.github/workflows/ci.yml` (của nhóm): Unit Test, build Next.js (web), bundle Expo (mobile), triển khai lên GitHub Pages.
- `.github/workflows/server-dashboard-ci.yml` (thêm mới, **chưa chạy thử trên GitHub**): kiểm thử `server` và build `dashboard`.
- Web trên GitHub Pages nằm ở đường dẫn con (`/<tên-repo>/`), còn web xuất tĩnh dùng đường dẫn tuyệt đối, nên có thể hỏng hình/script nếu không cấu hình `basePath`. Web đang chạy trên Vercel nên không gặp vấn đề này.

## Đã kiểm tra gì, chưa kiểm tra gì

**Đã kiểm tra** (trong môi trường của mình, không có mạng ra ngoài):
- `server`: 10 bài kiểm thử API đạt trên cả PGlite lẫn PostgreSQL 16 thật; chạy thử toàn bộ (schema, seed, tạo admin, đăng nhập, CORS) trên PostgreSQL 16.
- `web`: 8 bài kiểm thử đơn vị đạt, build thành công; 15 kiểm tra trong trình duyệt headless (Chromium, WebGL phần mềm) với backend thật: tải trang, lấy dữ liệu từ API, dự phòng khi API lỗi, đổi ngôn ngữ, tự động phát đúng 1 lần, thời gian nghỉ, QR dạng mã và dạng liên kết, khổ điện thoại; sự kiện thống kê vào đúng database.
- `dashboard`: build thành công; 16 kiểm tra trong trình duyệt headless với backend và PostgreSQL thật: đăng nhập, thống kê, thêm/sửa/xóa địa điểm, mã QR, tạo tài khoản, phân quyền Quản trị và Biên tập.
- `mobile`: đóng gói thành công cho Android, iOS và web; trang bản đồ trong app đạt 8 kiểm tra trong trình duyệt headless (giả lập cách WebView gửi và nhận tin nhắn).

**Chưa kiểm tra:**
- App chưa được chạy trên điện thoại hay máy ảo (GPS, giọng đọc, camera quét QR, WebView thật).
- **Bản đồ vector OpenFreeMap chưa được xác nhận hiển thị**: môi trường của mình không truy cập được mạng ngoài, nên mình chỉ thử được đường dự phòng sang OpenStreetMap (đã hoạt động). Nếu bạn không thấy nền bản đồ, hãy báo lỗi.
- Triển khai thật lên Vercel và Neon, và các workflow GitHub Actions.
- Giọng đọc tiếng Việt và tiếng Trung phụ thuộc thiết bị.

## Giá trị tạm của demo (chưa phải quyết định cuối)

- Bán kính vùng 25 mét; thời gian nghỉ trước khi phát lại cùng địa điểm 60 giây (`COOLDOWN_MS`); khi nhiều vùng chồng nhau thì phát điểm gần nhất.
- Quyền của Biên tập: được thêm và sửa địa điểm, **không được xóa** (xem `server/README.md`).
- Tọa độ và nội dung 3 điểm mẫu.
