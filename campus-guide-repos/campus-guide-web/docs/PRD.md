# PRD — Thuyết Minh Tự Động Đa Ngôn Ngữ tại Khuôn Viên Đại Học Sài Gòn
### Hướng 1: Frontend (React Native + React.js) kèm CD/CI

**Phiên bản:** 1.0 (bản nháp để nhóm thảo luận) · **Ngày:** 13/10/2026
**Trạng thái:** nhiều phần còn là **giả định, chưa xác nhận với thầy** (xem cách đọc ở mục 0)

---

## 0. Cách đọc tài liệu này

**PRD (Product Requirements Document)** là tài liệu trả lời 4 câu hỏi:
1. Ta xây cái gì? 2. Cho ai và để giải quyết vấn đề gì? 3. Phải làm được gì và tốt tới đâu? 4. Làm xong khi nào và đo bằng cách nào?

Nếu ai đó đọc tài liệu này mà không cần hỏi thêm vẫn hiểu sản phẩm, thì PRD đạt yêu cầu.

Mỗi nội dung quan trọng trong tài liệu được gắn một nhãn để khi có người hỏi, bạn biết **cái nào là chắc, cái nào chỉ là nhóm đang tự chọn**:

| Nhãn | Ý nghĩa |
|---|---|
| **[CHẮC]** | Có trong slide của thầy hoặc do nhóm đã xác nhận |
| **[SUY RA]** | Suy ra từ tên đề "Thuyết minh tự động đa ngôn ngữ", chưa có tài liệu nào của thầy xác nhận |
| **[GIẢ ĐỊNH]** | Nhóm tự chọn, **chưa hỏi thầy** |
| **[CHƯA CHỐT]** | Chưa có quyết định |

---

## 1. Thông tin chung

| Mục | Nội dung | Nhãn |
|---|---|---|
| Đề tài | Thuyết minh tự động đa ngôn ngữ | [CHẮC] |
| Hướng của nhóm | Hướng 1: FE Dev (React Native + React.js), xử lý giao diện trên Web và Mobile, bao gồm CD/CI | [CHẮC] |
| Số thành viên | 3 | [CHẮC] |
| Giao tiếp và nộp bài | Qua GitHub, nộp báo cáo cuối kỳ (đồ án) | [CHẮC] |
| Mốc thời gian | Tuần 7: kiểm tra tiến độ giữa kỳ. Tuần 11, 12: báo cáo cuối kỳ | [CHẮC] |
| Chủ đề cụ thể | Khuôn viên Đại học Sài Gòn (ĐHSG) | [CHẮC] |

---

## 2. Bối cảnh và vấn đề

Người đến một khuôn viên trường lần đầu (ví dụ sinh viên mới, khách mời, đoàn tham quan) thường không biết mỗi khu vực là gì và có gì đáng chú ý. Nếu là người nước ngoài thì còn thêm rào cản ngôn ngữ.

**Ý tưởng:** một ứng dụng giống "hướng dẫn viên ảo". App biết vị trí của người dùng, khi họ đi vào vùng của một địa điểm thì **tự động phát thuyết minh** theo ngôn ngữ họ chọn. Cách hoạt động này tham khảo từ file HTML "Hệ thống Du lịch Ẩm thực Quận 4" mà nhóm đang có.

> **[GIẢ ĐỊNH]** Việc coi đây là bài toán "người mới đến khuôn viên" là mô tả của nhóm mình, chưa có tài liệu nào của thầy nói về người dùng mục tiêu.

---

## 3. Mục tiêu và phạm vi

### Trong phạm vi
- Xây **giao diện app di động** bằng React Native và **giao diện web** bằng React.js. **[CHẮC]**
- Thiết lập **CD/CI** cho code trên GitHub. **[CHẮC]**
- Dùng **dữ liệu giả (mock API)** để làm độc lập. **[GIẢ ĐỊNH]**

