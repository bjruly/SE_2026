# Sơ đồ luồng dữ liệu (DFD) — Campus Guide

Campus Guide là hệ thống hướng dẫn tham quan khuôn viên ĐH Sài Gòn. Web PWA và app di động cung cấp thông tin địa điểm, bản đồ, quét QR và thuyết minh theo vị trí; dashboard cho phép Quản trị/Biên tập quản lý dữ liệu và xem thống kê.

> **Cách xem sơ đồ:** mở file này trên GitHub hoặc trong VS Code, nhấn **Ctrl+Shift+V** để mở Markdown Preview. Các khối Mermaid bên dưới sẽ được hiển thị thành hình.

## DFD mức 0 — Sơ đồ ngữ cảnh

Toàn bộ ứng dụng Web, App, Dashboard, backend API và cơ sở dữ liệu được xem là một hệ thống duy nhất. Thiết bị (GPS, camera, loa/TTS) thuộc phía khách tham quan; dịch vụ bản đồ là hệ thống ngoài.

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Admin[Quản trị / Biên tập]
    MapProvider[Dịch vụ bản đồ<br/>OpenFreeMap / OpenStreetMap]
    System(("0. Campus Guide"))

    Visitor -->|Ngôn ngữ, yêu cầu xem địa điểm,<br/>tương tác GPS / QR / phát thuyết minh| System
    System -->|Thông tin địa điểm, bản đồ,<br/>văn bản thuyết minh| Visitor
    Admin -->|Thông tin đăng nhập,<br/>yêu cầu quản lý và xem báo cáo| System
    System -->|Kết quả xác thực, dữ liệu quản lý,<br/>thống kê| Admin
    System -->|Yêu cầu ô bản đồ| MapProvider
    MapProvider -->|Dữ liệu ô bản đồ| System

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef system fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#0f172a
    class Visitor,Admin,MapProvider external
    class System system
```

## DFD mức 1 — Các tiến trình và kho dữ liệu

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Admin[Quản trị / Biên tập]
    Sensors[GPS / Camera / TTS<br/>trên thiết bị]
    MapProvider[Dịch vụ ô bản đồ]

    subgraph Clients["Ứng dụng phía người dùng"]
        Client(["1.0 Trải nghiệm Web / App"])
        Dashboard(["2.0 Dashboard"])
        FallbackWeb[("F1 pois.json<br/>Web")]
        FallbackMobile[("F2 pois.json<br/>App")]
    end

    subgraph API["Backend API"]
        Public(["3.0 API địa điểm"])
        Auth(["4.0 Xác thực và phân quyền"])
        Manage(["5.0 Quản lý địa điểm"])
        Users(["6.0 Quản lý tài khoản"])
        Collect(["7.0 Ghi sự kiện / heartbeat"])
        Report(["8.0 Tổng hợp thống kê"])
    end

    subgraph Database["PostgreSQL"]
        POIs[("D1 Địa điểm<br/>pois")]
        Translations[("D2 Bản dịch và ngôn ngữ<br/>poi_translations, languages")]
        Admins[("D3 Tài khoản<br/>admins")]
        Events[("D4 Sự kiện ẩn danh<br/>events")]
        Sessions[("D5 Phiên online ẩn danh<br/>online_sessions")]
    end

    Visitor -->|Yêu cầu, lựa chọn ngôn ngữ,<br/>tương tác| Client
    Client -->|Thông tin địa điểm cần tải| Public
    Public -->|Đọc địa điểm đang hoạt động| POIs
    Public -->|Đọc tên / mô tả theo ngôn ngữ| Translations
    POIs -->|Địa điểm| Public
    Translations -->|Bản dịch| Public
    Public -->|Danh sách địa điểm| Client
    Client -.->|API chưa cấu hình hoặc không truy cập được| FallbackWeb
    Client -.->|API chưa cấu hình hoặc không truy cập được| FallbackMobile
    FallbackWeb -->|Dữ liệu cục bộ dự phòng| Client
    FallbackMobile -->|Dữ liệu cục bộ dự phòng| Client

    Sensors -->|Vị trí GPS / nội dung QR| Client
    Client -->|Yêu cầu ô bản đồ| MapProvider
    MapProvider -->|Ô bản đồ| Client
    Client -->|Văn bản thuyết minh theo ngôn ngữ| Sensors

    Admin -->|Thông tin đăng nhập / thao tác dashboard| Dashboard
    Dashboard -->|Đăng nhập| Auth
    Auth -->|Tra cứu tài khoản, vai trò, trạng thái| Admins
    Admins -->|Thông tin tài khoản| Auth
    Auth -->|Token hoặc lỗi xác thực| Dashboard
    Dashboard -->|Yêu cầu có token| Auth
    Auth -->|Yêu cầu hợp lệ + vai trò| Manage
    Auth -->|Yêu cầu hợp lệ + vai trò| Users
    Auth -->|Yêu cầu hợp lệ + vai trò| Report
    Manage -->|Đọc / ghi địa điểm| POIs
    Manage -->|Đọc / ghi bản dịch| Translations
    Users -->|Đọc / ghi tài khoản| Admins
    POIs -->|Kết quả địa điểm| Manage
    Translations -->|Kết quả bản dịch| Manage
    Admins -->|Kết quả tài khoản| Users
    Manage -->|Kết quả thao tác| Dashboard
    Users -->|Kết quả thao tác| Dashboard

    Client -->|Lượt nghe / quét QR| Collect
    Client -->|Heartbeat: session_id, client| Collect
    Collect -->|Lưu sự kiện, không lưu tọa độ| Events
    Collect -->|Cập nhật thời điểm hoạt động| Sessions
    Dashboard -->|Yêu cầu thống kê / online| Auth
    Report -->|Đọc sự kiện| Events
    Report -->|Đếm phiên hoạt động gần đây| Sessions
    Report -->|Đọc tên địa điểm để lập báo cáo| POIs
    Report -->|Đọc ngôn ngữ để lập báo cáo| Translations
    Report -->|Báo cáo theo ngày, địa điểm,<br/>ngôn ngữ, nguồn / số online| Dashboard

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#0f172a
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#0f172a
    classDef fallback fill:#f1f5f9,stroke:#64748b,stroke-dasharray:5 5,color:#0f172a
    class Visitor,Admin,Sensors,MapProvider external
    class Client,Dashboard,Public,Auth,Manage,Users,Collect,Report process
    class POIs,Translations,Admins,Events,Sessions store
    class FallbackWeb,FallbackMobile fallback
```

