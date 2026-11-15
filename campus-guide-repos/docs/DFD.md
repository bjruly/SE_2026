# Sơ đồ luồng dữ liệu (DFD): Campus Guide

Campus Guide gồm Web PWA và app di động cho khách tham quan, Dashboard cho Quản trị/Biên tập, Backend API và PostgreSQL. Web/app tải địa điểm từ API (hoặc dùng `pois.json` dự phòng), xử lý vị trí và QR trên thiết bị, rồi phát thuyết minh bằng file audio nếu có `audioUrl`, ngược lại dùng TTS của thiết bị.

> Cách xem sơ đồ: mở file trong VS Code rồi nhấn Ctrl+Shift+V, hoặc xem trên GitHub để render các khối Mermaid.

## Quy ước vẽ

- Hình tròn/bầu dục là tiến trình, hình trụ là kho dữ liệu, hình chữ nhật là tác nhân ngoài.
- Mũi tên là hướng di chuyển của dữ liệu. Đọc từ kho thì mũi tên đi từ kho ra tiến trình, ghi vào kho thì đi từ tiến trình vào kho.
- Nét đứt là luồng có điều kiện (chỉ xảy ra khi API lỗi, mất mạng hoặc chưa cấu hình).
- Luồng dữ liệu không đi trực tiếp giữa hai tác nhân ngoài, và không đi trực tiếp giữa hai kho. Mọi luồng đều đi qua một tiến trình.
- Mỗi tác nhân ngoài đều có luồng vào và luồng ra. Tên tiến trình và kho giữ nguyên ở mọi mức.

## DFD mức 0: Sơ đồ ngữ cảnh

Toàn bộ Campus Guide được biểu diễn thành một tiến trình. GPS, camera và loa/TTS là năng lực trên thiết bị khách. Dịch vụ bản đồ và nơi lưu file audio (nếu được cấu hình) nằm ngoài hệ thống.

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Admin[Quản trị / Biên tập]
    Device[Thiết bị khách<br/>GPS, camera, loa/TTS]
    MapProvider[Dịch vụ bản đồ<br/>OpenFreeMap / OpenStreetMap]
    AudioHost[Máy chủ lưu file audio<br/>nếu có audioUrl]
    System(("0. Campus Guide"))

    Visitor -->|Yêu cầu xem địa điểm, chọn ngôn ngữ,<br/>thao tác QR và điều khiển phát| System
    System -->|Thông tin địa điểm, trạng thái<br/>và kết quả thao tác| Visitor
    Device -->|Tọa độ GPS / nội dung QR| System
    System -->|Âm thanh hoặc văn bản TTS| Device
    Admin -->|Thông tin đăng nhập,<br/>yêu cầu quản lý, bộ lọc báo cáo| System
    System -->|Kết quả xác thực, dữ liệu quản lý,<br/>thống kê và số phiên online| Admin
    System -->|Yêu cầu ô bản đồ| MapProvider
    MapProvider -->|Ô bản đồ| System
    System -->|Yêu cầu tải audio theo audioUrl| AudioHost
    AudioHost -->|Luồng file audio| System

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef system fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#0f172a
    class Visitor,Admin,Device,MapProvider,AudioHost external
    class System system
