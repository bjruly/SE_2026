# Thuyết minh tự động đa ngôn ngữ – Khuôn viên Đại học Sài Gòn (bản demo)

Đồ án môn học, **hướng 1: FE Dev** (React Native + React.js, gồm CD/CI). Nhóm 3 thành viên, giao tiếp và nộp bài qua GitHub.

Ứng dụng tự động phát thuyết minh theo ngôn ngữ người dùng chọn khi họ đi vào vùng của một địa điểm trong khuôn viên. Repo này gồm **bản demo chạy được** cho cả **web (PWA, Next.js)** và **app di động (Expo, React Native)**.

> **Lưu ý:** dữ liệu địa điểm hiện chỉ là **3 điểm mẫu với tọa độ tạm** (chưa phải vị trí thật trong khuôn viên). Cần thay bằng dữ liệu thật của nhóm (xem mục "Thay dữ liệu thật").

## Thành viên và phân công

| STT | Họ tên | MSSV | GitHub | Công việc phụ trách | Trạng thái |
|---|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |

## Mốc quan trọng (theo slide của thầy)
- Tuần 7: kiểm tra tiến độ giữa kỳ
- Tuần 11, 12: báo cáo cuối kỳ (đồ án)

## Chức năng trong demo

| Mã | Chức năng | Web | Mobile |
|---|---|---|---|
| F1 | Chọn ngôn ngữ: Việt, Anh, Trung | có | có |
| F2 | Tự động phát thuyết minh khi đi vào vùng của địa điểm (GPS) | có | có |
| F3 | Xem bản đồ và vị trí hiện tại | có | có |
| F4 | Danh sách và chi tiết địa điểm | có | có |
| F5 | Phát, tạm dừng, dừng thuyết minh bằng tay | có | có |
| F6 | Quét mã QR để mở địa điểm | có | có |
| — | Giả lập vị trí để thử F2 mà không cần đi bộ | có | có |

Âm thanh hiện là **giọng đọc của thiết bị** (đọc văn bản). Nhóm muốn về sau dùng file audio riêng: dữ liệu đã có sẵn trường `audioUrl` (đang để trống), nhưng **phần phát file audio chưa được làm**.

## Cấu trúc thư mục

```
thuyet-minh-dhsg-demo/
├─ README.md            (file này)
├─ web/                 Web PWA: Next.js (JavaScript) + Leaflet
├─ mobile/              App di động: Expo (JavaScript) + Leaflet trong WebView
└─ qr-samples/          3 ảnh mã QR mẫu để thử chức năng quét
```

`web/` và `mobile/` là hai dự án độc lập, **tách thành 2 repo hay để chung 1 repo đều được** (số repo là việc nhóm chưa chốt).
Hai file được **sao chép giống hệt** giữa 2 dự án: `lib/geofence.js` (logic vùng địa điểm) và `data/pois.json` (dữ liệu). Sửa ở đâu thì sửa cả hai nơi.

## Cách chạy nhanh

Cần cài **Node.js** (bản LTS, khuyến nghị 22 trở lên) và **npm**.

**Web**
```bash
cd web
npm install
npm run dev          # mở http://localhost:3000
```

**App di động** (cần điện thoại cài ứng dụng **Expo Go**, cùng mạng Wi-Fi với máy tính)
```bash
cd mobile
npm install
npx expo start       # quét mã QR hiện trên terminal bằng Expo Go
```

Chi tiết, kèm cách xử lý lỗi thường gặp: xem `web/README.md` và `mobile/README.md`.

## Cách thử tính năng tự động phát (không cần đi bộ)

1. Chọn ngôn ngữ (Việt, Anh hoặc Trung).
2. Bấm **Tự động phát: TẮT** để chuyển sang **BẬT**.
3. Ở phần **Giả lập vị trí**, chọn **Ngoài vùng**, rồi chọn **Tại Điểm mẫu 1**: ứng dụng tự phát thuyết minh của điểm đó.
4. Chọn lại **Ngoài vùng**, rồi vào lại cùng điểm ngay: **không phát lại** vì còn trong thời gian nghỉ (60 giây). Chờ hết thời gian nghỉ rồi thử lại sẽ phát.
5. Khi đang giả lập, chạm lên bản đồ để đặt vị trí tùy ý.

## Thay dữ liệu thật

Sửa `data/pois.json` (web) và `src/data/pois.json` (mobile), giữ hai file giống nhau. Mỗi địa điểm có:

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã địa điểm (không trùng nhau) |
| `qrCode` | Nội dung mã QR của địa điểm |
| `latitude`, `longitude` | Tọa độ |
| `radiusMeters` | Bán kính vùng tự động phát, tính bằng mét |
| `name`, `description` | Tên và nội dung thuyết minh theo `vi`, `en`, `zh` |
| `audioUrl` | Dành cho file audio sau này (hiện chưa dùng) |

Ảnh mã QR mẫu nằm trong `qr-samples/`. Khi đổi `qrCode`, hãy tạo lại ảnh QR tương ứng (nội dung mã QR chính là chuỗi `qrCode`).

## Đã kiểm tra gì, chưa kiểm tra gì

- **Web:** `npm run build` thành công; logic vùng địa điểm có 5 bài kiểm thử tự động (`npm test`) đều đạt.
- **Mobile:** đóng gói (bundle) thành công cho Android và iOS, tức là mã nguồn biên dịch và import đúng.
- **Chưa kiểm tra:** giao diện chưa được mở trên trình duyệt thật, và app chưa được chạy trên điện thoại hay máy ảo. Hãy chạy thử và ghi lại lỗi nếu có.

## Giá trị tạm của demo (chưa phải quyết định cuối)

- Bán kính vùng 25 mét; thời gian nghỉ trước khi phát lại cùng địa điểm 60 giây (`COOLDOWN_MS`).
- Khi nhiều vùng chồng nhau: phát điểm gần nhất.
- Tọa độ và nội dung 3 điểm mẫu.

## Chưa xác định (cần nhóm quyết hoặc hỏi thầy)

- Số repo GitHub (1 hay 2).
- **CD/CI:** Đã thiết lập hoàn chỉnh qua GitHub Actions (`.github/workflows/ci.yml`): tự động chạy Unit Test, build Next.js (Web), bundle Expo (Mobile) và tự động triển khai (CD) Web lên GitHub Pages.
- Nghĩa chính xác của "tự động" theo thầy, và mức độ yêu cầu ở mốc tuần 7.
- Dữ liệu thật của các địa điểm trong khuôn viên; việc chuyển sang file audio riêng.
- Loại UML mà môn học yêu cầu.

## Nhật ký
| Ngày | Việc đã làm |
|---|---|
| 19/10/2026 | Chốt: chủ đề khuôn viên ĐHSG; nền tảng web PWA (Next.js) và app React Native (Expo); ngôn ngữ Việt, Anh, Trung; JavaScript; bản đồ Leaflet + OpenStreetMap; dữ liệu mẫu trong mã nguồn. Dựng bản demo web và mobile. |
|  |  |

*(Các ngày trước 19/10/2026: nhóm tự bổ sung nếu cần.)*