## DFD mức 2 — Trải nghiệm khách tham quan

GPS, QR, chọn ngôn ngữ, geofence và phát văn bản bằng TTS được xử lý trong Web/App. Backend chỉ nhận yêu cầu danh sách địa điểm, sự kiện thống kê và heartbeat; tọa độ GPS không được gửi lên API.

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Sensors[GPS / Camera / TTS]
    MapProvider[Dịch vụ bản đồ]

    subgraph App["Web PWA / App di động"]
        Browse(["1.1 Hiển thị bản đồ,<br/>danh sách và chi tiết"])
        Choose(["1.2 Chọn ngôn ngữ,<br/>địa điểm"])
        Locate(["1.3 Xử lý GPS,<br/>geofence và QR"])
        Narrate(["1.4 Phát / tạm dừng<br/>thuyết minh bằng TTS"])
        Log(["1.5 Gửi sự kiện<br/>và heartbeat"])
        LocalPois[("Dữ liệu địa điểm cục bộ<br/>pois.json")]
    end

    subgraph API["Backend API"]
        GetPois(["1.6 Trả danh sách địa điểm"])
        SaveActivity(["1.7 Ghi thống kê<br/>và heartbeat"])
    end

    Data[("PostgreSQL<br/>pois, poi_translations,<br/>languages, events, online_sessions")]

    Visitor -->|Mở ứng dụng, chọn ngôn ngữ,<br/>thao tác xem / phát| Browse
    Browse -->|Yêu cầu danh sách| GetPois
    GetPois -->|Đọc địa điểm và bản dịch| Data
    Data -->|Danh sách địa điểm| GetPois
    GetPois -->|Danh sách địa điểm| Browse
    Browse -.->|API không cấu hình / mất kết nối| LocalPois
    LocalPois -->|Danh sách dự phòng| Browse
    Browse -->|Thông tin địa điểm| Choose
    Sensors -->|Tọa độ GPS / nội dung mã QR| Locate
    Locate -->|POI được xác định| Choose
    Choose -->|Tên, mô tả theo ngôn ngữ| Narrate
    Narrate -->|Văn bản cần đọc| Sensors
    Browse -->|Yêu cầu bản đồ| MapProvider
    MapProvider -->|Ô bản đồ| Browse
    Choose -->|Sự kiện listen / qr_scan| Log
    Log -->|Dữ liệu sự kiện ẩn danh| SaveActivity
    Log -->|session_id / loại client| SaveActivity
    SaveActivity -->|Ghi sự kiện / heartbeat| Data