```

## DFD mức 1: Phân rã các tiến trình chính

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Admin[Quản trị / Biên tập]
    Device[GPS / Camera / Loa-TTS<br/>trên thiết bị]
    MapProvider[Dịch vụ ô bản đồ]
    AudioHost[Máy chủ file audio<br/>HTTPS, nếu có]

    subgraph Clients["Ứng dụng khách"]
        VisitorApp(["1.0 Trải nghiệm Web / App"])
        Dashboard(["2.0 Dashboard"])
        FWeb[("F1 pois.json<br/>Web dự phòng")]
        FMobile[("F2 pois.json<br/>Mobile dự phòng")]
    end

    subgraph Backend["Backend API"]
        Public(["3.0 API công khai<br/>địa điểm, sự kiện, presence"])
        Auth(["4.0 Xác thực<br/>và phân quyền"])
        PoiAdmin(["5.0 Quản lý địa điểm<br/>và bản dịch"])
        UserAdmin(["6.0 Quản lý tài khoản"])
        Reports(["7.0 Thống kê<br/>và online"])
    end

    subgraph Database["PostgreSQL"]
        POIs[("D1 pois")]
        Translations[("D2 poi_translations,<br/>languages")]
        Admins[("D3 admins")]
        Events[("D4 events")]
        Sessions[("D5 online_sessions")]
    end

    Visitor -->|Xem, chọn ngôn ngữ,<br/>quét QR, điều khiển phát| VisitorApp
    VisitorApp -->|Bản đồ, danh sách,<br/>chi tiết, trạng thái| Visitor

    VisitorApp -->|Yêu cầu danh sách địa điểm| Public
    POIs -->|Địa điểm đang hoạt động| Public
    Translations -->|Tên, mô tả, audioUrl| Public
    Public -->|Danh sách địa điểm| VisitorApp
    FWeb -.->|Dữ liệu dự phòng khi API<br/>chưa cấu hình / lỗi / mất mạng| VisitorApp
    FMobile -.->|Dữ liệu dự phòng khi API<br/>chưa cấu hình / lỗi / mất mạng| VisitorApp

    Device -->|Vị trí GPS / dữ liệu QR| VisitorApp
    VisitorApp -->|Yêu cầu tải audio theo audioUrl| AudioHost
    AudioHost -->|File audio| VisitorApp
    VisitorApp -->|Âm thanh hoặc văn bản TTS| Device
    VisitorApp -->|Yêu cầu ô bản đồ| MapProvider
    MapProvider -->|Ô bản đồ| VisitorApp

    VisitorApp -->|Sự kiện listen / qr_scan| Public
    VisitorApp -->|Heartbeat: session_id, client| Public
    Public -->|Sự kiện mới| Events
    Public -->|Phiên mới / cập nhật heartbeat| Sessions

    Admin -->|Thông tin đăng nhập, thao tác<br/>quản trị, bộ lọc báo cáo| Dashboard
    Dashboard -->|Kết quả, dữ liệu quản lý,<br/>báo cáo, thông báo lỗi| Admin
    Dashboard -->|Thông tin đăng nhập| Auth
    Dashboard -->|Yêu cầu quản trị / báo cáo kèm JWT| Auth
    Admins -->|Tài khoản, vai trò, trạng thái| Auth
    Auth -->|JWT hoặc lỗi đăng nhập| Dashboard
    Auth -->|Yêu cầu địa điểm được phép| PoiAdmin
    Auth -->|Yêu cầu tài khoản được phép| UserAdmin
    Auth -->|Yêu cầu báo cáo được phép| Reports
    Auth -->|Từ chối nếu token / quyền không hợp lệ| Dashboard

    PoiAdmin -->|Địa điểm thêm / sửa / xóa| POIs
    PoiAdmin -->|Bản dịch, audioUrl thêm / sửa / xóa| Translations
    POIs -->|Dữ liệu địa điểm| PoiAdmin
    Translations -->|Dữ liệu bản dịch| PoiAdmin
    PoiAdmin -->|Dữ liệu / kết quả thao tác| Dashboard

    UserAdmin -->|Tài khoản thêm / cập nhật| Admins
    Admins -->|Dữ liệu tài khoản| UserAdmin
    UserAdmin -->|Danh sách / kết quả thao tác| Dashboard

    Events -->|Lượt nghe, lượt quét QR| Reports
    Sessions -->|Phiên hoạt động gần đây| Reports
    POIs -->|Tên địa điểm| Reports
    Translations -->|Tên theo ngôn ngữ| Reports
    Reports -->|Báo cáo theo ngày, địa điểm,<br/>ngôn ngữ, nguồn và số online| Dashboard

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#0f172a
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#0f172a
    classDef fallback fill:#f1f5f9,stroke:#64748b,stroke-dasharray:5 5,color:#0f172a
    class Visitor,Admin,Device,MapProvider,AudioHost external
    class VisitorApp,Dashboard,Public,Auth,PoiAdmin,UserAdmin,Reports process
    class POIs,Translations,Admins,Events,Sessions store
    class FWeb,FMobile fallback
```

