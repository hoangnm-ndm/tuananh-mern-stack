# Tài liệu dự án

Bộ tài liệu này giải thích **vì sao** source base được thiết kế như hiện tại, không chỉ **nó làm gì**.
Code có thể đọc được; lý do đằng sau các quyết định thì không.

## Đọc theo thứ tự nào?

| Bạn là ai           | Đọc theo thứ tự                                                                      |
| ------------------- | ------------------------------------------------------------------------------------ |
| Người mới vào dự án | [01](./01-tong-quan.md) → [02](./02-kien-truc.md) → [08](./08-quy-uoc-code.md)       |
| Làm backend         | [02](./02-kien-truc.md) → [03](./03-backend.md) → [05](./05-xac-thuc-phan-quyen.md)  |
| Làm frontend        | [02](./02-kien-truc.md) → [04](./04-frontend.md) → [05](./05-xac-thuc-phan-quyen.md) |
| Triển khai / DevOps | [06](./06-bien-moi-truong.md) → [09](./09-lo-trinh.md)                               |
| Viết test           | [07](./07-kiem-thu.md)                                                               |

## Mục lục

| #   | Tài liệu                                             | Nội dung                                       |
| --- | ---------------------------------------------------- | ---------------------------------------------- |
| 01  | [Tổng quan](./01-tong-quan.md)                       | Source base này là gì, cài đặt, chạy lần đầu   |
| 02  | [Kiến trúc](./02-kien-truc.md)                       | Sơ đồ tổng thể, nguyên tắc `core` vs `modules` |
| 03  | [Backend](./03-backend.md)                           | Các tầng, cách thêm module mới                 |
| 04  | [Frontend](./04-frontend.md)                         | Cấu trúc, custom hook, định tuyến              |
| 05  | [Xác thực & Phân quyền](./05-xac-thuc-phan-quyen.md) | 3 phương thức đăng nhập, RBAC                  |
| 06  | [Biến môi trường](./06-bien-moi-truong.md)           | Giải thích từng biến, cách lấy giá trị         |
| 07  | [Kiểm thử](./07-kiem-thu.md)                         | Chiến lược test, cách viết test mới            |
| 08  | [Quy ước code](./08-quy-uoc-code.md)                 | Đặt tên, cấu trúc file, quy tắc chung          |
| 09  | [Lộ trình](./09-lo-trinh.md)                         | Các phase tiếp theo: cron, cache, mail, R2     |

## Ghi chú về thuật ngữ

Tài liệu giữ nguyên thuật ngữ tiếng Anh khi đó là tên chuẩn của ngành (ví dụ: _middleware_,
_repository_, _token_), kèm chú thích tiếng Việt ở lần xuất hiện đầu tiên. Việc này giúp bạn
tra cứu tài liệu quốc tế mà không bị lệch từ vựng.