```

## DFD mức 2 — Dashboard quản trị

```mermaid
flowchart LR
    Admin[Quản trị / Biên tập]

    subgraph Dashboard["Dashboard"]
        Login(["2.1 Đăng nhập"])
        Work(["2.2 Quản lý địa điểm,<br/>tài khoản và xem thống kê"])
        Token[("Token đăng nhập<br/>lưu trong trình duyệt")]
    end

    subgraph API["Backend API"]
        Authenticate(["2.3 Xác thực tài khoản<br/>và token"])
        Authorize(["2.4 Kiểm tra vai trò<br/>và quyền"])
        PoiAdmin(["2.5 Thêm / sửa / xóa<br/>địa điểm"])
        UserAdmin(["2.6 Quản lý tài khoản<br/>(chỉ Quản trị)"])
        Stats(["2.7 Tính thống kê<br/>và số phiên online"])
    end

    Accounts[("admins")]
    Places[("pois, poi_translations,<br/>languages")]
    Metrics[("events,<br/>online_sessions")]

    Admin -->|Email, mật khẩu| Login
    Login -->|Thông tin đăng nhập| Authenticate
    Authenticate -->|Tra cứu tài khoản / trạng thái| Accounts
    Accounts -->|Thông tin tài khoản| Authenticate
    Authenticate -->|Token hoặc lỗi đăng nhập| Login
    Login -->|Lưu token| Token
    Token -->|Token cho API yêu cầu| Work
    Admin -->|Thao tác quản trị| Work
    Work -->|Yêu cầu + token| Authenticate
    Authenticate -->|Danh tính, vai trò, yêu cầu| Authorize
    Authorize -->|Yêu cầu được phép| PoiAdmin
    Authorize -->|Yêu cầu được phép| UserAdmin
    Authorize -->|Yêu cầu được phép| Stats
    Authorize -->|Từ chối nếu thiếu quyền| Work
    PoiAdmin -->|Đọc / ghi| Places
    Places -->|Dữ liệu địa điểm| PoiAdmin
    UserAdmin -->|Đọc / ghi tài khoản| Accounts
    Accounts -->|Dữ liệu tài khoản| UserAdmin
    Stats -->|Đọc sự kiện / phiên online| Metrics
    Metrics -->|Số liệu| Stats
    Stats -->|Báo cáo| Work
    PoiAdmin -->|Kết quả thao tác| Work
    UserAdmin -->|Kết quả thao tác| Work

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#0f172a
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#0f172a
    class Admin external
    class Login,Work,Authenticate,Authorize,PoiAdmin,UserAdmin,Stats process
    class Token,Accounts,Places,Metrics store
```

## Mô tả kho dữ liệu và quy tắc

| Mã | Kho dữ liệu | Nội dung |
|---|---|---|
| F1 / F2 | `pois.json` trong Web / App | Dữ liệu địa điểm dự phòng khi API chưa cấu hình hoặc không truy cập được; không ghi được thống kê trong chế độ dự phòng. |
| D1 | `pois` | Mã địa điểm, mã QR, tọa độ, bán kính, trạng thái hoạt động. |
| D2 | `poi_translations`, `languages` | Tên, mô tả và tùy chọn `audio_url` theo tiếng Việt, Anh, Trung. Web ưu tiên phát file audio nếu có `audio_url`, tự động chuyển sang TTS nếu không có hoặc phát lỗi. |
| D3 | `admins` | Email, mật khẩu đã băm, vai trò (`admin` / `editor`) và trạng thái tài khoản. |
| D4 | `events` | Sự kiện `listen` / `qr_scan`, ngôn ngữ, nguồn, loại client và thời điểm; không lưu tọa độ GPS hay danh tính khách. |
| D5 | `online_sessions` | Mã phiên ngẫu nhiên, loại client và thời điểm heartbeat; dùng ước tính số phiên online gần đây. |

- Quản trị có thể quản lý tài khoản và xóa địa điểm; Biên tập có thể thêm/sửa địa điểm và xem thống kê. API là nơi kiểm tra quyền cuối cùng.
- Quét QR và vào vùng địa điểm không tự gửi vị trí lên server; ứng dụng xử lý QR/GPS tại máy rồi chỉ gửi sự kiện cần thống kê.
- Dashboard gọi API quản trị bằng token; token được lưu ở trình duyệt. Mật khẩu tài khoản được băm trước khi ghi database.
- Web/App gọi trực tiếp dịch vụ bản đồ để tải ô bản đồ. API/backend không làm proxy cho dữ liệu bản đồ.
- Đường nét đứt trong sơ đồ chỉ luồng dự phòng đọc `pois.json`; dữ liệu cục bộ không thay thế dữ liệu ghi nhận trên server.