## DFD mức 2: Phân rã tiến trình 1.0 (Trải nghiệm khách tham quan)

Vị trí, QR, geofence và chọn ngôn ngữ được xử lý ở Web/App. Tọa độ không gửi lên Backend, chỉ sự kiện nghe/quét QR và heartbeat được gửi để thống kê. Web đọc dữ liệu dự phòng từ F1, app di động đọc từ F2.

```mermaid
flowchart LR
    Visitor[Khách tham quan]
    Device[GPS / Camera / Loa-TTS]
    MapProvider[Dịch vụ bản đồ]
    AudioHost[Máy chủ file audio]

    subgraph Client["1.0 Web / App"]
        Load(["1.1 Tải danh sách<br/>địa điểm"])
        Display(["1.2 Hiển thị bản đồ,<br/>danh sách, chi tiết"])
        Resolve(["1.3 Xử lý GPS,<br/>geofence và QR"])
        Select(["1.4 Chọn địa điểm<br/>và ngôn ngữ"])
        Play(["1.5 Phát / tạm dừng / dừng<br/>thuyết minh"])
        Track(["1.6 Ghi nhận thao tác<br/>và heartbeat"])
        FWeb[("F1 pois.json Web")]
        FMobile[("F2 pois.json Mobile")]
    end

    API(["3.0 API công khai"])
    DBPois[("D1 pois")]
    DBTranslations[("D2 poi_translations,<br/>languages")]
    DBEvents[("D4 events")]
    DBSessions[("D5 online_sessions")]

    Visitor -->|Mở ứng dụng, xem bản đồ / danh sách| Display
    Display -->|Bản đồ, danh sách, chi tiết địa điểm| Visitor
    Visitor -->|Chọn địa điểm / ngôn ngữ| Select
    Visitor -->|Lệnh phát / tạm dừng / dừng| Play

    Load -->|GET /api/pois| API
    DBPois -->|Địa điểm đang hoạt động| API
    DBTranslations -->|Dữ liệu theo ngôn ngữ, audioUrl| API
    API -->|Danh sách địa điểm| Load
    FWeb -.->|Dữ liệu dự phòng khi API<br/>lỗi hoặc chưa cấu hình| Load
    FMobile -.->|Dữ liệu dự phòng khi API<br/>lỗi hoặc chưa cấu hình| Load
    Load -->|Danh sách địa điểm| Display
    Load -->|Tọa độ, bán kính, mã QR<br/>của các địa điểm| Resolve
    Display -->|Địa điểm được chọn trên bản đồ / danh sách| Select
    Select -->|Địa điểm và ngôn ngữ đang chọn| Display

    Device -->|Tọa độ GPS / nội dung QR| Resolve
    Resolve -->|Địa điểm xác định tại thiết bị| Select
    Select -->|Địa điểm + ngôn ngữ + audioUrl tùy chọn| Play
    Play -->|GET audioUrl khi có file| AudioHost
    AudioHost -->|File audio| Play
    Play -->|File audio hoặc văn bản TTS| Device

    Display -->|Yêu cầu ô bản đồ| MapProvider
    MapProvider -->|Ô bản đồ| Display

    Select -->|Sự kiện listen / qr_scan| Track
    Track -->|POST /api/events<br/>không gửi tọa độ GPS| API
    Track -->|POST /api/presence<br/>session_id, client| API
    API -->|Sự kiện mới| DBEvents
    API -->|Phiên mới / cập nhật heartbeat| DBSessions

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#0f172a
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#0f172a
    classDef fallback fill:#f1f5f9,stroke:#64748b,stroke-dasharray:5 5,color:#0f172a
    class Visitor,Device,MapProvider,AudioHost external
    class Load,Display,Resolve,Select,Play,Track,API process
    class DBPois,DBTranslations,DBEvents,DBSessions store
    class FWeb,FMobile fallback
```

