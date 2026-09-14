# 02 — Kiến trúc

## Nguyên tắc cốt lõi: `core` và `modules`

Đây là quyết định quan trọng nhất của source base. Mọi thứ khác đều xuất phát từ đây.

```mermaid
graph TD
    subgraph CORE["core/ — Hạ tầng dùng chung"]
        C1["Xử lý lỗi<br/>AppError, errorHandler"]
        C2["HTTP<br/>ApiResponse, asyncHandler"]
        C3["Middleware<br/>validate, authenticate, authorize"]
        C4["Lớp cơ sở<br/>BaseRepository, BaseService"]
        C5["Tiện ích<br/>jwt, password, crypto, query"]
    end

    subgraph MODULES["modules/ — Nghiệp vụ riêng từng dự án"]
        M1[auth]
        M2[user]
        M3["product<br/>(module mẫu)"]
        M4["...module mới"]
    end

    M1 --> CORE
    M2 --> CORE
    M3 --> CORE
    M4 --> CORE

    style CORE fill:#e0e7ff,stroke:#6366f1
    style MODULES fill:#dcfce7,stroke:#22c55e
```

**Quy tắc phụ thuộc — chỉ có một chiều duy nhất:**

| Được phép                                    | Bị cấm                                         |
| -------------------------------------------- | ---------------------------------------------- |
| `modules/*` → `core/*`                       | `core/*` → `modules/*`                         |
| `modules/product` → `core/db/BaseRepository` | `modules/product` → `modules/user` (trực tiếp) |

Vì sao cấm chiều ngược lại? Nếu `core` biết đến `product`, thì mang `core` sang dự án khác
sẽ kéo theo cả code sản phẩm không liên quan. Giữ chiều một hướng thì `core` luôn "sạch"
và sao chép sang dự án mới được ngay.

> Module cần dùng nhau thì gọi qua **service**, không gọi thẳng vào model của nhau.
> Ví dụ `auth.service.js` dùng `userService`, không đụng trực tiếp vào `User` model.

## Kiến trúc tổng thể

```mermaid
graph LR
    subgraph B["Trình duyệt"]
        R[React App]
    end

    subgraph S["Máy chủ"]
        E[Express API]
        M[(MongoDB)]
    end

    subgraph F["Dịch vụ ngoài"]
        G[Google OAuth]
        MAIL[Email]
        R2["Cloudflare R2<br/>(Phase 4)"]
        RD["Redis<br/>(Phase 3)"]
    end

    R -->|"JSON qua HTTPS<br/>+ cookie httpOnly"| E
    E --> M
    E -.-> G
    E -.-> MAIL
    E -.-> R2
    E -.-> RD

    style R fill:#dbeafe,stroke:#3b82f6
    style E fill:#dcfce7,stroke:#22c55e
    style M fill:#fef3c7,stroke:#f59e0b
    style R2 stroke-dasharray: 5 5
    style RD stroke-dasharray: 5 5
```

Đường nét đứt = tính năng của các phase sau (xem [09 — Lộ trình](./09-lo-trinh.md)).

## Backend: các tầng (layers)

Một request đi qua đúng các tầng sau, mỗi tầng **một trách nhiệm duy nhất**:

```mermaid
graph TD
    REQ["HTTP Request"] --> RT["Route<br/>khai báo đường dẫn + middleware"]
    RT --> VAL["validate()<br/>kiểm tra & ép kiểu bằng Zod"]
    VAL --> AUTHN["authenticate()<br/>Bạn là ai?"]
    AUTHN --> AUTHZ["authorize()<br/>Bạn được làm gì?"]
    AUTHZ --> CTRL["Controller<br/>đọc request → gọi service → trả response"]
    CTRL --> SVC["Service<br/>ràng buộc nghiệp vụ"]
    SVC --> REPO["Repository<br/>truy vấn dữ liệu"]
    REPO --> MODEL["Model<br/>schema Mongoose"]
    MODEL --> DB[(MongoDB)]

    CTRL -.lỗi.-> ERR["errorHandler<br/>dịch mọi lỗi về một định dạng"]
    SVC -.lỗi.-> ERR
    REPO -.lỗi.-> ERR
    ERR --> RES["HTTP Response"]

    style VAL fill:#fef3c7
    style AUTHN fill:#fee2e2
    style AUTHZ fill:#fee2e2
    style ERR fill:#fecaca
```

### Vì sao tách nhiều tầng như vậy?

| Tầng           | Trách nhiệm                                         | Biết gì về Express? |
| -------------- | --------------------------------------------------- | ------------------- |
| **Route**      | Khai báo `METHOD /đường-dẫn` + xâu chuỗi middleware | Có                  |
| **Controller** | Đọc `req`, gọi service, gọi `ApiResponse`           | Có                  |
| **Service**    | Ràng buộc nghiệp vụ, ném `AppError`                 | **Không**           |
| **Repository** | Truy vấn MongoDB                                    | **Không**           |
| **Model**      | Định nghĩa schema, hook, index                      | **Không**           |

