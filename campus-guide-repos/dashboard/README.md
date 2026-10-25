# Dashboard quản trị (Next.js)

Trang quản trị cho nhóm: thêm/sửa/xóa địa điểm và bản dịch 3 ngôn ngữ, tạo và tải mã QR, xem thống kê lượt nghe và lượt quét QR, quản lý tài khoản admin. Cần **backend** (thư mục `../server`) đang chạy.

- **Công nghệ:** Next.js (App Router, JavaScript), thư viện `qrcode` (tạo ảnh QR trên trình duyệt). Giao diện dùng CSS thuần, chưa trau chuốt, để bạn tiếp tục cải thiện UI/UX.

## Chạy trên máy

Làm xong phần backend (`server/README.md`) trước, rồi:

```bash
cd dashboard
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev -- -p 3001          # mở http://localhost:3001
```
Trong `.env.local`: `NEXT_PUBLIC_API_URL` là địa chỉ backend (`http://localhost:4000`), `NEXT_PUBLIC_WEB_URL` là địa chỉ web người dùng (để tạo QR dạng liên kết). Đăng nhập bằng tài khoản tạo bởi `npm run admin:create` ở backend. Nhớ thêm `http://localhost:3001` vào `CORS_ORIGINS` của backend.

Chạy cả 3 phần cùng lúc cần 3 cửa sổ terminal: `server` (cổng 4000), `web` (cổng 3000), `dashboard` (cổng 3001).

## Các trang

| Trang | Đường dẫn | Ai dùng |
|---|---|---|
| Đăng nhập | `/login` | Mọi người |
| Thống kê | `/` | Quản trị, Biên tập |
| Danh sách địa điểm | `/pois` | Quản trị, Biên tập (nút Xóa chỉ Quản trị thấy) |
| Thêm / Sửa địa điểm | `/pois/new`, `/pois/<mã>` | Quản trị, Biên tập |
| Mã QR | `/qr` | Quản trị, Biên tập |
| Tài khoản admin | `/users` | Chỉ Quản trị |
| Tài khoản của tôi (đổi mật khẩu) | `/account` | Mọi người |

Mã QR có hai kiểu: **mã** (chứa `DHSG-POI-001`, dùng cho ô "Quét QR" trong web/app) và **liên kết** (chứa `<địa chỉ web>/?qr=DHSG-POI-001`, quét bằng camera điện thoại là mở thẳng địa điểm).

## Lưu ý

- Việc ẩn/hiện nút theo vai trò chỉ để cho gọn (`lib/permissions.js`); **backend mới là nơi quyết định quyền thật**.
- Token đăng nhập lưu trong `localStorage` của trình duyệt (hết hạn sau 8 giờ).
- Tọa độ nhập bằng tay (vĩ độ, kinh độ); chưa có chức năng chọn điểm trên bản đồ.
- Ô "Đường dẫn audio" lưu được vào database nhưng web/app chưa dùng; chưa có chức năng tải file audio lên.
- Triển khai: tạo project Vercel riêng, **Root Directory** là `campus-guide-repos/dashboard`, đặt `NEXT_PUBLIC_API_URL` và `NEXT_PUBLIC_WEB_URL` trong Environment Variables. Chưa triển khai thử thật.

## Cấu trúc

```
dashboard/
├─ app/
│  ├─ layout.js, globals.css
│  ├─ login/page.js
│  └─ (admin)/                 các trang cần đăng nhập
│     ├─ layout.js             kiểm tra đăng nhập, khung giao diện
│     ├─ page.js               thống kê
│     ├─ pois/ (page, new/, [id]/)
│     ├─ qr/page.js, users/page.js, account/page.js
├─ components/                 Shell (menu), PoiForm (form địa điểm)
└─ lib/                        api.js (gọi backend), auth.js (đăng nhập), permissions.js
```
