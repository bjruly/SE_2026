# Backend – API và cơ sở dữ liệu (Node.js + Express + PostgreSQL)

Backend của đồ án: lưu địa điểm và bản dịch, ghi thống kê lượt nghe/quét QR, đăng nhập cho dashboard. Web và app đọc địa điểm qua API; **dashboard** (thư mục `../dashboard`) quản lý dữ liệu qua API này.

- **Công nghệ:** Node.js (ES module), Express 5, PostgreSQL (thư viện `pg`, **SQL thuần**, không dùng ORM), `bcryptjs` (băm mật khẩu), `jsonwebtoken` (token đăng nhập), `zod` (kiểm tra dữ liệu).
- Sơ đồ bảng (ERD) và mô tả từng bảng: `docs/ERD.md`.

## Chạy trên máy (lần đầu)

Cần Node.js (LTS, khuyến nghị 22 trở lên) và một database PostgreSQL. Cách dễ nhất là tạo database miễn phí trên **Neon** (neon.com), lấy **Connection string** trong trang quản lý (kiểm tra điều kiện gói miễn phí hiện hành trên trang của họ).

```bash
cd server
npm install
cp .env.example .env         # Windows PowerShell: Copy-Item .env.example .env
# Mở .env và điền: DATABASE_URL, JWT_SECRET (ít nhất 32 ký tự ngẫu nhiên), ADMIN_EMAIL, ADMIN_PASSWORD

npm run db:schema            # tạo các bảng (chạy lại để thêm bảng online_sessions)
npm run db:seed              # nạp 3 địa điểm mẫu và 3 ngôn ngữ
npm run admin:create         # tạo tài khoản Quản trị đầu tiên từ ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                  # chạy tại http://localhost:4000
```

Kiểm tra: mở `http://localhost:4000/api/health` (phải thấy `{"ok":true}`) và `http://localhost:4000/api/pois` (danh sách địa điểm).
Trên Windows PowerShell nếu `npm` bị chặn, dùng `npm.cmd`.
`db:schema` và `db:seed` chạy lại nhiều lần không lỗi và không làm mất dữ liệu.

## Kiểm thử tự động

```bash
npm test
```
Chạy 10 bài kiểm thử (đăng nhập, phân quyền, thêm/sửa/xóa địa điểm, kiểm tra dữ liệu, thống kê, quản lý tài khoản, giới hạn đăng nhập sai). Mặc định dùng **PGlite** (PostgreSQL chạy trong bộ nhớ, không cần cài gì và **không đụng vào database thật của bạn**). Muốn kiểm thử trên PostgreSQL thật: đặt `TEST_DATABASE_URL` (**database đó sẽ bị xóa sạch**, chỉ dùng database thử).

## Các API

Mọi lỗi trả về dạng `{ "error": { "code", "message", "details?" } }`.

