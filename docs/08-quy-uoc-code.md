# 08 — Quy ước code

## Ngôn ngữ trong code và tài liệu

| Nơi                           | Ngôn ngữ                 | Lý do                                            |
| ----------------------------- | ------------------------ | ------------------------------------------------ |
| Tên biến, hàm, class          | Tiếng Anh                | Chuẩn ngành, đồng nhất với thư viện              |
| Comment trong code            | Tiếng Việt **không dấu** | Tránh lỗi mã hoá khi qua nhiều công cụ/terminal  |
| Chuỗi hiển thị cho người dùng | Tiếng Việt **không dấu** | Đồng nhất với comment; sẵn sàng cho i18n sau này |
| Tài liệu (`docs/`, `README`)  | Tiếng Việt **có dấu**    | Văn bản để đọc — dễ đọc là ưu tiên số một        |
| Tên test (`it("...")`)        | Tiếng Việt không dấu     | Kết quả test hiện trên terminal                  |

> Quy ước "code không dấu, tài liệu có dấu" là có chủ đích. Code đi qua nhiều môi trường
> (terminal, log, CI, công cụ diff) nơi dấu tiếng Việt dễ hiển thị sai; tài liệu thì chỉ đọc
> trên trình soạn thảo hoặc web nên không gặp vấn đề đó.

## Quy ước đặt tên file

### Backend

| Loại       | Mẫu                   | Ví dụ                   |
| ---------- | --------------------- | ----------------------- |
| Model      | `<tên>.model.js`      | `product.model.js`      |
| Repository | `<tên>.repository.js` | `user.repository.js`    |
| Service    | `<tên>.service.js`    | `auth.service.js`       |
| Controller | `<tên>.controller.js` | `product.controller.js` |
| Route      | `<tên>.route.js`      | `user.route.js`         |
| Validation | `<tên>.validation.js` | `article.validation.js` |
| Middleware | camelCase             | `errorHandler.js`       |
| Lớp cơ sở  | PascalCase            | `BaseRepository.js`     |

### Frontend

| Loại      | Mẫu                 | Ví dụ                            |
| --------- | ------------------- | -------------------------------- |
| Component | PascalCase `.jsx`   | `Button.jsx`, `DataTable.jsx`    |
| Hook      | `use<Tên>.js`       | `useAuth.js`, `useTableQuery.js` |
| Context   | `<Tên>Context.js`   | `AuthContext.js`                 |
| Provider  | `<Tên>Provider.jsx` | `AuthProvider.jsx`               |
| Lớp API   | `<tên>.api.js`      | `products.api.js`                |
| Schema    | `<tên>.schemas.js`  | `auth.schemas.js`                |
| Tiện ích  | camelCase `.js`     | `format.js`                      |

> **Context và Provider phải nằm ở hai file khác nhau.**
> Vite Fast Refresh chỉ giữ được state khi một file chỉ export component. Trộn chung sẽ khiến
> state bị reset mỗi lần sửa code.

## Quy ước đặt tên trong code

```js
// ✅ Biến boolean bắt đầu bằng is/has/should/can
const isLoading = true;
const hasPermission = false;
const canDelete = user.role === ROLES.ADMIN;

// ✅ Hàm bắt đầu bằng động từ
function buildPath() {}
function parseQueryFeatures() {}
async function createProduct() {}

// ✅ Hằng số: SCREAMING_SNAKE_CASE
const MAX_LIMIT = 100;
export const ROLES = Object.freeze({ ... });

// ✅ Biến private của class: dấu #
class AuthService {
  #assertGoogleEnabled() { ... }
}

// ✅ Tham số không dùng: tiền tố _
app.use((error, req, res, _next) => { ... });
```

## Quy tắc import

```js
// Thứ tự: thư viện ngoài → core → module khác → nội bộ module
import express from "express";
import { z } from "zod";

import { AppError } from "../../core/errors/index.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";

import { userService } from "../user/user.service.js";

import { productRepository } from "./product.repository.js";
```

**Backend bắt buộc ghi đuôi `.js`** — đó là yêu cầu của ESM trong Node.js.

**Frontend dùng bí danh `@/`** thay cho đường dẫn tương đối dài:

```js
// ❌
import { Button } from "../../../core/components/ui/Button.jsx";

// ✅
import { Button } from "@/core/components/ui/Button.jsx";
```

## Xử lý lỗi

```js
// ✅ Ném AppError với thông điệp cho người dùng
throw AppError.notFound("San pham khong ton tai");

// ❌ Không tự trả response lỗi trong service
res.status(404).json({ message: "..." });

// ❌ Không nuốt lỗi
try {
  await doSomething();
} catch {}

// ✅ Chỉ bỏ qua lỗi khi CÓ CHỦ ĐÍCH và ghi rõ lý do
await this.users.touchLastLogin(userId).catch(() => {});
// ^ Ghi nhận thời điểm đăng nhập thất bại không nên chặn việc đăng nhập
```

