# App di động – Thuyết minh tự động (Expo / React Native)

Phần app di động của đồ án. Công nghệ: **Expo SDK 58** (React Native, JavaScript), `expo-location` (GPS), `expo-speech` (giọng đọc của thiết bị), `expo-camera` (quét QR), `react-native-webview` (hiển thị bản đồ Leaflet + OpenStreetMap), `react-native-safe-area-context`.
Xem README ở thư mục gốc để biết tổng quan, chức năng và các điểm chưa xác định.

## Cách chạy (bằng Expo Go trên điện thoại)

1. Trên máy tính, cài **Node.js** (bản LTS, khuyến nghị 22 trở lên).
2. Trên điện thoại, cài ứng dụng **Expo Go** từ App Store hoặc Google Play. Expo Go phải hỗ trợ **SDK 58**; nếu app báo "incompatible", hãy cập nhật Expo Go.
3. Máy tính và điện thoại phải **cùng mạng Wi-Fi**.
4. Chạy:

```bash
npm install
npx expo start
```

5. Quét mã QR hiện trên terminal: Android dùng chính Expo Go để quét, iPhone dùng camera của máy.
6. Khi app mở, cấp quyền **vị trí** và **camera** khi được hỏi (nếu muốn dùng GPS thật và quét QR).

Nếu điện thoại không kết nối được tới máy tính (mạng công ty/trường chặn, tường lửa), thử `npx expo start --tunnel`.

Kiểm tra nhanh mã nguồn biên dịch được (không cần điện thoại):

```bash
npx expo export --platform android
```

## Cách thử tính năng tự động phát

Xem mục "Cách thử tính năng tự động phát" trong README ở thư mục gốc. Ở tab **Bản đồ**, phần **Giả lập vị trí** cho phép chọn "Ngoài vùng" rồi "Tại Điểm mẫu 1" để thử mà không cần đi bộ. Ảnh mã QR mẫu nằm ở thư mục `../qr-samples` (có thể mở trên máy tính rồi quét bằng tab **Quét QR**).

## Lưu ý

- **Bản đồ:** là trang Leaflet nhúng trong WebView, ô bản đồ lấy từ `tile.openstreetmap.org` nên cần mạng. Máy chủ OpenStreetMap có chính sách sử dụng riêng; nếu bản đồ trong app bị trống, hãy đổi `TILE_URL` trong `src/config.js` sang nhà cung cấp khác (thường cần khóa API).
- **Giọng đọc:** phụ thuộc giọng cài trên điện thoại. Nếu máy chưa có giọng tiếng Việt hoặc tiếng Trung, app hiện cảnh báo và có thể không đọc được. Việc "Tạm dừng" có thể khác nhau giữa Android và iOS; nếu thiết bị không hỗ trợ tạm dừng, app sẽ dừng hẳn.
- **iPhone:** giọng đọc không phát tiếng khi máy đang bật chế độ im lặng (theo tài liệu của `expo-speech`).
- Thư viện Leaflet được nhúng sẵn trong `src/map/leafletInline.js` (tệp sinh tự động, đừng sửa tay). Muốn tạo lại: `node scripts/build-leaflet-inline.js` (cần đã chạy `npm install` trong thư mục `../web`).
- Dữ liệu `src/data/pois.json` và `src/lib/geofence.js` là **bản sao giống hệt** của `../web/data/pois.json` và `../web/lib/geofence.js`. Sửa ở đâu thì sửa cả hai nơi.

## Cấu trúc thư mục

```
mobile/
├─ App.js                      màn hình chính: 3 tab (Bản đồ, Địa điểm, Quét QR), ghép logic tự động phát
├─ app.json                    cấu hình Expo (tên app, quyền camera và vị trí)
├─ src/
│  ├─ components/              MapWebView, PoiList, PoiDetail, QrScanner, SimPanel
│  ├─ hooks/                   useGps (GPS), useNarration (đọc giọng nói)
│  ├─ lib/                     geofence.js (logic vùng địa điểm), i18n.js (chuỗi 3 ngôn ngữ)
│  ├─ map/                     buildHtml.js (trang Leaflet), leafletInline.js (sinh tự động)
│  ├─ data/pois.json           dữ liệu địa điểm (mẫu)
│  ├─ config.js                giá trị tạm: thời gian nghỉ, nguồn ô bản đồ
│  └─ styles.js
└─ scripts/build-leaflet-inline.js
```

## Lỗi thường gặp

- **Expo Go báo phiên bản không tương thích:** cập nhật Expo Go lên bản hỗ trợ SDK 58.
- **Điện thoại không kết nối được:** kiểm tra cùng Wi-Fi, tắt VPN, thử `npx expo start --tunnel`.
- **Không lấy được vị trí:** kiểm tra đã cấp quyền vị trí cho Expo Go và đã bật định vị trên điện thoại; hoặc dùng **Giả lập vị trí**.
- **Không quét được QR:** kiểm tra quyền camera; có thể nhập mã thủ công, ví dụ `DHSG-POI-001`.
- **Bản đồ trống:** xem mục "Bản đồ" ở trên.