**Công khai (web và app gọi, không cần đăng nhập)**

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/health` | Kiểm tra backend và database |
| GET | `/api/pois` | Địa điểm đang hoạt động, cùng hình dạng với `pois.json` |
| POST | `/api/events` | Ghi sự kiện thống kê: `{ poiId, type: "listen" \| "qr_scan", lang, source?: "auto" \| "manual", client?: "web" \| "mobile" }` |
| POST | `/api/presence` | Heartbeat ẩn danh: `{ sessionId, client: "web" \| "mobile" }`; gửi 30 giây/lần khi ứng dụng đang ở foreground |

**Đăng nhập**

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }`; sai quá 10 lần/15 phút thì bị chặn tạm (429) |
| GET | `/api/auth/me` | Thông tin tài khoản đang đăng nhập |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` |

Các API bên dưới cần header `Authorization: Bearer <token>`.

**Dành cho dashboard**

| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| GET | `/api/admin/pois`, `/api/admin/pois/:id` | Quản trị, Biên tập |
| POST | `/api/admin/pois` | Quản trị, Biên tập |
| PUT | `/api/admin/pois/:id` | Quản trị, Biên tập |
| DELETE | `/api/admin/pois/:id` | **Chỉ Quản trị** |
| GET | `/api/admin/stats?days=30` | Quản trị, Biên tập |
| GET | `/api/admin/online` | Quản trị, Biên tập; số phiên online theo nền tảng trong 2 phút gần nhất |
| GET, POST | `/api/admin/users` | **Chỉ Quản trị** |
| PATCH | `/api/admin/users/:id` | **Chỉ Quản trị** (đổi tên, vai trò, khóa/mở khóa, đặt lại mật khẩu) |

Nội dung thêm/sửa địa điểm: `{ latitude, longitude, radiusMeters, active, translations: { vi, en, zh } }`, mỗi bản dịch có `name`, `description` (bắt buộc) và `audioUrl` (tùy chọn). Cả 3 ngôn ngữ đều bắt buộc.

### Phân quyền

Bảng quyền nằm ở **một chỗ duy nhất**: `src/permissions.js`. Hiện tại:

| Việc | Quản trị | Biên tập |
|---|---|---|
| Xem, thêm, sửa địa điểm | có | có |
| **Xóa địa điểm** | có | không |
| Xem thống kê | có | có |
| Quản lý tài khoản admin | có | không |

Bạn chỉ nói "Biên tập: sửa địa điểm, xem thống kê", chưa nói rõ có được thêm và xóa không. Mình chọn tạm: **Biên tập được thêm và sửa, không được xóa** (xóa địa điểm cũng xóa luôn thống kê của nó). Muốn đổi thì sửa `src/permissions.js` (và `dashboard/lib/permissions.js` để nút hiện/ẩn khớp).

## Bảo mật (đã làm và còn hạn chế)

- Mật khẩu được băm bằng bcrypt; token ký bằng `JWT_SECRET`, hết hạn sau 8 giờ; mỗi yêu cầu đều tra lại tài khoản trong database nên tài khoản bị khóa hoặc đổi vai trò có hiệu lực ngay.
- Truy vấn SQL dùng tham số (không nối chuỗi), dữ liệu gửi lên được kiểm tra bằng `zod`.
- `CORS_ORIGINS`: danh sách địa chỉ web được gọi API từ trình duyệt. Để trống là cho phép tất cả (chỉ để phát triển); khi triển khai hãy điền địa chỉ web và dashboard.
- **Hạn chế:** API ghi sự kiện (`POST /api/events`) là công khai nên có thể bị gửi dữ liệu rác; chưa có giới hạn tốc độ cho API này. Giới hạn đăng nhập sai lưu trong bộ nhớ nên trên Vercel (serverless) chỉ làm chậm chứ không chặn tuyệt đối. Token lưu trong localStorage của dashboard. Thống kê tính theo giờ UTC.
- Số online là **ước tính số phiên/thiết bị**, không phải số người được xác thực. Web dùng ID ngẫu nhiên lưu trong localStorage; app dùng ID phiên ngẫu nhiên trong bộ nhớ. Không lưu tài khoản, tên hay vị trí; heartbeat chạy mỗi 30 giây ở foreground và dashboard tính online nếu cập nhật trong 2 phút gần nhất.

## Triển khai lên Vercel

Theo tài liệu của Vercel, Express chạy được mà không cần cấu hình thêm nếu có file `src/index.js` xuất `app` mặc định (đúng như thư mục này). **Mình chưa triển khai thử thật**, bạn làm theo và báo lỗi nếu có:

1. Trên Vercel: **Add New > Project**, chọn repo GitHub, đặt **Root Directory** là `campus-guide-repos/server`.
2. Trong **Environment Variables** thêm: `DATABASE_URL` (nên dùng chuỗi kết nối "pooled" của Neon nếu có), `JWT_SECRET`, `CORS_ORIGINS` (địa chỉ web và dashboard đã triển khai, cách nhau dấu phẩy).
3. Triển khai, rồi mở `<địa chỉ>/api/health`.
4. Chạy `db:schema`, `db:seed`, `admin:create` **từ máy bạn** với `DATABASE_URL` của Neon (Vercel không chạy các lệnh này).
5. Đặt `NEXT_PUBLIC_API_URL` = địa chỉ backend này trong project `web` và `dashboard` trên Vercel, rồi triển khai lại hai project đó.

## Cấu trúc

```
server/
├─ src/
│  ├─ index.js        điểm vào (chạy trên máy hoặc Vercel)
│  ├─ create-app.js   ghép Express, CORS, xử lý lỗi
│  ├─ config.js       đọc biến môi trường
│  ├─ db.js           kết nối PostgreSQL
│  ├─ permissions.js  bảng quyền theo vai trò
│  ├─ validation.js   kiểm tra dữ liệu gửi lên
│  ├─ poiRepo.js      đọc/ghi địa điểm và bản dịch
│  ├─ middleware/     đăng nhập, kiểm tra quyền
│  └─ routes/         public.js, auth.js, admin.js
├─ sql/               schema.sql (các bảng), seed.sql (dữ liệu mẫu)
├─ scripts/           run-sql.js, create-admin.js
├─ tests/             bộ kiểm thử
└─ docs/ERD.md        sơ đồ bảng
```
