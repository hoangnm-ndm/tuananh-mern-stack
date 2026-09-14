# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc với repo này.

## Repo này là gì

Source base fullstack tái sử dụng cho nhiều dự án. Monorepo npm workspaces:

- `backend/` — Express 5 + MongoDB (Mongoose 8) + Zod 4, **ESM thuần**
- `frontend/` — React 19 + Vite 7 + TanStack Query 5 + React Hook Form + Zod 4 + Tailwind 4
- `docs/` — tài liệu tiếng Việt, có sơ đồ Mermaid
- `scripts/` — script dùng chung ở gốc

Node ≥ 20.11. Package manager: **npm** (không dùng yarn/pnpm).

## Lệnh — luôn chạy từ thư mục gốc

```bash
npm install           # cài cho cả hai workspace
npm run dev           # backend + frontend song song
npm run dev:be        # chỉ backend (cổng 8000)
npm run dev:fe        # chỉ frontend (cổng 5173)
npm test              # toàn bộ test
npm run test:be       # test backend
npm run test:fe       # test frontend
npm run lint          # eslint toàn repo
npm run format        # prettier
npm run check         # format:check + lint + test — CHẠY TRƯỚC KHI BÁO XONG
npm run env:check     # kiểm tra .env đồng bộ với .env.example
npm run env:sync      # tạo/bổ sung .env từ .env.example
npm run seed          # dữ liệu mẫu
npm run kill:ports    # tắt tiến trình chiếm cổng 8000/5173/4173
```

Chạy một file test:

```bash
cd backend && npx vitest run tests/integration/auth.test.js
cd frontend && npx vitest run src/core/router/guards.test.jsx
```

## Quy tắc kiến trúc — quan trọng nhất

### Phụ thuộc chỉ đi MỘT chiều

```
modules/ (backend)  →  core/     ✅
features/ (frontend) →  core/    ✅
core/  →  modules/ hoặc features/  ❌ TUYỆT ĐỐI KHÔNG
```

`core/` phải mang sang dự án khác được mà không kéo theo code nghiệp vụ.
Nếu thấy mình sắp import từ `modules/` vào `core/` — dừng lại, thiết kế sai.

Module cần nhau thì gọi qua **service** của nhau, không gọi thẳng model.

### Backend: các tầng

`Route → validate() → authenticate() → authorize() → Controller → Service → Repository → Model`

- **Service và Repository KHÔNG được biết `req`/`res`.** Đó là lý do chúng test được trực tiếp.
- Controller chỉ: đọc request → gọi service → `ApiResponse`.
- Logic nghiệp vụ nằm ở Service, không nằm ở Controller.

### Frontend: các tầng

`Page → Custom hook → TanStack Query → Lớp API → Axios client`

- **Trang không gọi `axios` trực tiếp.** Không có ngoại lệ.
- Feature lớn phải có **một** custom hook gom logic (`useProducts`, `useAuthActions`).
- Context và Provider ở **hai file riêng** (Fast Refresh của Vite yêu cầu).

## Khuôn mẫu bắt buộc dùng lại

Trước khi viết code mới, kiểm xem `core/` đã có sẵn chưa:

| Cần làm gì                     | Dùng cái có sẵn                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| CRUD backend                   | `BaseRepository` + `BaseService` + `createCrudController`                                 |
| CRUD frontend                  | `createCrudHooks({ api, keys, resourceName })`                                            |
| Bảng có phân trang/lọc/sắp xếp | `useTableQuery` + `DataTable` + `Pagination`                                              |
| Ném lỗi                        | `AppError.notFound()`, `.badRequest()`, `.forbidden()`, `.conflict()`, `.validation()`    |
| Trả response                   | `ApiResponse.ok/created/paginated/noContent`                                              |
| Handler async                  | `asyncHandler(...)` — không viết `try/catch` trong controller                             |
| Validate request               | `validate({ body, params, query })`                                                       |
| Chặn quyền                     | `requirePermission(...)` (ưu tiên), `requireRole`, `requireMinRole`, `requireOwnershipOr` |
| Form                           | `useForm` + `zodResolver` + `FormField`                                                   |
| Đường dẫn frontend             | `PATHS` / `buildPath` — không viết chuỗi thẳng                                            |