### Ngoài phạm vi
- Xây backend thật (hướng 2 và 3 của slide). **[CHẮC]**
- Trang quản trị cho admin hay chủ địa điểm. **[GIẢ ĐỊNH]**
- Dịch tự động và tạo giọng đọc bằng dịch vụ backend. **[GIẢ ĐỊNH]**

**Giải thích ngắn:** FE là phần người dùng nhìn và chạm vào. BE là phần xử lý và lưu dữ liệu ở phía sau. Nhóm chỉ làm FE, nên dữ liệu địa điểm được giả lập bằng file JSON.

---

## 4. Người dùng mục tiêu **[GIẢ ĐỊNH]**

| Nhóm | Nhu cầu chính |
|---|---|
| Người nước ngoài / người không đọc tiếng Việt | Nghe thuyết minh bằng ngôn ngữ mình chọn |
| Sinh viên mới, khách mời | Biết mỗi địa điểm là gì mà không cần người dẫn |
| Người đang ở nơi sóng yếu | App vẫn dùng được cơ bản (mức độ hỗ trợ offline **[CHƯA CHỐT]**) |

---

## 5. Tính năng

Mỗi tính năng có mã F để tiện trích dẫn.

### F1. Chọn ngôn ngữ **[SUY RA]**
Người dùng chọn ngôn ngữ giao diện và ngôn ngữ thuyết minh. Cần có Tiếng Việt và Tiếng Anh. Thêm 1 đến 2 ngôn ngữ nữa: **[CHƯA CHỐT]**. Nếu một địa điểm chưa có bản dịch ngôn ngữ đã chọn thì app dùng ngôn ngữ thay thế và báo cho người dùng biết. **[GIẢ ĐỊNH]**

### F2. Danh sách và chi tiết địa điểm **[SUY RA]**
Người dùng xem danh sách địa điểm (POI), mở trang chi tiết (tên, mô tả, hình), và bấm nút nghe lại thuyết minh bất cứ lúc nào, không cần đứng gần.

### F3. Định vị và bản đồ **[GIẢ ĐỊNH]**
App xin quyền vị trí, hiển thị vị trí hiện tại của người dùng và các địa điểm trên bản đồ. Thư viện bản đồ **[CHƯA CHỐT]**.

### F4. Tự động phát thuyết minh khi vào vùng địa điểm (tính năng lõi) **[GIẢ ĐỊNH]**
- Mỗi địa điểm có một **vùng tròn ảo** (geofence) quanh nó.
- Khi người dùng đi vào vùng, app tự phát thuyết minh theo ngôn ngữ đã chọn.
- Có thời gian chờ ngắn trước khi xác nhận "đã vào vùng" (để tránh GPS nhảy nhiễu) và thời gian nghỉ sau khi rời vùng (để không phát lặp liên tục).
- Nếu nhiều địa điểm chồng vùng nhau thì chỉ phát một, theo thứ tự ưu tiên rồi khoảng cách. Mỗi lúc chỉ có một audio đang phát.

**Số tham khảo từ file HTML** (chưa kiểm chứng cho khuôn viên trường, cần chỉnh lại sau khi thử thực tế): bán kính 30 mét, đọc GPS tối đa mỗi 5 giây, chờ xác nhận 3 giây, nghỉ 5 phút. Khuôn viên nhỏ, các điểm gần nhau, nên 30 mét có thể bị chồng vùng.

### F5. Phát audio **[GIẢ ĐỊNH]**
- Ưu tiên phát file audio có sẵn của địa điểm (đường dẫn `audioUrl` trong dữ liệu mock).
- Nếu không có file, dùng giọng đọc có sẵn trên thiết bị để đọc nội dung văn bản.
- Các cách tạo giọng đọc bằng backend (dịch và tạo giọng theo yêu cầu) nằm ngoài phạm vi vì nhóm không làm backend.
- Thư viện đọc giọng cho React Native: **[CHƯA CHỐT]**.

### F6. Quét QR để mở địa điểm (dự phòng để demo) **[GIẢ ĐỊNH]**
Vì khó đi bộ thật khi demo trong lớp, người dùng có thể quét mã QR đặt tại điểm để mở đúng địa điểm và phát thuyết minh. Thư viện quét QR: **[CHƯA CHỐT]**.

