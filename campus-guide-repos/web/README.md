# Web PWA – Thuyết minh tự động (Next.js)

Phần web của đồ án. Công nghệ: **Next.js** (App Router, JavaScript), **React**, **Leaflet** (bản đồ OpenStreetMap), **html5-qrcode** (quét QR bằng camera), giọng đọc có sẵn của trình duyệt (Web Speech API).
Xem README ở thư mục gốc để biết tổng quan, chức năng và các điểm chưa xác định.

## Cách chạy

Cần Node.js (bản LTS, khuyến nghị 22 trở lên).

```bash
npm install
npm run dev        # chạy thử khi lập trình: http://localhost:3000
```

Chạy bản build (giống bản triển khai thật, có service worker):

```bash
npm run build      # tạo thư mục out/ (web tĩnh, không cần máy chủ Node)
npx serve out      # mở địa chỉ hiện trên terminal, thường là http://localhost:3000
```

Kiểm thử logic vùng địa điểm:

```bash
npm test
```

## Lưu ý khi dùng

- **GPS và camera trên web chỉ hoạt động trên HTTPS hoặc `localhost`.** Nếu mở web từ điện thoại bằng địa chỉ mạng nội bộ dạng `http://192.168.x.x:3000`, trình duyệt sẽ chặn GPS và camera. Khi đó hãy dùng **Giả lập vị trí** và ô **nhập mã QR**, hoặc triển khai web lên một địa chỉ HTTPS.
- **PWA:** service worker và manifest chỉ hoạt động ở bản build (`npm run build`), không hoạt động ở `npm run dev`. Việc cài web lên màn hình điện thoại cũng cần HTTPS (hoặc `localhost`). Service worker chỉ lưu các tệp của chính ứng dụng; **ô bản đồ OpenStreetMap không được lưu**, nên bản đồ cần mạng.
- **Giọng đọc:** phụ thuộc trình duyệt và hệ điều hành. Nếu máy chưa có giọng tiếng Việt hoặc tiếng Trung, ứng dụng hiện cảnh báo và có thể không đọc được. Chức năng "Tạm dừng" của giọng đọc có thể hoạt động khác nhau giữa các trình duyệt.
- Trình duyệt thường chỉ cho phát giọng đọc sau khi người dùng đã bấm vào trang ít nhất một lần; nút **Tự động phát** nằm ở đó để việc này tự nhiên xảy ra.

## Cấu trúc thư mục

```
web/
├─ app/
│  ├─ page.js                  trang chính: ghép bản đồ, danh sách, chi tiết, QR, giả lập
│  ├─ layout.js, globals.css   khung trang và giao diện
│  ├─ manifest.js              khai báo PWA
│  └─ ServiceWorkerRegister.js đăng ký service worker (chỉ ở bản production)
├─ components/                 MapView, PoiList, PoiDetail, QrScanner, SimulationPanel
├─ hooks/                      useGeolocation (GPS), useNarration (đọc giọng nói)
├─ lib/
│  ├─ geofence.js              logic vùng địa điểm (có test: geofence.test.js)
│  └─ i18n.js                  chuỗi giao diện Việt, Anh, Trung
├─ data/pois.json              dữ liệu địa điểm (mẫu)
└─ public/                     sw.js, icon-192.png, icon-512.png
```

## Lỗi thường gặp

- **Bản đồ trống hoặc không có nền bản đồ:** kiểm tra kết nối mạng; ô bản đồ lấy từ `tile.openstreetmap.org`.
- **Báo lỗi khi `npm run dev` hoặc `build`:** kiểm tra phiên bản Node (`node -v`), xóa thư mục `node_modules` và `.next` rồi chạy lại `npm install`.
- **Không nghe thấy tiếng:** kiểm tra âm lượng, thử bấm nút **Phát** trong trang chi tiết một địa điểm, và thử trình duyệt khác.