## Thêm module backend mới

Sao chép cấu trúc của `backend/src/modules/product/` (đó là module mẫu):

1. `<tên>.model.js` — schema + `plugin(toJSONPlugin)`
2. `<tên>.repository.js` — `new BaseRepository(Model)` hoặc kế thừa
3. `<tên>.service.js` — `extends BaseService`, khai báo `searchableFields`/`filterableFields`/`sortableFields`
4. `<tên>.validation.js` — schema Zod
5. `<tên>.controller.js` — `createCrudController(service, ...)`
6. `<tên>.route.js` — route + `validate` + `requirePermission`
7. **Đăng ký vào `backend/src/modules/index.js`** ← file duy nhất cần sửa ngoài thư mục module
8. Thêm quyền mới vào `backend/src/core/constants/roles.js`

Chi tiết kèm code đầy đủ: `docs/03-backend.md`.

## Thêm feature frontend mới

Sao chép `frontend/src/features/products/`:

1. `<tên>.api.js` — 5 hàm: `list`, `getById`, `create`, `update`, `remove`
2. `<tên>.schemas.js` — schema Zod cho form
3. `use<Tên>.js` — `createCrudHooks(...)`
4. `components/<Tên>Form.jsx`
5. `pages/<Tên>ManagementPage.jsx`
6. Thêm key vào `core/query/queryKeys.js`
7. Thêm đường dẫn vào `core/router/paths.js`
8. Khai báo route trong `routes/index.jsx`

## Quy ước ngôn ngữ

| Nơi                                   | Ngôn ngữ                 |
| ------------------------------------- | ------------------------ |
| Tên biến/hàm/class                    | Tiếng Anh                |
| Comment trong code                    | Tiếng Việt **không dấu** |
| Chuỗi hiển thị cho người dùng         | Tiếng Việt **không dấu** |
| `docs/`, `README.md`, `CHECK_LIST.md` | Tiếng Việt **có dấu**    |
| Tên test `it("...")`                  | Tiếng Việt không dấu     |

Giữ đúng quy ước này khi sửa code — đừng thêm dấu vào comment, đừng bỏ dấu trong tài liệu.

## Comment viết thế nào

Giải thích **vì sao**, không mô tả **cái gì**. Code đã nói "cái gì" rồi.

```js
// ❌ Tang count len 1
count += 1;

// ✅ `jti` bat buoc phai co: neu khong, hai token cap trong cung MOT GIAY
//    se co payload y het nhau -> trung unique index `tokenHash`.
```

## Biến môi trường

- Thêm biến mới: sửa **cả ba nơi** — `.env.example`, schema Zod trong `backend/src/config/env.js`
  (hoặc `frontend/src/core/config/env.js`), và chạy `npm run env:sync`.
- `.env.example` phải có: mức độ quan trọng `[BẮT BUỘC]`/`[NÊN CÓ]`/`[TUỲ CHỌN]`, giải thích ý nghĩa,
  và **cách lấy giá trị** nếu là dịch vụ bên ngoài.
- `npm run env:check` phải pass.
- **Không bao giờ** đặt secret vào biến `VITE_*` (chúng công khai trong bundle).

## Quy tắc bảo mật — không thoả hiệp

- Không commit `.env`.
- Không log mật khẩu, token, hash.
- Luôn validate ở backend, kể cả khi frontend đã validate.
- Mọi endpoint cần bảo vệ đều phải có `requirePermission` — kiểm tra ở frontend chỉ là giao diện.
- Field cho phép lọc/sắp xếp phải nằm trong danh sách trắng.
- Thông báo lỗi đăng nhập phải trung tính (chống dò email đã đăng ký).
- Mật khẩu: `select: false` + `private: true` + hook băm `pre("save")`.