### Ngoài danh sách hiện tại **[CHƯA CHỐT]**
Chế độ offline đầy đủ (tải trước dữ liệu và bản đồ), đồng bộ dữ liệu từng phần, và web làm tới đâu so với mobile.

---

## 6. Yêu cầu chất lượng (phi chức năng)

| Tiêu chí | Yêu cầu | Nhãn |
|---|---|---|
| Pin | Giới hạn tần suất đọc GPS để không hao pin nhanh | [GIẢ ĐỊNH] |
| Phản hồi | Phát audio có sẵn không bị giật, không chồng hai audio | [GIẢ ĐỊNH] |
| Quyền riêng tư | Chỉ xin quyền vị trí khi cần và giải thích lý do; không gửi vị trí đi đâu khi chưa có backend thật | [GIẢ ĐỊNH] |
| Đa nền tảng | Web (React.js) và mobile (React Native) | [CHẮC] |

---

## 7. Dữ liệu (mock API)

Mỗi địa điểm có các trường chính (xem `mock-api/data/pois.json` trong 2 repo):

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã địa điểm |
| `qrCode` | Nội dung mã QR của địa điểm |
| `location` | Vĩ độ, kinh độ, bán kính vùng (hiện để trống, nhóm tự điền theo khuôn viên thật) |
| `active` | Còn hiển thị hay không |
| `translations` | Tên, mô tả và `audioUrl` theo từng ngôn ngữ |

**Lưu ý:** web và mobile mỗi bên giữ một bản sao `pois.json` (theo lựa chọn 2 repo). Khi sửa cấu trúc dữ liệu phải sửa ở cả hai nơi, nếu không hai app sẽ lệch nhau. **[RỦI RO]**

Nội dung thật của từng điểm trong khuôn viên (tên, mô tả, tọa độ) là việc của nhóm tự thu thập. Hiện tài liệu chưa có nội dung nào như vậy.

---

## 8. Kiến trúc phía FE **[GIẢ ĐỊNH]**

- **2 repo riêng:** `campus-guide-web` (React.js) và `campus-guide-mobile` (React Native CLI, JavaScript). Tên repo là tên tạm.
- Các khối chính trong `src/services/` của mỗi repo:
  - `location`: đọc GPS.
  - `geofence`: tính khoảng cách, xác nhận vào/ra vùng.
  - `narration`: chọn địa điểm cần phát, quản lý hàng đợi.
  - `audio`: phát audio hoặc giọng đọc của thiết bị.
  - `qr`: quét QR (dự phòng).
  - `api`: đọc dữ liệu từ mock.
- Tách `api` ra riêng để sau này đổi từ dữ liệu giả sang backend thật chỉ cần sửa một chỗ.

---

## 9. CD/CI

**CI (Continuous Integration, tích hợp liên tục):** mỗi lần ai đó đẩy code lên GitHub, một hệ thống tự động kiểm tra code có lỗi không, chạy kiểm thử và thử build. Mục đích là phát hiện lỗi sớm, trước khi lỗi lan vào code chung.

**CD (Continuous Delivery/Deployment, chuyển giao liên tục):** nếu CI thành công thì bản mới tự động được đưa ra để dùng thử (ví dụ link web để xem, hoặc file cài đặt app).

| Nội dung | Nhãn |
|---|---|
| Yêu cầu có CD/CI | [CHẮC] |
| Dùng GitHub Actions (đã có file `ci.yml` khung trong 2 repo, chưa chạy thử) | [GIẢ ĐỊNH] |
| CD cho web đưa lên đâu | [CHƯA CHỐT] |
| CD cho mobile tới mức nào (chỉ build file cài đặt hay phát hành) | [CHƯA CHỐT], nên hỏi thầy |

---

## 10. Mốc thời gian

