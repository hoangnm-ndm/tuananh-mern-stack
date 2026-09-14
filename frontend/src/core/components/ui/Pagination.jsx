import clsx from "clsx";
import { Button } from "./Button.jsx";

/**
 * Thanh phan trang dung chung - nhan thang doi tuong `pagination`
 * ma backend tra ve trong `meta.pagination`.
 */
export function Pagination({ pagination, onPageChange, className }) {
  const { page, totalPages, total, limit, hasPrevPage, hasNextPage } = pagination;

  if (!total) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Phan trang"
      className={clsx("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <p className="text-sm text-slate-600">
        Hien thi <strong>{from}</strong>–<strong>{to}</strong> trong tong so{" "}
        <strong>{total}</strong>
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
        >
          Truoc
        </Button>

        <span className="px-2 text-sm text-slate-600">
          Trang {page} / {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </nav>
  );
}
