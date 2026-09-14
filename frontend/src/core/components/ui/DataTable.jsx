import clsx from "clsx";
import { Spinner } from "./Spinner.jsx";

/**
 * Bang du lieu dung chung.
 *
 * Nhan `columns` dang khai bao -> mot module CRUD moi chi can mo ta cot,
 * khong phai viet lai the <table> va cac trang thai rong/loi/dang tai.
 *
 * @example
 * <DataTable
 *   columns={[
 *     { key: "title", header: "Ten", sortable: true },
 *     { key: "price", header: "Gia", render: (row) => formatCurrency(row.price) },
 *   ]}
 *   rows={items}
 * />
 */
export function DataTable({
  columns,
  rows,
  isLoading = false,
  error = null,
  emptyMessage = "Chua co du lieu",
  getRowId = (row) => row.id,
  onSort,
  getSortDirection,
  className,
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
      >
        {error.message ?? "Khong tai duoc du lieu"}
      </div>
    );
  }

  return (
    <div className={clsx("overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => {
              const direction = column.sortable
                ? getSortDirection?.(column.sortKey ?? column.key)
                : null;

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    "px-4 py-3 text-left font-semibold text-slate-700",
                    column.className,
                    column.sortable && "cursor-pointer select-none hover:bg-slate-100",
                  )}
                  aria-sort={
                    direction ? (direction === "asc" ? "ascending" : "descending") : "none"
                  }
                  onClick={
                    column.sortable ? () => onSort?.(column.sortKey ?? column.key) : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span aria-hidden="true" className="text-xs text-slate-400">
                        {direction === "asc" ? "▲" : direction === "desc" ? "▼" : "⇅"}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10">
                <Spinner />
              </td>
            </tr>
          )}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            rows.map((row) => (
              <tr key={getRowId(row)} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx("px-4 py-3 text-slate-700", column.cellClassName)}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