| Mốc | Thời điểm | Nhãn |
|---|---|---|
| Kiểm tra tiến độ giữa kỳ | Tuần 7 | [CHẮC] |
| Báo cáo cuối kỳ | Tuần 11, 12 | [CHẮC] |
| Thầy cần thấy gì ở mỗi mốc | Chưa rõ | [CHƯA CHỐT], nên hỏi thầy |

**Đề xuất của mình cho nhóm cân nhắc, không phải yêu cầu của thầy:** đến tuần 7 nên có khung app chạy được, chọn ngôn ngữ, danh sách và chi tiết địa điểm với mock, và CI chạy được. Phần geofence và chỉnh các con số làm tiếp sau đó.

---

## 11. Tiêu chí hoàn thành **[GIẢ ĐỊNH]**

- [ ] Mở app, xin quyền vị trí và hiển thị đúng vị trí hiện tại.
- [ ] Vào vùng của một địa điểm thì audio tự phát đúng ngôn ngữ đang chọn, không phát lặp liên tục khi đứng ở rìa vùng.
- [ ] Đổi ngôn ngữ thì lần phát sau dùng ngôn ngữ mới.
- [ ] Địa điểm không có audio thì app vẫn đọc được nội dung bằng giọng của thiết bị.
- [ ] Quét QR mở đúng địa điểm (dự phòng để demo).
- [ ] Mỗi lần đẩy code lên GitHub, CI tự chạy và báo kết quả.
- [ ] Có bản demo để người ngoài xem mà không phải cài môi trường phát triển.

---

## 12. Câu hỏi mở cần hỏi thầy

1. "Tự động" trong đề là tự phát theo vị trí, theo mã QR, hay tự sinh giọng đọc?
2. FE lấy dữ liệu từ đâu: backend của nhóm khác, tự mock, hay dịch vụ có sẵn?
3. Cần hỗ trợ những ngôn ngữ nào ngoài Việt và Anh?
4. Mobile có bắt buộc dùng React Native CLI không, hay dùng được Expo?
5. Môn yêu cầu những loại UML nào và nộp ở dạng nào?
6. Mốc tuần 7 thầy cần thấy những gì? CD yêu cầu tới mức nào?
7. Web cần làm đầy đủ như mobile, hay chỉ một phần?

---

## 13. Nguồn tham khảo

- Slide của thầy (3 hướng, yêu cầu nhóm, mốc thời gian).
- File HTML "Hệ thống Du lịch Ẩm thực Quận 4": tham khảo cách hoạt động của geofence và phát audio. Nếu nguồn này là của người khác, nhóm nên ghi nguồn rõ trong báo cáo.
- Bài mẫu của bạn (các file user story): tham khảo ý tưởng dùng mã QR và cách tổ chức địa điểm theo nhiều bản dịch.

---

## 14. Bảng thuật ngữ

| Thuật ngữ | Giải thích ngắn |
|---|---|
| **FE / BE** | Frontend là phần giao diện người dùng thấy; Backend là phần xử lý và lưu dữ liệu phía sau |
| **POI** | Point of Interest, một địa điểm đáng chú ý trên bản đồ |
| **Geofence** | Vùng tròn ảo quanh một địa điểm, dùng để biết người dùng đã bước vào hay chưa |
| **GPS** | Hệ thống định vị, cho biết tọa độ của thiết bị |
| **TTS** | Text-to-Speech, chuyển chữ thành giọng nói |
| **Debounce** | Chờ một chút trước khi hành động, để tránh phản ứng nhầm với tín hiệu nhiễu |
| **Throttle** | Giới hạn tần suất một hành động, ví dụ chỉ đọc GPS mỗi vài giây |
| **Cooldown** | Thời gian nghỉ trước khi cho phép kích hoạt lại |
| **Mock API** | Dữ liệu giả lập để làm độc lập khi chưa có backend thật |
| **CI / CD** | Tự động kiểm tra code (CI) và tự động đưa bản mới ra dùng thử (CD) |
| **API** | "Cổng giao tiếp" để app xin dữ liệu |
| **QR** | Mã vuông quét bằng camera để mở nhanh một nội dung |
