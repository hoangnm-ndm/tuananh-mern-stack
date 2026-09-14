# CHECK_LIST — Theo dõi tiến độ

> Cập nhật file này mỗi khi hoàn thành một hạng mục.
> Một mục chỉ được tick ✅ khi **đã có test bảo vệ** hoặc đã kiểm chứng thủ công và ghi rõ.

**Cập nhật lần cuối:** 2026-09-14
**Tình trạng:** Phase 1 hoàn thành — 322 test pass, lint sạch, build thành công.

---

## Tổng quan

| Phase | Nội dung                            | Trạng thái        |
| ----- | ----------------------------------- | ----------------- |
| 1     | Nền tảng: Auth + RBAC + CRUD + Test | ✅ **Hoàn thành** |
| 2     | Email thật (SMTP / Resend)          | ⬜ Chưa bắt đầu   |
| 3     | Cache & Redis                       | ⬜ Chưa bắt đầu   |
| 4     | Quản lý file với Cloudflare R2      | ⬜ Chưa bắt đầu   |
| 5     | Cron jobs                           | ⬜ Chưa bắt đầu   |
| 6     | Quan sát & vận hành                 | ⬜ Chưa bắt đầu   |

Ký hiệu: ✅ xong · 🚧 đang làm · ⬜ chưa bắt đầu · ⏸️ tạm hoãn

---

## Phase 1 — Nền tảng ✅

### 1.1 Cấu trúc dự án

- [x] Đổi tên `learn-react` → `frontend`, `learn-nodejs` → `backend`
- [x] Tạo thư mục `docs/`
- [x] Thiết lập npm workspaces ở gốc
- [x] Script dùng chung ở gốc (`dev`, `build`, `test`, `lint`, `format`, `check`…)
- [x] Prettier (`.prettierrc`, `.prettierignore`)
- [x] ESLint flat config dùng chung, chia vùng backend/frontend/test/script
- [x] `.editorconfig`, `.nvmrc`
- [x] `.gitignore` đầy đủ (chặn `.env`, `node_modules`, `dist`, `uploads`…)
- [x] `CLAUDE.md` tối ưu cho AI coding agent
- [x] `CHECK_LIST.md` (file này)
- [x] Script `check-env.js` / `sync-env.js` / `kill-ports.js`
- [x] **Gỡ `backend/.env` khỏi git index** (trước đó bị commit kèm mật khẩu MongoDB Atlas thật)

> ⚠️ **Việc còn lại cho chủ dự án:** đổi mật khẩu MongoDB Atlas của user `hr_db_user`.
> Mật khẩu cũ đã nằm trong lịch sử git (commit `5ea2a16`) nên phải coi là đã lộ.

### 1.2 Biến môi trường

- [x] `backend/.env.example` — 44 biến, có chú thích ý nghĩa + cách lấy + mức độ quan trọng
- [x] `frontend/.env.example` — 7 biến, kèm cảnh báo `VITE_*` là công khai
- [x] Validate bằng Zod, fail-fast khi khởi động
- [x] Ràng buộc có điều kiện (bật Google OAuth thì bắt buộc có CLIENT_ID…)
- [x] Chuỗi rỗng quy về `undefined` để biến tuỳ chọn không báo lỗi oan
- [x] Đồng bộ `.env` ↔ `.env.example` (`npm run env:check`)

### 1.3 Backend — Core

- [x] `constants/` — `httpStatus`, `roles` (RBAC), `auth`
- [x] `errors/` — `AppError` + factory + `ERROR_CODES`
- [x] `http/` — `ApiResponse` (ok/created/paginated/noContent), `asyncHandler`
- [x] `middlewares/validate.js` — Zod cho body/params/query/headers/cookies
- [x] `middlewares/authenticate.js` — xác thực + biến thể tuỳ chọn
- [x] `middlewares/authorize.js` — 4 cách: role / minRole / permission / ownership
- [x] `middlewares/errorHandler.js` — dịch Zod, Mongoose, JWT, body-parser về một định dạng
- [x] `middlewares/rateLimit.js` — giới hạn toàn cục + riêng cho auth (chuẩn hoá IPv6)
- [x] `middlewares/requestContext.js` — requestId + log thời gian xử lý
- [x] `middlewares/notFound.js`
- [x] `db/BaseRepository.js` — CRUD + `paginate()` chạy song song
- [x] `db/plugins/toJSON.js` — `_id` → `id`, xoá `__v`, ẩn field `private`
- [x] `service/BaseService.js`
- [x] `controller/createCrudController.js`
- [x] `utils/` — `logger`, `jwt`, `password`, `crypto`, `cookie`, `time`, `slug`, `pick`, `queryFeatures`
- [x] `validation/common.js` — `objectId`, `email`, `password`, `pagination`
- [x] Tắt máy an toàn (graceful shutdown) + bắt lỗi cấp tiến trình

