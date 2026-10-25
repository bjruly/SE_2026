# App di động – Thuyết minh tự động (Expo / React Native)

Phần app di động của đồ án. Công nghệ: **Expo SDK 57** (React Native, JavaScript), `expo-location` (GPS), `expo-speech` (giọng đọc của thiết bị), `expo-camera` (quét QR), `react-native-webview` (hiển thị bản đồ MapLibre GL, mặc định OpenFreeMap), `react-native-safe-area-context`.
Xem README ở thư mục gốc để biết tổng quan, chức năng và các điểm chưa xác định.

## Cách chạy (bằng Expo Go trên điện thoại)

1. Trên máy tính, cài **Node.js** (bản LTS, khuyến nghị 22 trở lên).
2. Trên điện thoại, cài ứng dụng **Expo Go** từ App Store hoặc Google Play. Dự án dùng **SDK 57** để tương thích với Expo Go hiện có trên điện thoại.
3. Máy tính và điện thoại phải **cùng mạng Wi-Fi**.
4. Chạy:

```bash
npm.cmd install
npx.cmd expo start
```

5. Quét mã QR hiện trên terminal: Android dùng chính Expo Go để quét, iPhone dùng camera của máy.
6. Khi app mở, cấp quyền **vị trí** và **camera** khi được hỏi (nếu muốn dùng GPS thật và quét QR).

Nếu điện thoại không kết nối được tới máy tính (mạng công ty/trường chặn, tường lửa), thử `npx.cmd expo start --tunnel`.

Kiểm tra nhanh mã nguồn biên dịch được (không cần điện thoại):

```bash
npx.cmd expo export --platform android
```

## Cách thử tính năng tự động phát

Xem mục "Cách thử tính năng tự động phát" trong README ở thư mục gốc. Ở tab **Bản đồ**, phần **Giả lập vị trí** cho phép chọn "Ngoài vùng" rồi "Tại Điểm mẫu 1" để thử mà không cần đi bộ. Ảnh mã QR mẫu nằm ở thư mục `../qr-samples` (có thể mở trên máy tính rồi quét bằng tab **Quét QR**).

## Lưu ý

- **Bản đồ:** là trang MapLibre GL nhúng trong WebView (cần WebGL và mạng). Mặc định dùng OpenFreeMap; nếu không tải được trong 8 giây thì tự chuyển sang ô ảnh OpenStreetMap. Nếu bản đồ vẫn trống, thử đặt `EXPO_PUBLIC_MAP_PROVIDER=osm` hoặc `EXPO_PUBLIC_MAP_STYLE_URL` trong `.env` (xem `.env.example`). **Phần này chưa được thử trên điện thoại thật.**
- **Giọng đọc:** phụ thuộc giọng cài trên điện thoại. Nếu máy chưa có giọng tiếng Việt hoặc tiếng Trung, app hiện cảnh báo và có thể không đọc được. Việc "Tạm dừng" có thể khác nhau giữa Android và iOS; nếu thiết bị không hỗ trợ tạm dừng, app sẽ dừng hẳn.
- **iPhone:** giọng đọc không phát tiếng khi máy đang bật chế độ im lặng (theo tài liệu của `expo-speech`).
- Thư viện MapLibre được nhúng sẵn trong `src/map/maplibreInline.js` (tệp sinh tự động, đừng sửa tay). Muốn tạo lại: `node scripts/build-maplibre-inline.js` (cần đã chạy `npm install` trong thư mục `../web`). Dùng MapLibre 5.x vì bản 6 chỉ còn dạng ES module, khó nhúng.
- Dữ liệu `src/data/pois.json` và `src/lib/geofence.js` là **bản sao giống hệt** của `../web/data/pois.json` và `../web/lib/geofence.js`. Sửa ở đâu thì sửa cả hai nơi.

## Cấu trúc thư mục

```
mobile/
├─ App.js                      màn hình chính: 3 tab (Bản đồ, Địa điểm, Quét QR), ghép logic tự động phát
├─ app.json                    cấu hình Expo (tên app, quyền camera và vị trí)
├─ src/
│  ├─ components/              MapWebView, PoiList, PoiDetail, QrScanner, SimPanel
│  ├─ hooks/                   useGps (GPS), useNarration (đọc giọng nói)
│  ├─ lib/                     geofence.js, i18n.js, poiSource.js (API + dự phòng + ghi sự kiện), qr.js
│  ├─ map/                     buildHtml.js (trang MapLibre), maplibreInline.js (sinh tự động)
│  ├─ data/pois.json           dữ liệu địa điểm (mẫu)
│  ├─ config.js                giá trị tạm: thời gian nghỉ, địa chỉ API, nguồn bản đồ
│  └─ styles.js
└─ scripts/build-maplibre-inline.js
```

## Lỗi thường gặp

- **Expo Go báo phiên bản không tương thích:** kiểm tra Expo Go có hỗ trợ SDK 57 và cài lại dependencies bằng `npm.cmd install`.
- **Điện thoại không kết nối được:** kiểm tra cùng Wi-Fi, tắt VPN, thử `npx expo start --tunnel`.
- **Không lấy được vị trí:** kiểm tra đã cấp quyền vị trí cho Expo Go và đã bật định vị trên điện thoại; hoặc dùng **Giả lập vị trí**.
- **Không quét được QR:** kiểm tra quyền camera; có thể nhập mã thủ công, ví dụ `DHSG-POI-001`.
- **Bản đồ trống:** xem mục "Bản đồ" ở trên.

## Kết nối backend (API) và thống kê

Copy `.env.example` thành `.env` rồi đặt `EXPO_PUBLIC_API_URL`. **Điện thoại thật không dùng được `localhost`** của máy tính: hãy dùng IP của máy trong mạng Wi-Fi (ví dụ `http://192.168.1.10:4000`, xem bằng `ipconfig`) hoặc địa chỉ backend đã triển khai. Sau khi sửa `.env` chạy lại `npx expo start -c`.

- App lấy địa điểm từ `GET /api/pois`; chưa cấu hình, API lỗi, quá 6 giây hoặc mất mạng thì dùng `src/data/pois.json` dự phòng. Dòng "Dữ liệu: …" ở tab Bản đồ cho biết đang dùng nguồn nào.
- App gửi sự kiện ẩn danh `POST /api/events` mỗi lần bắt đầu phát thuyết minh hoặc mở địa điểm bằng QR (không gửi vị trí hay thông tin cá nhân; lỗi thì bỏ qua).
- Ô "Quét QR" nhận cả mã thuần (`DHSG-POI-001`) lẫn liên kết (`…/?qr=DHSG-POI-001`).
- Backend của bạn cần cho phép gọi từ app: app di động không gửi header Origin nên không bị chặn bởi `CORS_ORIGINS`.