## DFD mức 2: Phân rã tiến trình 2.0 (Dashboard quản trị)

```mermaid
flowchart LR
    Admin[Quản trị / Biên tập]

    subgraph Dashboard["2.0 Dashboard"]
        Login(["2.1 Đăng nhập"])
        PoiUI(["2.2 Quản lý địa điểm,<br/>bản dịch và audioUrl"])
        UserUI(["2.3 Quản lý tài khoản"])
        ReportUI(["2.4 Xem thống kê<br/>và phiên online"])
        Token[("D6 JWT trong<br/>localStorage")]
    end

    Auth(["4.0 Xác thực<br/>và phân quyền"])
    PoiAdmin(["5.0 Quản lý địa điểm<br/>và bản dịch"])
    UserAdmin(["6.0 Quản lý tài khoản"])
    Reports(["7.0 Thống kê<br/>và online"])

    DBAdmins[("D3 admins")]
    DBPois[("D1 pois")]
    DBTranslations[("D2 poi_translations,<br/>languages")]
    DBEvents[("D4 events")]
    DBSessions[("D5 online_sessions")]

    Admin -->|Email / mật khẩu| Login
    Login -->|Kết quả đăng nhập, thông báo lỗi| Admin
    Login -->|POST /api/auth/login| Auth
    DBAdmins -->|Thông tin xác thực, vai trò, trạng thái| Auth
    Auth -->|JWT, thông tin người dùng hoặc lỗi| Login
    Login -->|Lưu JWT khi đăng nhập thành công| Token

    Admin -->|Tạo / sửa / xóa địa điểm| PoiUI
    Admin -->|Quản lý tài khoản| UserUI
    Admin -->|Chọn khoảng ngày / xem báo cáo| ReportUI
    PoiUI -->|Danh sách địa điểm, kết quả thao tác| Admin
    UserUI -->|Danh sách tài khoản, kết quả thao tác| Admin
    ReportUI -->|Biểu đồ, bảng thống kê, số online| Admin

    Token -->|JWT trong Authorization header| PoiUI
    Token -->|JWT trong Authorization header| UserUI
    Token -->|JWT trong Authorization header| ReportUI

    PoiUI -->|Yêu cầu + JWT + dữ liệu địa điểm| Auth
    UserUI -->|Yêu cầu + JWT + dữ liệu tài khoản| Auth
    ReportUI -->|Yêu cầu + JWT + bộ lọc thời gian| Auth

    Auth -->|Cho phép theo quyền poi:*| PoiAdmin
    PoiAdmin -->|Địa điểm thêm / sửa / xóa| DBPois
    PoiAdmin -->|Tên, mô tả, audioUrl thêm / sửa / xóa| DBTranslations
    DBPois -->|Dữ liệu địa điểm| PoiAdmin
    DBTranslations -->|Dữ liệu bản dịch| PoiAdmin
    PoiAdmin -->|Dữ liệu / kết quả thao tác| PoiUI

    Auth -->|Cho phép user:manage, chỉ Quản trị| UserAdmin
    UserAdmin -->|Tài khoản thêm / cập nhật| DBAdmins
    DBAdmins -->|Dữ liệu tài khoản| UserAdmin
    UserAdmin -->|Danh sách / kết quả thao tác| UserUI

    Auth -->|Cho phép stats:read| Reports
    DBEvents -->|Lượt nghe, lượt quét QR| Reports
    DBSessions -->|Phiên hoạt động gần đây| Reports
    DBPois -->|Tên địa điểm| Reports
    DBTranslations -->|Ngôn ngữ, bản dịch| Reports
    Reports -->|Tổng hợp lượt nghe, QR,<br/>theo ngày / POI / ngôn ngữ / nguồn| ReportUI

    Auth -->|Từ chối khi JWT không hợp lệ<br/>hoặc không đủ quyền| PoiUI
    Auth -->|Từ chối khi JWT không hợp lệ<br/>hoặc không đủ quyền| UserUI
    Auth -->|Từ chối khi JWT không hợp lệ<br/>hoặc không đủ quyền| ReportUI

    classDef external fill:#fff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#0f172a
    classDef store fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#0f172a
    class Admin external
    class Login,PoiUI,UserUI,ReportUI,Auth,PoiAdmin,UserAdmin,Reports process
    class Token,DBAdmins,DBPois,DBTranslations,DBEvents,DBSessions store
```