### 1.4 Backend — Xác thực

- [x] Model `User` (nhiều provider, mật khẩu `select:false` + `private:true`)
- [x] Model `Token` (lưu hash, TTL index tự xoá)
- [x] **Phương thức 1:** Email + mật khẩu (đăng ký / đăng nhập)
- [x] **Phương thức 2:** Google OAuth 2.0 (authorization code + `state` chống CSRF)
- [x] **Phương thức 3:** Magic link (hash, dùng một lần, hết hạn 15 phút)
- [x] Access token 15 phút + refresh token 7 ngày (cookie httpOnly)
- [x] Token rotation + phát hiện tái sử dụng
- [x] `jti` ngẫu nhiên cho mỗi token
- [x] Đăng xuất / đăng xuất mọi thiết bị
- [x] Liên kết tài khoản (cùng email → thêm provider, không tạo trùng)
- [x] Chống dò tài khoản (thông báo lỗi trung tính)
- [x] Rate limit riêng cho endpoint đăng nhập

### 1.5 Backend — Phân quyền RBAC

- [x] 3 vai trò: `member` (1) < `admin` (2) < `superAdmin` (3)
- [x] 10 quyền chi tiết dạng `<resource>:<action>`
- [x] Ma trận `ROLE_PERMISSIONS` — nguồn sự thật duy nhất
- [x] Quyền vai trò thấp là tập con của vai trò cao (có test)
- [x] Quy tắc an toàn khi đổi vai trò (không tự đổi, không cấp cao hơn mình)
- [x] `GET /auth/me` trả kèm danh sách quyền

### 1.6 Backend — Modules

- [x] `auth/` — 3 phương thức đăng nhập + vòng đời phiên
- [x] `user/` — CRUD + đổi vai trò + khoá/mở + hồ sơ cá nhân + đổi mật khẩu
- [x] `product/` — **module mẫu** minh hoạ đầy đủ khuôn mẫu
- [x] Đăng ký module tập trung (`modules/index.js`)
- [x] Health check `/health` (kèm trạng thái DB)
- [x] Endpoint liệt kê module `/`
- [x] Seed dữ liệu (idempotent — chạy nhiều lần an toàn)
- [x] `shared/services/mail.service.js` theo mẫu driver (sẵn sàng Phase 2)

### 1.7 Frontend — Core

- [x] `config/env.js` — đọc biến Vite tập trung
- [x] `config/constants.js` — `ROLES`, `PERMISSIONS`, `ERROR_CODES` khớp backend
- [x] `api/client.js` — axios + interceptor tự làm mới token (gộp request đồng thời)
- [x] `api/apiError.js` — chuẩn hoá lỗi + `toFormErrors()`
- [x] `auth/tokenStorage.js` — giữ token trong bộ nhớ (không dùng `localStorage`)
- [x] `auth/AuthProvider.jsx` — khôi phục phiên khi tải lại trang
- [x] `auth/useAuth.js` — `hasPermission` / `hasRole` / `hasMinRole`
- [x] `query/queryClient.js` + `queryKeys.js`
- [x] `router/paths.js` + `buildPath()`
- [x] `router/guards.jsx` — `RequireAuth` / `RequireGuest` / `RequirePermission`
- [x] `hooks/createCrudHooks.js` — **sinh 5 hook CRUD từ một lớp API**
- [x] `hooks/useTableQuery.js` — trạng thái bảng đồng bộ lên URL
- [x] `hooks/useDebounce` / `useDisclosure` / `useLocalStorage`
- [x] `hooks/ToastProvider.jsx` + `useToast.js`
- [x] `components/ui/` — `Button`, `FormField`, `TextAreaField`, `DataTable`, `Pagination`, `Modal`, `Alert`, `Spinner`
- [x] `utils/format.js` — tiền tệ, ngày giờ, thời gian tương đối (chuẩn Việt Nam)

