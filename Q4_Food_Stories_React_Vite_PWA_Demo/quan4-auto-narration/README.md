# Q4 Food Stories

Ứng dụng hướng dẫn khám phá các điểm ẩm thực và địa điểm quanh Quận 4 bằng bản đồ, GPS và thuyết minh âm thanh. Được xây dựng với React, Vite và PWA; có thể mở trên điện thoại bằng trình duyệt và thêm vào màn hình chính.

## Chức năng

- Bản đồ OpenStreetMap với các điểm dừng quanh Quận 4.
- Nội dung tiếng Việt, tiếng Anh, tiếng Nhật và tiếng Hàn.
- Định vị GPS và tính khoảng cách tới các điểm dừng.
- Tự phát lời thuyết minh khi đi vào bán kính kích hoạt; có thể bật, tắt và điều chỉnh bán kính.
- Bán kính đã chọn lọc các điểm trên bản đồ và danh sách; khoảng cách từng điểm được tính từ vị trí GPS hiện tại.
- Nút phát thủ công, tạm dừng và phát lại lời thuyết minh.
- Tệp audio có sẵn cho tiếng Việt và tiếng Anh; các ngôn ngữ khác sử dụng giọng đọc của trình duyệt khi hỗ trợ.
- Có thể cài như PWA trên thiết bị hỗ trợ.
- Có điểm tích hợp sẵn cho lượt mở app, bắt đầu nghe và nghe hết thuyết minh; chưa gửi dữ liệu khi chưa cấu hình API.

## Yêu cầu

- Node.js LTS (khuyến nghị Node.js 20 trở lên)
- npm
- Kết nối Internet để tải package và bản đồ

## Chạy trên Windows

1. Mở thư mục `quan4-auto-narration` trong VS Code.
2. Chọn **Terminal → New Terminal**.
3. Cài package và khởi động ứng dụng:

```bash
npm install
npm run dev
```

4. Mở địa chỉ mà Vite in ra, thường là `http://localhost:5173`.

## Xuất bản

Tạo bản production:

```bash
npm run build
```

Thư mục `dist` được tạo ra. Tải nội dung trong thư mục này lên dịch vụ hosting hỗ trợ HTTPS để người dùng truy cập bằng đường dẫn công khai. Trên iPhone, mở đường dẫn bằng Safari, chọn **Chia sẻ → Thêm vào Màn hình chính** để thêm biểu tượng ứng dụng.

## Sử dụng

1. Mở ứng dụng và chọn ngôn ngữ.
2. Nhấn **Bật GPS & bắt đầu** và cho phép trình duyệt truy cập vị trí.
3. Điều chỉnh **Bán kính kích hoạt** để giới hạn các điểm được hiển thị quanh bạn; vòng tròn trên bản đồ và danh sách sẽ cập nhật theo bán kính này.
4. Khi đến gần một điểm dừng trong bán kính, ứng dụng sẽ phát lời thuyết minh nếu tự động phát đang bật. Có thể chọn điểm trên danh sách để xem thông tin hoặc phát thủ công.
5. Nếu trình duyệt chặn âm thanh tự động, nhấn nút phát trên thẻ nội dung.
6. Nhấn **Tắt tự động** để dừng GPS; ứng dụng xóa vị trí hiện tại và hiển thị lại tất cả các điểm.

GPS chỉ hoạt động qua HTTPS hoặc `localhost`. Vị trí cần được cho phép trong cài đặt của trình duyệt và thiết bị. Tài nguyên bản đồ cần kết nối Internet.

## Cập nhật điểm đến và âm thanh

Danh sách địa điểm, tọa độ, bán kính, mô tả và đường dẫn âm thanh nằm trong `src/data/pois.js`. Tệp âm thanh được đặt trong `public/audio/`. Khi thêm hoặc sửa nội dung, hãy kiểm tra tên địa điểm, tọa độ, mô tả, giờ hoạt động và đường dẫn âm thanh trước khi xuất bản.

Thông tin địa điểm và giờ hoạt động có thể thay đổi. Ứng dụng hiện không có backend, cơ sở dữ liệu hay dịch vụ đọc văn bản phía máy chủ; giọng đọc phụ thuộc vào trình duyệt và thiết bị.

## Chuẩn bị thống kê sử dụng

Ứng dụng có thể phát các sự kiện `app_open`, `narration_play` và `narration_complete` tới một API do dự án quản lý. Để bật gửi sự kiện, đặt `VITE_ANALYTICS_ENDPOINT` trong môi trường build (xem `quan4-auto-narration/.env.example`) thành URL HTTPS của API rồi build và xuất bản lại. Nếu biến này để trống, sự kiện không được gửi hoặc lưu và chưa có dữ liệu tổng hợp cho dashboard.

Payload chỉ gồm loại sự kiện, thời điểm UTC và — với lượt nghe — mã điểm cùng mã ngôn ngữ. Không gửi GPS, tên, email hay tài khoản. Tuy nhiên, máy chủ nhận request có thể nhìn thấy địa chỉ IP ở tầng mạng; API/hosting cần tránh lưu IP hoặc xóa/ẩn danh hóa IP nếu yêu cầu là không lưu địa chỉ IP. Chỉ gửi dữ liệu tới API sau khi đã cấu hình quyền riêng tư và chính sách lưu trữ phù hợp.
