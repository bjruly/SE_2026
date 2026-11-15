# 🧭 BÍ KÍP VẤN ĐÁP BẢO VỆ ĐỒ ÁN – CONTROL CODE MASTER GUIDE
> **Dự án:** Hệ thống thuyết minh tự động đa ngôn ngữ khuôn viên Đại học Sài Gòn (ĐHSG)  
> **Dành cho:** Buổi báo cáo / Vấn đáp với Giảng viên (Chứng minh nhóm nắm 100% mã nguồn)

---

## 📌 MỤC LỤC NHANH
1. [Bảng tra cứu "Ở ĐÂU?" (Where is the code?)](#1-bảng-tra-cứu-ở-đâu-where-is-the-code)
2. [Chi tiết các luồng xử lý "NHƯ THẾ NÀO?" (How does it work?)](#2-chi-tiết-các-luồng-xử-lý-như-thế-nào-how-does-it-work)
3. [Giải thích các quyết định thiết kế "VÌ SAO?" (Why did you design it like this?)](#3-giải-thích-các-quyết-định-thiết-kế-vì-sao-why)
4. [Các câu hỏi "BẪY" thầy hay hỏi & Cách trả lời ăn điểm tuyệt đối](#4-các-câu-hỏi-bẫy-thầy-hay-hỏi--cách-trả-lời-ăn-điểm)
5. [Cheat Sheet lệnh Terminal cần gõ khi thầy yêu cầu demo](#5-cheat-sheet-lệnh-terminal-khi-thầy-bắt-thao-tác-ngay)

---

# 1. BẢNG TRA CỨU "Ở ĐÂU?" (WHERE IS THE CODE?)

Khi thầy chỉ vào bất kỳ tính năng nào và hỏi **"Đoạn này em viết ở file nào, hàm nào?"**, tra cứu ngay bảng này:

| Tính năng trên giao diện / Nghiệp vụ | File chịu trách nhiệm chính | Tên hàm / Component / Biến then chốt |
|---|---|---|
| **Công thức tính khoảng cách GPS** | `web/lib/geofence.js` (và `mobile/src/lib/geofence.js`) | `distanceMeters(a, b)` (Công thức Haversine) |
| **Logic phát hiện vào vùng (Geofence Tracker)** | `web/lib/geofence.js` | `createGeofenceTracker()`, hàm `.update(pos, pois)` |
| **Thời gian nghỉ (Cooldown 60s)** | `web/app/page.js` & `mobile/src/config.js` | Hằng số `COOLDOWN_MS = 60000`, `trackerRef.current.markPlayed(id)` |
| **Xử lý trùng lặp vùng (Nhiều vùng cùng lúc)** | `web/app/page.js` (dòng 170-176) & `web/lib/geofence.js` | Mảng `r.nearbyPois`, state `overlapPois`, chọn điểm gần nhất hoặc hiện popup |
| **Phát âm thanh ưu tiên Audio URL & fallback TTS** | `web/hooks/useNarration.js` | Hook `useNarration()`, hàm `speak(poi, lang)`, `new Audio()`, `playTTS()` |
| **Điều khiển âm thanh (Play/Pause/Resume/Stop)** | `web/hooks/useNarration.js` (dòng 100-135) | `pause()`, `resume()`, `stop()`, `audioRef.current`, `speechSynthesis` |
| **Theo dõi vị trí GPS thật của người dùng** | `web/hooks/useGeolocation.js` | `navigator.geolocation.watchPosition()`, các trạng thái `idle/waiting/ok/denied/unsupported` |
| **Giả lập vị trí (Điểm mẫu 1, Ngoài vùng, Click bản đồ)** | `web/components/SimulationPanel.js` & `web/app/page.js` | State `sim: { mode, pos, key }`, `onMapClick(pos)` |
| **Vẽ vòng tròn Geofence đa giác trên bản đồ** | `web/lib/circle.js` | `circlePolygon(lat, lng, radiusMeters, steps = 48)` |
| **Bản đồ Web & Chuyển đổi tự động OpenFreeMap/OSM** | `web/components/MapView.js` & `web/lib/mapConfig.js` | Component `MapView`, `STYLE_TIMEOUT_MS = 8000`, fallback `OSM_RASTER_STYLE` |
| **Quét mã QR qua Camera** | `web/components/QrScanner.js` | Thư viện `html5-qrcode`, `Html5QrcodeScanner` |
| **Mở địa điểm bằng Link QR (`?poi=` hoặc `?qr=`)** | `web/app/page.js` (dòng 140-160) & `web/lib/qr.js` | `extractCode()`, `findPoiByCode()`, `URLSearchParams` |
| **Bong bóng mã QR chia sẻ Web** | `web/components/AppQrBubble.js` | `qrcode.toDataURL()`, canvas tạo ảnh QR URL `se-2026-psi.vercel.app` |
| **Dự phòng dữ liệu khi mất mạng / không có API** | `web/hooks/usePois.js` & `web/lib/poiSource.js` | `fetchPois()`, fallback sang file `web/data/pois.json` (timeout 6s) |
| **Gửi thống kê lượt nghe / lượt quét ẩn danh** | `web/lib/poiSource.js` (hàm `sendEvent`) | Gọi API `POST /api/events` (`poiId`, `lang`, `type`, `source`, `client`) |
| **Heartbeat đếm số phiên online** | `web/hooks/useOnlinePresence.js` | Gọi API `POST /api/presence` mỗi 30s khi tab đang active |
| **Bản đồ chọn tọa độ trên Dashboard (MapPicker)** | `dashboard/components/MapPicker.js` | Component `MapPicker`, `map.on('click')`, marker `draggable`, vòng geofence |
| **Form thêm/sửa địa điểm & Nghe thử Audio** | `dashboard/components/PoiForm.js` | `poiToForm()`, `formToBody()`, thẻ `<audio controls src=...>` |
| **Thống kê Dashboard (Tổng hợp, Biểu đồ ngày, Lọc ngày)** | `dashboard/app/(admin)/page.js` | API `GET /api/admin/stats?from=...&to=...`, component `Bar` |
| **Tạo và tải ảnh mã QR trên Dashboard** | `dashboard/app/(admin)/qr/page.js` | `qrcode.toDataURL()`, tạo 2 loại: mã thuần (`DHSG-POI-001`) và link URL |
| **Phân quyền Dashboard (Admin vs Editor)** | `server/src/permissions.js` & `dashboard/lib/permissions.js` | Bảng quyền: `poi:create`, `poi:update`, `poi:delete`, `stats:read`, `user:manage` |
| **Chống tự khóa tài khoản Admin (Self-Lockout)** | `server/src/routes/admin.js` (dòng 173-175) | Kiểm tra `if (id === req.user.id && ...)` ném lỗi `SELF_LOCKOUT` (400) |
| **Giới hạn đăng nhập sai (Rate Limiting)** | `server/src/rateLimit.js` & `server/src/routes/auth.js` | 10 lần sai trong 15 phút $\to$ khóa tạm mã 429 (`TOO_MANY_ATTEMPTS`) |
| **Xác thực JWT & Timing-Safe Password Compare** | `server/src/routes/auth.js` & `server/src/middleware/auth.js` | `bcrypt.compare()`, `jwt.sign(..., { expiresIn: '8h' })`, `requireAuth()` |
| **Cơ sở dữ liệu (Schema & Seed 7 ngôn ngữ)** | `server/sql/schema.sql` & `server/sql/seed.sql` | 5 bảng: `languages`, `admins`, `pois`, `poi_translations`, `events`, `online_sessions` |

---

# 2. CHI TIẾT CÁC LUỒNG XỬ LÝ "NHƯ THẾ NÀO?" (HOW)

### 🌊 Luồng 1: Làm thế nào để hệ thống biết người dùng đi vào một địa điểm và tự phát thuyết minh?
1. **Lấy tọa độ:** Hook `useGeolocation` (`web/hooks/useGeolocation.js`) gọi API chuẩn của trình duyệt `navigator.geolocation.watchPosition` với cấu hình `{ enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }`.
2. **Tính khoảng cách:** Mỗi khi có tọa độ mới `position = { lat, lng }`, hàm `evaluate()` trong `web/app/page.js` gọi `trackerRef.current.update(position, pois)`.
3. **Thuật toán Haversine:** Hàm `distanceMeters` trong `web/lib/geofence.js` tính khoảng cách đường chim bay giữa người dùng và từng địa điểm với bán kính Trái Đất $R = 6.371.000\text{ m}$:
   $$\Delta\sigma = 2 \arcsin \sqrt{\sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos\varphi_1 \cos\varphi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)}$$
   $$\text{Khoảng cách } d = R \cdot \Delta\sigma$$
4. **Kiểm tra vùng (Geofence):** Nếu $d \le \text{radiusMeters}$, địa điểm nằm trong danh sách `inside`.
5. **Kiểm tra điều kiện kích hoạt phát:**
   * Địa điểm phải vừa chuyển trạng thái từ **NGOÀI VÙNG $\to$ VÀO TRONG VÙNG** (tránh trường hợp người dùng đứng yên một chỗ bị phát lặp đi lặp lại).
   * Địa điểm không nằm trong thời gian nghỉ **Cooldown 60 giây** (`COOLDOWN_MS`).
   * Nếu có nhiều địa điểm cùng thỏa mãn, chọn địa điểm **gần vị trí người dùng nhất**.
6. **Kích hoạt phát:** Gọi `playPoi(candidate, 'auto')`, đánh dấu `markPlayed(id)`, chọn tab hiển thị chi tiết và gửi sự kiện thống kê `listen` (nguồn `auto`) về server.

---

### 🌊 Luồng 2: Cơ chế phát âm thanh hoạt động như thế nào (Audio URL & Web Speech API)?
* **File quản lý:** `web/hooks/useNarration.js`.
* **Quy trình:**
  1. Khi người dùng bấm Phát hoặc hệ thống tự động phát: Hàm `speak(poi, lang)` được gọi.
  2. Dừng ngay thuyết minh cũ (`cleanupAudio()` và `speechSynthesis.cancel()`).
  3. **Bước 1 - Ưu tiên Audio File:** Kiểm tra xem địa điểm có trường `poi.audioUrl?.[lang]` hay không:
     * Nếu có URL hợp lệ: Khởi tạo đối tượng `new Audio(audioUrl)`.
     * Gắn sự kiện `audio.onended` để tự động chuyển về trạng thái `idle`.
     * Gắn sự kiện `audio.onerror`: Nếu link bị hỏng (404, mất mạng, file lỗi) $\to$ **Tự động chuyển ngay sang Bước 2 (Fallback TTS)**.
     * Gọi `audio.play()`. Cập nhật `status = 'playing'`.
  4. **Bước 2 - Đọc bằng Web Speech API (TTS):** Nếu không có audioUrl hoặc audio lỗi:
     * Khởi tạo `new SpeechSynthesisUtterance("<tên>. <mô tả>")`.
     * Thiết lập mã ngôn ngữ chuẩn tương ứng: `vi-VN`, `en-US`, `zh-CN`, `ja-JP`, `ko-KR`, `th-TH`, `de-DE`.
     * Quét danh sách giọng đọc của thiết bị (`synth.getVoices()`), chọn giọng đầu tiên khớp với ngôn ngữ.
     * Gọi `window.speechSynthesis.speak()`.
  5. **Điều khiển:**
     * `pause()`: Tạm dừng đồng thời cả thẻ `Audio` và `speechSynthesis`.
     * `resume()`: Tiếp tục phát từ vị trí tạm dừng.
     * `stop()`: Dừng hẳn, giải phóng đối tượng âm thanh, đưa trạng thái về `idle`.

---

### 🌊 Luồng 3: Quét mã QR và mở địa điểm hoạt động như thế nào?
1. **Hai hình thức mở bằng QR:**
   * **Quét trực tiếp qua Camera:** Dùng component `QrScanner.js` (dựa trên thư viện `html5-qrcode`). Khi camera giải mã được chuỗi (ví dụ `DHSG-POI-002` hoặc URL `https://se-2026-psi.vercel.app/?qr=DHSG-POI-002`), hàm `openByQr(raw)` được gọi.
   * **Mở web kèm tham số URL:** Người dùng dùng camera điện thoại quét mã QR loại liên kết, trình duyệt mở trang web kèm query string `?poi=poi-002` hoặc `?qr=DHSG-POI-002`.
2. **Xử lý tách mã (`web/lib/qr.js`):**
   * Hàm `extractCode(raw)` dùng regex kiểm tra: nếu là URL thì lấy giá trị của param `poi` hoặc `qr`; nếu là chuỗi thuần thì cắt khoảng trắng và viết hoa.
   * Hàm `findPoiByCode(pois, code)` so sánh không phân biệt hoa thường với cả trường `id` (`poi-002`) và `qrCode` (`DHSG-POI-002`).
3. **Mở giao diện & Ghi nhận thống kê:**
   * Chọn địa điểm đó trong danh sách, mở giao diện chi tiết.
   * Gửi một sự kiện `POST /api/events` với `type: 'qr_scan'` để hệ thống ghi nhận một lượt quét QR.

---

### 🌊 Luồng 4: Bộ chọn tọa độ MapPicker trên Dashboard hoạt động như thế nào?
* **File:** `dashboard/components/MapPicker.js` & `dashboard/lib/circle.js`.
* **Cách thức:**
  1. Sử dụng thư viện `maplibre-gl` nhúng bản đồ nền OpenStreetMap (`OSM_STYLE`).
  2. Khi form mở ra: Nếu đã có tọa độ thì di chuyển tâm bản đồ tới đó; nếu chưa có thì mặc định hiển thị tại tâm trường ĐHSG `[106.6822, 10.7599]` với mức zoom 17.
  3. **Vẽ vùng Geofence:** Dùng hàm `circlePolygon(lat, lng, radius)` tính toán đa giác 48 đỉnh dạng GeoJSON và đưa vào MapLibre source `picker-zone` với 2 layer (vùng màu xanh nhạt `picker-zone-fill` và viền xanh đậm `picker-zone-stroke`).
  4. **Tương tác 2 chiều:**
     * Khi click chuột lên bản đồ: Lấy `e.lngLat`, làm tròn 6 chữ số thập phân, gọi callback `onChange({ latitude, longitude })` để cập nhật vào state của `PoiForm.js`.
     * Marker màu đỏ là dạng `draggable`: Khi người dùng kéo thả marker, sự kiện `dragend` cũng cập nhật lại tọa độ.
     * Khi người dùng gõ số vào ô "Bán kính vùng (mét)": Vòng tròn trên bản đồ tự động co giãn theo thời gian thực.

---

### 🌊 Luồng 5: Cơ chế dự phòng ngoại tuyến (Offline & Fallback) hoạt động ra sao?
* **File:** `web/hooks/usePois.js` và `web/lib/poiSource.js`.
* **Nguyên lý:**
  1. Khi mở ứng dụng: Mặc định hiển thị ngay dữ liệu từ file tĩnh nội bộ `web/data/pois.json` để giao diện có dữ liệu tức thì (Zero-wait loading), đánh dấu nguồn là `loading`.
  2. Nếu có cấu hình `NEXT_PUBLIC_API_URL`: Gửi yêu cầu `GET /api/pois` với cơ chế timeout tự hủy sau 6 giây (`AbortController`).
  3. **Nếu API thành công:** Cập nhật danh sách POI mới nhất từ server, đánh dấu nguồn là `api`.
  4. **Nếu API lỗi / Mất mạng / Quá 6s:** Giữ nguyên dữ liệu từ file `pois.json`, đánh dấu nguồn là `fallback`. Ứng dụng vẫn hoạt động bình thường, tự động phát và quét QR bình thường (chỉ không gửi được thống kê về máy chủ).

---

### 🌊 Luồng 6: Cơ chế Bảo mật, Đăng nhập & Phân quyền trên Backend
* **Mật khẩu:** Băm một chiều bằng `bcryptjs` với salt rounds = 10 (`server/src/routes/admin.js`). Mật khẩu gốc không bao giờ được lưu trong database.
* **Chống tấn công thời gian (Timing-safe):** Khi đăng nhập, kể cả khi email không tồn tại trong hệ thống, server vẫn chạy hàm băm giả định để thời gian phản hồi bằng nhau, ngăn hacker dò xem email có trong hệ thống hay không.
* **Rate Limiting:** `server/src/rateLimit.js` lưu bộ đếm số lần đăng nhập sai theo cặp `(IP, Email)`. Sai quá 10 lần trong 15 phút sẽ bị khóa tạm thời (HTTP 429).
* **Token JWT:** Cấp token thuật toán `HS256`, thời hạn 8 giờ. Khi client gửi request có header `Authorization: Bearer <token>`, middleware `requireAuth` (`server/src/middleware/auth.js`) giải mã token và tra lại vào DB. Nếu tài khoản bị khóa (`is_active = false`), request bị từ chối ngay lập tức.
* **Phân quyền (RBAC):** Middleware `requirePermission(perm)` kiểm tra quyền theo bảng quyền tập trung tại `server/src/permissions.js`:
  * Vai trò `editor`: Xem/thêm/sửa POI, xem thống kê.
  * Vai trò `admin`: Có toàn bộ quyền của editor + quyền xóa POI (`poi:delete`) và quản lý tài khoản (`user:manage`).

---

# 3. GIẢI THÍCH CÁC QUYẾT ĐỊNH THIẾT KẾ "VÌ SAO?" (WHY?)

Thầy cô rất thích hỏi câu hỏi: *"Tại sao em không dùng X mà lại dùng Y?"*. Dưới đây là câu trả lời chuẩn chỉ:

### ❓ 1. Tại sao dùng công thức Haversine thuần mà không dùng thư viện ngoài (như Turf.js)?
> **Trả lời:** "Dạ thưa thầy, khuôn viên Đại học Sài Gòn có diện tích khoảng vài hecta, cự ly giữa các địa điểm chỉ từ 10m đến 300m. Công thức Haversine được cài đặt thuần trong `geofence.js` chỉ mất khoảng 15 dòng code, độ chính xác sai số dưới 0.5m trên bề mặt Trái Đất, tốc độ tính toán cực nhanh (dưới 1 mili-giây cho toàn bộ danh sách POI) và giúp giảm bớt bundle size của ứng dụng di động/web PWA, không cần phụ thuộc thêm thư viện nặng như Turf.js."

### ❓ 2. Tại sao dùng MapLibre GL JS + OpenFreeMap / OpenStreetMap mà không dùng Google Maps API?
> **Trả lời:** "Dạ thưa thầy, nhóm chọn MapLibre GL JS kết hợp OpenFreeMap vector vì:
> 1. Hoàn toàn miễn phí, mã nguồn mở, không yêu cầu thẻ tín dụng hay API Key bị giới hạn quota như Google Maps API.
> 2. Cho phép hiển thị bản đồ vector mượt mà, hỗ trợ phóng to chi tiết trong khuôn viên trường.
> 3. Nhóm có thiết kế cơ chế **tự động dự phòng (Failover)**: nếu OpenFreeMap không phản hồi trong 8 giây, hệ thống tự động chuyển sang ô ảnh raster của OpenStreetMap chuẩn (`OSM_RASTER_STYLE`), đảm bảo bản đồ không bao giờ bị trắng màn hình."

### ❓ 3. Tại sao backend dùng SQL thuần với thư viện `pg` mà không dùng ORM (Prisma/TypeORM)?
> **Trả lời:** "Dạ thưa thầy, hệ thống có các câu truy vấn thống kê phức tạp (tổng hợp lượt nghe theo ngày với `generate_series`, lọc đa chiều theo POI, ngôn ngữ và nguồn phát, zero-filling cho những ngày không có sự kiện). Viết SQL thuần:
> 1. Giúp nhóm làm chủ hoàn toàn câu lệnh truy vấn, tối ưu hóa index (`poi_id`, `created_at`).
> 2. Nhẹ hơn rất nhiều so với ORM, thời gian khởi động serverless trên Vercel nhanh (không bị dính cold-start nặng như Prisma).
> 3. Đáp ứng đúng chuẩn kiến trúc môn học về thiết kế lược đồ quan hệ chuẩn hóa (3NF)."

### ❓ 4. Tại sao lại dùng PGlite trong bộ kiểm thử (Unit Test)?
> **Trả lời:** "Dạ, `@electric-sql/pglite` là một bản PostgreSQL biên dịch sang WebAssembly chạy trực tiếp trong bộ nhớ của Node.js. Nhờ đó, nhóm có thể chạy 11 bài kiểm thử API backend trong CI/CD GitHub Actions với môi trường PostgreSQL thật 100% mà không cần phải dựng container Docker hay kết nối database internet, thời gian chạy test chỉ mất chưa đầy 4 giây."

### ❓ 5. Tại sao phải có thời gian nghỉ Cooldown 60 giây và cơ chế vào/ra vùng?
> **Trả lời:** "Dạ thưa thầy, tín hiệu GPS trên điện thoại thực tế có sai số từ 3m đến 10m do điều kiện thời tiết và che khuất tòa nhà. Hiện tượng này gọi là hiện tượng trôi GPS (GPS Drift/Jitter). Nếu không có cơ chế chỉ kích hoạt khi chuyển trạng thái (NGOÀI $\to$ TRONG) và không có thời gian nghỉ Cooldown 60 giây, khi người dùng đứng nói chuyện ở mép vòng tròn, tọa độ nhảy ra nhảy vào liên tục sẽ làm máy phát thuyết minh lặp đi lặp lại gây khó chịu cho người tham quan."

### ❓ 6. Tại sao hệ thống không gửi tọa độ GPS của người dùng lên máy chủ?
> **Trả lời:** "Dạ, đây là nguyên tắc **Privacy by Design (Bảo vệ quyền riêng tư)**. Ứng dụng xử lý tính toán Geofence hoàn toàn ở phía client (trình duyệt của người dùng). Máy chủ chỉ nhận sự kiện ẩn danh khi người dùng đã thực sự nghe thuyết minh (`poiId`, `lang`) hoặc quét mã QR. Máy chủ không hề lưu lịch sử di chuyển hay danh tính của người tham quan."

---

# 4. CÁC CÂU HỎI "BẪY" THẦY HAY HỎI & CÁCH TRẢ LỜI ĂN ĐIỂM

#### ⚠️ Bẫy 1: "Nếu người dùng mở web lên, đi vào vùng địa điểm thì web có tự phát tiếng được ngay không khi người dùng CHƯA bấm gì vào màn hình?"
* **Câu trả lời chuẩn:**
  > "Dạ thưa thầy, các trình duyệt hiện đại (Chrome, Safari, Edge) đều có chính sách **Autoplay Policy** rất nghiêm ngặt: trình duyệt sẽ chặn phát âm thanh nếu người dùng chưa có tương tác (User Gesture) đầu tiên với trang web.  
  > Nhóm đã giải quyết vấn đề này rất tinh tế bằng trải nghiệm người dùng: Mặc định tính năng Tự động phát là **TẮT**. Khi người dùng bấm nút **'Tự động phát: BẬT'** trên thanh điều khiển, thao tác bấm đó chính là một User Gesture hợp lệ, cấp quyền cho trình duyệt phát âm thanh tự động cho toàn bộ hành trình sau đó mà không bị chặn."

#### ⚠️ Bẫy 2: "Nếu người dùng đứng ở vị trí giao nhau giữa 2 địa điểm (chồng lấn vùng) thì hệ thống làm sao?"
* **Câu trả lời chuẩn:**
  > "Dạ, nhóm xử lý 2 cấp:
  > 1. **Về mặt tự động phát:** Thuật toán trong `geofence.js` sẽ tính khoảng cách tới cả 2 điểm, và **ưu tiên điểm có khoảng cách gần vị trí người dùng nhất**.
  > 2. **Về mặt giao diện:** Nếu người dùng đang đứng trong nhiều hơn 1 vùng, trên màn hình sẽ xuất hiện một hộp thoại nổi (`overlapChoice`) thông báo *'Bạn đang ở gần nhiều địa điểm'* kèm danh sách các địa điểm xung quanh để người dùng chủ động chọn nghe theo ý muốn."

#### ⚠️ Bẫy 3: "Nếu Admin lỡ tay tự khóa tài khoản của mình hoặc hạ vai trò của chính mình thì sao?"
* **Câu trả lời chuẩn:**
  > "Dạ, trên cả giao diện và Backend nhóm đều đã chặn tình huống này (gọi là **Self-Lockout Protection**). Trong file `server/src/routes/admin.js` dòng 173, backend kiểm tra: nếu `id` tài khoản cập nhật trùng với `req.user.id` trong token, backend sẽ cấm hạ vai trò khỏi admin và cấm đặt `isActive = false`, trả về lỗi mã 400 `SELF_LOCKOUT`. Điều này đảm bảo hệ thống luôn luôn có ít nhất một tài khoản Quản trị hoạt động."

#### ⚠️ Bẫy 4: "Mã QR được in ra dán lên tường rồi, lỡ sau này Admin đổi tên hoặc đổi nội dung địa điểm thì mã QR có bị vô hiệu không?"
* **Câu trả lời chuẩn:**
  > "Dạ không bao giờ bị hỏng thưa thầy. Mã QR được sinh theo quy tắc cố định: `DHSG-` + ID địa điểm (ví dụ `DHSG-POI-001`). Khi sửa địa điểm ở API `PUT /api/admin/pois/:id`, server chỉ cho phép cập nhật tọa độ, bán kính, trạng thái và các bản dịch. Trường `qr_code` là **bất biến (immutable)**, không bị thay đổi khi sửa dữ liệu, nên biển mã QR đã in ra dán thực tế vẫn luôn mở đúng địa điểm đó."

---

# 5. CHEAT SHEET LỆNH TERMINAL KHI THẦY BẮT THAO TÁC NGAY

Nếu thầy yêu cầu mở máy tính và kiểm tra ngay tại chỗ, hãy mở PowerShell và gõ các lệnh sau:

### 1. Chạy Unit Test kiểm tra thuật toán Geofence (Web)
```powershell
cd campus-guide-repos/web
npm.cmd test
```
*(Kết quả: 9/9 tests passed - chứng minh tính toán khoảng cách, geofence, cooldown, QR chuẩn xác)*

### 2. Chạy Kiểm thử tích hợp Backend (Server)
```powershell
cd campus-guide-repos/server
npm.cmd test
```
*(Kết quả: 11/11 tests passed - kiểm tra login, phân quyền, CRUD, rate limit, thống kê)*

### 3. Kiểm tra Build Production (Chứng minh không có lỗi cú pháp)
```powershell
cd campus-guide-repos/web
npm.cmd run build

cd ../dashboard
npm.cmd run build
```
*(Cả 2 module đều xuất hiện dấu tích xanh ✓ Compiled successfully)*

### 4. Khởi động chạy thử cục bộ 3 phần (nếu demo localhost)
* Terminal 1 (Backend):
  ```powershell
  cd campus-guide-repos/server
  npm.cmd run dev
  # Chạy tại http://localhost:4000
  ```
* Terminal 2 (Web PWA):
  ```powershell
  cd campus-guide-repos/web
  npm.cmd run dev
  # Chạy tại http://localhost:3000
  ```
* Terminal 3 (Dashboard quản trị):
  ```powershell
  cd campus-guide-repos/dashboard
  npm.cmd run dev -- -p 3001
  # Chạy tại http://localhost:3001
  ```
* Terminal 4 (App Mobile Expo):
  ```powershell
  cd campus-guide-repos/mobile
  npx.cmd expo start
  # Quét mã QR bằng Expo Go trên điện thoại
  ```

---
> 💡 **Lời khuyên khi trình bày:**  
> Luôn giữ thái độ tự tin, khi thầy hỏi tính năng nào hãy mở ngay file tương ứng theo **Bảng 1**, giải thích ngắn gọn theo luồng **Nhận Input $\to$ Xử lý thuật toán $\to$ Trả về Output trên màn hình**. Chúc nhóm đạt điểm tối đa!