### 1.8 Frontend — Features & Routing

- [x] `routes/index.jsx` — **`createBrowserRouter`, file định tuyến riêng**
- [x] Tải lười (lazy) cho trang nặng — build tách chunk thành công
- [x] 3 layout: `MainLayout`, `AdminLayout`, `AuthLayout`
- [x] `features/auth/` — schemas, `useAuthActions`, 5 trang, 2 component
- [x] `features/products/` — api, schemas, `useProducts`, form, 3 trang
- [x] `features/users/` — api, `useUsers`, trang quản lý (đổi vai trò, khoá tài khoản)
- [x] Trang tĩnh: Home, About, Contact, Dashboard, 403, 404, ErrorPage
- [x] Tailwind CSS 4 qua plugin Vite
- [x] Bí danh `@/` cho đường dẫn import
- [x] Vite proxy `/api` → backend (cookie httpOnly hoạt động khi dev)

### 1.9 Kiểm thử

- [x] Backend unit: 133 test
- [x] Backend integration: 91 test (Supertest + `mongodb-memory-server`)
- [x] Frontend: 98 test (Testing Library + jsdom)
- [x] **Tổng: 322 test — tất cả pass**
- [x] Công cụ dùng chung: `tests/helpers/`, `src/test/utils.jsx`
- [x] Cấu hình coverage (`npm run test:cov`)

### 1.10 Tài liệu

- [x] `docs/README.md` — mục lục + lộ trình đọc theo vai trò
- [x] `docs/01-tong-quan.md` — cài đặt, lệnh, luồng chạy
- [x] `docs/02-kien-truc.md` — sơ đồ tổng thể, `core` vs `modules`
- [x] `docs/03-backend.md` — các tầng, **hướng dẫn thêm module 6 bước kèm code**
- [x] `docs/04-frontend.md` — custom hook, routing, xử lý token
- [x] `docs/05-xac-thuc-phan-quyen.md` — 3 luồng đăng nhập, RBAC, ma trận quyền
- [x] `docs/06-bien-moi-truong.md` — từng biến: ý nghĩa, cách lấy, mức độ quan trọng
- [x] `docs/07-kiem-thu.md` — chiến lược, cách viết test mới
- [x] `docs/08-quy-uoc-code.md` — đặt tên, import, comment, bảo mật
- [x] `docs/09-lo-trinh.md` — chi tiết Phase 2–6
- [x] Sơ đồ Mermaid ở mọi tài liệu (25+ sơ đồ)
- [x] Tiếng Việt có dấu, giữ nguyên thuật ngữ tiếng Anh kèm chú thích

### 1.11 Lỗi đã phát hiện và sửa trong quá trình xây dựng

- [x] `asyncHandler` không bắt được lỗi ném **đồng bộ** → thêm `try/catch` bọc ngoài
- [x] `validate()` báo lỗi oan khi request không có body (Express 5 để `req.body` là `undefined`)
- [x] Hai refresh token cấp trong cùng một giây trùng nhau → thêm `jti` ngẫu nhiên
- [x] Magic link trả về `isEmailVerified: false` sai (dùng bản ghi cũ) → dùng bản đã cập nhật
- [x] `.env` có biến tuỳ chọn để trống làm `z.url()` báo lỗi → quy chuỗi rỗng về `undefined`
- [x] `updateProductSchema` không chặn được body rỗng (`.partial()` vẫn sinh key do `.default()`)
- [x] `useTableQuery` gọi side-effect trong lúc render → chuyển vào `useEffect`
- [x] Hai trang callback `setState` đồng bộ trong effect → suy ra trạng thái lúc render
- [x] `keyGenerator` của rate limit không chuẩn hoá IPv6 → dùng `ipKeyGenerator()`
- [x] `useToast.jsx` export lẫn component và hook → tách thành `ToastProvider.jsx` + `useToast.js`

---

## Phase 2 — Email thật ⬜