Service không biết gì về `req`/`res` nên **test được trực tiếp** — không cần dựng HTTP server.
Đây là lý do `auth.service.js` có thể kiểm thử đầy đủ luồng Google OAuth mà không gọi Google thật.

## Frontend: các tầng

```mermaid
graph TD
    PAGE["Page<br/>bố cục, ghép các mảnh"] --> HOOK["Custom Hook<br/>useProducts, useAuthActions"]
    HOOK --> RQ["TanStack Query<br/>cache, retry, invalidate"]
    RQ --> API["Lớp API<br/>productsApi.list()"]
    API --> AX["Axios client<br/>interceptor: token, refresh, lỗi"]
    AX --> BE["Backend"]

    PAGE --> UI["Component UI<br/>Button, DataTable, Modal"]

    style HOOK fill:#e0e7ff,stroke:#6366f1
    style UI fill:#dcfce7,stroke:#22c55e
```

**Nguyên tắc: trang (page) không được gọi `axios` trực tiếp.**

Trang chỉ gọi custom hook. Hook gọi lớp API. Lớp API gọi axios client.
Nhờ chuỗi này, đổi thư viện HTTP hay đổi cách cache chỉ phải sửa một tầng.

## Định dạng response thống nhất

**Mọi** endpoint đều trả về cùng một hình dạng. Frontend nhờ đó chỉ cần một lớp xử lý duy nhất.

### Thành công

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [{ "id": "...", "title": "..." }],
  "meta": {
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasPrevPage": false,
      "hasNextPage": true
    }
  }
}
```

`meta` chỉ xuất hiện khi có phân trang.

### Thất bại

```json
{
  "success": false,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "errorCode": "VALIDATION_ERROR",
  "details": [{ "field": "body.email", "message": "Email không hợp lệ", "location": "body" }]
}
```

| Trường      | Mục đích                                                     |
| ----------- | ------------------------------------------------------------ |
| `message`   | Câu hiển thị cho người dùng cuối                             |
| `errorCode` | Mã ổn định để code xử lý theo nhánh (và để dịch đa ngôn ngữ) |
| `details`   | Chi tiết từng trường — frontend gắn thẳng vào form           |

Vì sao cần **cả** HTTP status lẫn `errorCode`? HTTP status nói _loại_ lỗi (401 = chưa xác thực),
`errorCode` nói _chính xác_ lỗi gì (`TOKEN_EXPIRED` khác `INVALID_CREDENTIALS` — token hết hạn thì
thử làm mới, sai mật khẩu thì báo người dùng).

## Bản đồ thư mục

```
backend/src/
├── index.js                 # Khởi động server, graceful shutdown
├── app.js                   # Tạo Express app (app factory)
├── config/
│   ├── env.js               # Validate biến môi trường bằng Zod — fail-fast
│   └── database.js          # Kết nối MongoDB
├── core/                    # ⭐ HẠ TẦNG DÙNG CHUNG
│   ├── constants/           # roles, permissions, httpStatus, auth
│   ├── errors/              # AppError + mã lỗi nghiệp vụ
│   ├── http/                # ApiResponse, asyncHandler
│   ├── middlewares/         # validate, authenticate, authorize, errorHandler...
│   ├── db/                  # BaseRepository + plugin Mongoose
│   ├── service/             # BaseService
│   ├── controller/          # createCrudController (sinh CRUD tự động)
│   ├── utils/               # jwt, password, crypto, queryFeatures, time, slug
│   └── validation/          # Schema Zod dùng chung
├── modules/                 # ⭐ NGHIỆP VỤ
│   ├── index.js             # Đăng ký module — nơi DUY NHẤT cần sửa khi thêm module
│   ├── auth/                # Xác thực: 3 phương thức đăng nhập
│   ├── user/                # Người dùng + phân quyền
│   └── product/             # MODULE MẪU — dùng làm khuôn
├── routes/index.js          # Router gốc + health check
├── shared/services/         # Dịch vụ dùng chung (mail...)
└── seeds/                   # Dữ liệu khởi tạo

frontend/src/
├── main.jsx                 # Điểm vào
├── App.jsx                  # Lắp các Provider
├── routes/index.jsx         # ⭐ TOÀN BỘ định tuyến (createBrowserRouter)
├── core/                    # ⭐ HẠ TẦNG DÙNG CHUNG
│   ├── config/              # env, constants
│   ├── api/                 # axios client + chuẩn hoá lỗi
│   ├── auth/                # AuthProvider, useAuth, tokenStorage
│   ├── components/ui/       # Button, DataTable, Modal, Pagination...
│   ├── hooks/               # createCrudHooks, useTableQuery, useDebounce...
│   ├── query/               # queryClient, queryKeys
│   ├── router/              # paths, guards
│   └── utils/               # format
├── features/                # ⭐ NGHIỆP VỤ
│   ├── auth/                # api, schemas, hook, pages, components
│   ├── products/            # MODULE MẪU
│   └── users/
├── layouts/                 # MainLayout, AdminLayout, AuthLayout
└── pages/                   # Trang tĩnh: Home, About, 404, 403, Error
```