## Viết comment

Comment giải thích **vì sao**, không mô tả **cái gì** (code đã nói rồi).

```js
// ❌ Mô tả lại code
// Tăng biến count lên 1
count += 1;

// ✅ Giải thích quyết định
// `jti` la chuoi ngau nhien duy nhat cho MOI token.
// Bat buoc phai co: neu khong, hai token cap trong cung MOT GIAY cho cung
// mot nguoi dung se co payload y het nhau -> trung unique index `tokenHash`.
```

Dùng JSDoc cho các hàm dùng chung (`core/`) để trình soạn thảo gợi ý được:

```js
/**
 * Sinh bo 5 handler CRUD chuan tu mot service.
 *
 * @param {import("../service/BaseService.js").BaseService} service
 * @param {object} [options]
 * @param {(req:any)=>object} [options.buildCreatePayload] Bo sung field khi tao.
 */
```

## Định dạng — Prettier

Cấu hình ở `.prettierrc`:

| Thiết lập       | Giá trị                 |
| --------------- | ----------------------- |
| `printWidth`    | 100                     |
| `semi`          | `true`                  |
| `singleQuote`   | `false` (dùng nháy kép) |
| `trailingComma` | `all`                   |
| `tabWidth`      | 2                       |
| `arrowParens`   | `always`                |

```bash
npm run format        # định dạng lại toàn bộ
npm run format:check  # chỉ kiểm tra (dùng trong CI)
```

Đừng tranh luận về định dạng — để Prettier quyết định.

## Lint — ESLint

Một file `eslint.config.js` ở gốc, dùng flat config, chia theo vùng:

| Vùng                           | Môi trường            | Quy tắc riêng                                         |
| ------------------------------ | --------------------- | ----------------------------------------------------- |
| `backend/**`                   | Node ESM              | `no-console` cảnh báo (chỉ cho `warn`/`error`/`info`) |
| `backend/tests/**`             | Node + Vitest globals | Cho phép `console`                                    |
| `frontend/**`                  | Browser + React       | `react-hooks`, `react-refresh`                        |
| `scripts/**`, `**/*.config.js` | Node                  | Cho phép `console`                                    |

```bash
npm run lint       # kiểm tra
npm run lint:fix   # tự sửa những gì sửa được
```

## Quy trình làm việc

```mermaid
graph LR
    A["Viết code"] --> B["npm run format"]
    B --> C["npm run lint"]
    C --> D["npm test"]
    D --> E{"Tất cả pass?"}
    E -->|Không| A
    E -->|Có| F["git commit"]

    style E fill:#fef3c7
    style F fill:#dcfce7
```

Gọn hơn: `npm run check` chạy cả ba bước.

## Quy tắc bảo mật — không thoả hiệp

| Quy tắc                                                     | Lý do                                          |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Không bao giờ commit `.env`                                 | Lộ khoá JWT, mật khẩu DB                       |
| Không log mật khẩu, token, hash                             | Log thường được gửi sang dịch vụ bên thứ ba    |
| Luôn validate ở **backend**, kể cả khi frontend đã validate | Request có thể gửi thẳng không qua trình duyệt |
| Mọi endpoint đều phải có `requirePermission`                | Quên một cái là thủng một lỗ                   |
| Danh sách trắng cho field lọc/sắp xếp                       | Chặn dò dữ liệu qua query string               |
| Không đặt secret vào biến `VITE_*`                          | Chúng nằm công khai trong bundle               |
| Thông báo lỗi đăng nhập phải trung tính                     | Chống dò email đã đăng ký                      |

## Chống mẫu (anti-pattern) cần tránh

```js
// ❌ core/ import từ modules/ — phá vỡ tính tái sử dụng
// core/utils/helper.js
import { User } from "../../modules/user/user.model.js";

// ❌ Controller chứa logic nghiệp vụ
export const create = asyncHandler(async (req, res) => {
  if (await User.findOne({ email: req.body.email })) { ... }  // → đưa vào service
});

// ❌ Service biết về req/res
class ProductService {
  create(req, res) { ... }  // → chỉ nhận dữ liệu thuần
}

// ❌ Frontend gọi axios trong component
function ProductPage() {
  useEffect(() => { axios.get("/products").then(...) }, []);  // → dùng custom hook
}

// ❌ Chuỗi đường dẫn viết thẳng
<Link to="/san-pham/123">  // → dùng buildPath(PATHS.PRODUCT_DETAIL, { slug })
```