- [ ] Cài `nodemailer`, hiện thực `smtpDriver`
- [ ] Hiện thực `resendDriver`
- [ ] Tách template mail ra file riêng
- [ ] Hàng đợi gửi mail + retry khi thất bại
- [ ] Luồng xác minh email khi đăng ký
- [ ] Luồng quên mật khẩu / đặt lại mật khẩu
- [ ] Test: giả lập driver, kiểm nội dung và retry

Chỗ cắm đã sẵn: `backend/src/shared/services/mail.service.js`

---

## Phase 3 — Cache & Redis ⬜

- [ ] `core/cache/CacheService.js` (driver `memory` + `redis`)
- [ ] `core/middlewares/cache.js` — cache response theo đường dẫn + query
- [ ] Tự xoá cache khi có thao tác ghi
- [ ] Chuyển store rate limit sang Redis (bắt buộc khi chạy nhiều instance)
- [ ] Cache truy vấn nặng (đếm tổng, tổng hợp)
- [ ] Test: hit/miss, TTL, xoá cache sau khi ghi

Biến môi trường đã khai báo: `CACHE_DRIVER`, `REDIS_URL`, `CACHE_TTL_SECONDS`

---

## Phase 4 — Quản lý file với Cloudflare R2 ⬜

- [ ] `core/storage/StorageService.js` (driver `local` + `r2`)
- [ ] Module `file`: model (`key`, `checksum`, `refCount`, `status`), service, route
- [ ] **Tạo mới:** presigned URL — client tải thẳng lên R2, không qua server
- [ ] **Dùng lại:** cùng `checksum` → trả file cũ thay vì tải lên bản sao
- [ ] **Xoá file mồ côi:** đếm tham chiếu + cron dọn dẹp
- [ ] `linkFile()` / `unlinkFile()` khi bản ghi thay đổi
- [ ] Kiểm tra kiểu MIME thật (đọc magic bytes)
- [ ] Giới hạn dung lượng theo `MAX_UPLOAD_SIZE_MB`
- [ ] Frontend: component tải file + xem trước
- [ ] Test: tải lên, dùng lại, nhận diện mồ côi, dọn dẹp

Biến môi trường đã khai báo: `STORAGE_DRIVER`, `R2_*`, `MAX_UPLOAD_SIZE_MB`

---

## Phase 5 — Cron jobs ⬜

- [ ] `core/cron/CronService.js`
- [ ] Khoá phân tán (Redis) — nhiều instance không chạy trùng job
- [ ] Job `cleanup-orphan-files` (phối hợp Phase 4)
- [ ] Job `cleanup-expired-tokens`
- [ ] Job `send-digest-email` (phối hợp Phase 2)
- [ ] Ghi lịch sử chạy job vào DB
- [ ] Trang quản trị: xem lịch sử, chạy thủ công
- [ ] Cảnh báo khi job thất bại
- [ ] Test: gọi handler trực tiếp

Biến môi trường đã khai báo: `CRON_ENABLED`, `CRON_TIMEZONE`

---

## Phase 6 — Quan sát & vận hành ⬜

- [ ] Log có cấu trúc → dịch vụ tập trung
- [ ] Sentry (frontend + backend)
- [ ] Health check nâng cao (DB + Redis + R2)
- [ ] Sinh OpenAPI từ schema Zod
- [ ] CI/CD chạy `npm run check` mỗi pull request
- [ ] Docker + docker-compose
- [ ] Test end-to-end (Playwright)
- [ ] Đo hiệu năng + performance budget

---

## Việc cần làm trước khi lên production

- [ ] **Đổi mật khẩu MongoDB Atlas** (mật khẩu cũ đã lộ trong lịch sử git)
- [ ] Sinh khoá JWT mới, khác nhau cho access và refresh
- [ ] Đặt `NODE_ENV=production`
- [ ] Cấu hình `CORS_ORIGINS` đúng domain thật
- [ ] Đổi `SEED_SUPER_ADMIN_PASSWORD`, xoá tài khoản `admin@example.com` và `member@example.com`
- [ ] Tăng `BCRYPT_ROUNDS` lên 12
- [ ] Chuyển rate limit sang store Redis (nếu chạy nhiều instance)
- [ ] Bật HTTPS, đặt `COOKIE_SAME_SITE` phù hợp
- [ ] Giới hạn IP truy cập MongoDB Atlas (bỏ `0.0.0.0/0`)
- [ ] Thiết lập sao lưu cơ sở dữ liệu