## Danh mục tiến trình và kho dữ liệu

| Mã | Tên | Nội dung |
|---|---|---|
| 1.0 | Trải nghiệm Web / App | Tải địa điểm, hiển thị bản đồ, GPS/geofence, QR, phát audio/TTS, gửi sự kiện và heartbeat. |
| 2.0 | Dashboard | Đăng nhập, quản lý địa điểm/tài khoản và xem thống kê. |
| 3.0 | API công khai | `GET /api/pois`, `POST /api/events`, `POST /api/presence`. |
| 4.0 | Xác thực và phân quyền | Đăng nhập, xác thực JWT, kiểm tra trạng thái tài khoản và quyền. |
| 5.0 | Quản lý địa điểm và bản dịch | Đọc/thêm/sửa/xóa địa điểm và bản dịch; `audioUrl` là tùy chọn. |
| 6.0 | Quản lý tài khoản | Quản trị tạo/cập nhật tài khoản; mật khẩu được băm trước khi lưu. |
| 7.0 | Thống kê và online | Tổng hợp sự kiện theo thời gian/địa điểm/ngôn ngữ/nguồn và đếm phiên hoạt động gần đây. |
| F1 / F2 | `pois.json` Web / Mobile | Dữ liệu cục bộ dự phòng khi API chưa cấu hình hoặc không truy cập được. Web đọc F1, app di động đọc F2. |
| D1 | `pois` | ID, QR, tọa độ, bán kính, trạng thái hoạt động. |
| D2 | `poi_translations`, `languages` | Tên, mô tả, `audio_url` và mã ngôn ngữ. |
| D3 | `admins` | Email, mật khẩu đã băm, vai trò, trạng thái tài khoản. |
| D4 | `events` | `listen` / `qr_scan`, ngôn ngữ, nguồn, client, thời điểm; không lưu tọa độ hoặc danh tính khách. |
| D5 | `online_sessions` | Session ID ngẫu nhiên, client, thời điểm heartbeat gần nhất. |
| D6 | `localStorage` Dashboard | JWT được lưu phía trình duyệt sau khi đăng nhập. Kho này chỉ xuất hiện ở DFD mức 2 của tiến trình 2.0. |

## Quy tắc và ranh giới dữ liệu

- GPS, geofence và nội dung QR được xử lý ở thiết bị. Backend không nhận tọa độ GPS.
- Web/App chỉ gửi sự kiện `listen` / `qr_scan` và heartbeat ẩn danh để thống kê.
- File audio được tải trực tiếp từ URL trong `audio_url`; backend lưu URL nhưng không làm proxy lưu trữ/phát audio. Không có URL hoặc phát lỗi thì client dùng TTS của thiết bị nếu được hỗ trợ.
- Dữ liệu cục bộ F1/F2 chỉ là nguồn đọc dự phòng. Khi API lỗi, các thao tác ghi thống kê không được lưu lên máy chủ.
- Dịch vụ bản đồ và máy chủ audio là hệ thống ngoài; Web/App gọi trực tiếp các dịch vụ này.
- Dashboard gọi API quản trị bằng JWT. API là nơi kiểm tra quyền cuối cùng. Quản trị có toàn quyền, Biên tập không có quyền quản lý tài khoản hoặc xóa địa điểm.
