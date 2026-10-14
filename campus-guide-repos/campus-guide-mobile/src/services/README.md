# services/

Tầng gọi dữ liệu và các dịch vụ của app. Giữ riêng để sau này đổi từ mock API sang backend thật chỉ cần sửa ở đây.

LÕI (theo hướng "tự động" của đề tài):
- `location`  : đọc vị trí GPS liên tục (giới hạn tần suất để tiết kiệm pin)
- `geofence`  : tính khoảng cách tới địa điểm, xác nhận "đã vào vùng" (debounce), cooldown sau khi rời vùng
- `narration` : chọn địa điểm cần phát, quản lý hàng đợi phát (mỗi lúc chỉ 1 audio)
- `audio`     : phát file audio có sẵn (từ mock `audioUrl`); nếu không có thì dùng giọng đọc của thiết bị

DỰ PHÒNG / HỖ TRỢ:
- `qr`        : quét mã QR để mở đúng địa điểm, dùng để demo trong lớp khi không thể đi bộ thật
- `api`       : đọc dữ liệu địa điểm (hiện từ mock API)

Tham khảo cách hoạt động từ file HTML hệ thống đã gửi; chưa xác nhận với thầy. Các con số (bán kính, debounce, cooldown) cần chỉnh theo khuôn viên thực tế.