## Viết test

- Backend unit → `backend/tests/unit/` (không DB, không HTTP)
- Backend integration → `backend/tests/integration/` (Supertest + `mongodb-memory-server`)
- Frontend → đặt cạnh file nguồn: `Component.test.jsx`

Có sẵn công cụ:

- Backend: `tests/helpers/db.js` (`startTestDatabase`, `clearDatabase`), `tests/helpers/app.js`
  (`createClient`, `createUser`, `createUserAndLogin`, `auth`)
- Frontend: `src/test/utils.jsx` (`renderWithProviders`, `mockUsers`, `createHookWrapper`)

Endpoint mới phải có test cho: thành công, 422 sai dữ liệu, 401 chưa đăng nhập, 403 thiếu quyền
(kiểm **từng** vai trò), 404 không tồn tại.

Dùng `it.each` cho ma trận vai trò thay vì viết lặp.

## Trước khi báo hoàn thành

1. `npm run check` phải pass (format + lint + test).
2. **Tắt mọi tiến trình chạy ngầm**: `npm run kill:ports`, và dừng mọi lệnh dev đã khởi động.
3. Cập nhật `CHECK_LIST.md` nếu hoàn thành một hạng mục.
4. Cập nhật `docs/` nếu thay đổi kiến trúc hoặc thêm biến môi trường.
5. Báo cáo trung thực: test nào fail thì nói rõ, việc nào bỏ qua thì nói rõ lý do.

## Những chỗ dễ sai — đã gặp và đã sửa

Đọc trước khi sửa các file liên quan:

| Chỗ                                     | Vấn đề                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/http/asyncHandler.js`             | Phải có `try/catch` **bọc ngoài** `Promise.resolve` — lỗi ném đồng bộ không được bắt nếu thiếu                                                    |
| `core/middlewares/validate.js`          | Express 5 để `req.body` là `undefined` khi request không có body → phải quy về `{}`; `req.query` là getter chỉ đọc → phải `Object.defineProperty` |
| `modules/auth/auth.service.js`          | Token phải có `jti` ngẫu nhiên, nếu không hai token cấp cùng giây sẽ trùng `tokenHash`                                                            |
| `config/env.js`                         | Chuỗi rỗng trong `.env` phải quy về `undefined` trước khi validate, nếu không `z.url().optional()` báo lỗi oan                                    |
| `core/hooks/useTableQuery.js`           | Đồng bộ search lên URL phải nằm trong `useEffect` — gọi trong thân component gây vòng lặp render                                                  |
| `features/auth/pages/*CallbackPage.jsx` | Trạng thái suy ra từ URL phải tính lúc render (`useState(() => ...)`), không `setState` đồng bộ trong effect                                      |
| `core/middlewares/rateLimit.js`         | `keyGenerator` tự viết phải dùng `ipKeyGenerator()` để chuẩn hoá IPv6                                                                             |
| Route callback OAuth/magic link         | **Không** bọc `RequireGuest` — sẽ chặn đúng lúc phiên đang thiết lập                                                                              |
| Mọi model                               | Phải `schema.plugin(toJSONPlugin)` để `_id` → `id` và ẩn field `private`                                                                          |
| Seed / tạo dữ liệu test                 | Dùng `new Model().save()` chứ không `insertMany` — hook `pre("save")` (băm mật khẩu, sinh slug) mới chạy                                          |

## Chống mẫu — không được làm

```js
// ❌ core/ import từ modules/
// ❌ Controller chứa logic nghiệp vụ
// ❌ Service nhận req/res
// ❌ Component gọi axios trực tiếp
// ❌ Viết chuỗi đường dẫn thẳng: <Link to="/san-pham/123">
// ❌ try/catch lặp lại trong mỗi controller (đã có asyncHandler)
// ❌ Nuốt lỗi: catch {}  (trừ khi có chủ đích và ghi rõ lý do)
```
