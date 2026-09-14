import { Link } from "react-router";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { Pagination } from "@/core/components/ui/Pagination.jsx";
import { Spinner } from "@/core/components/ui/Spinner.jsx";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { useTableQuery } from "@/core/hooks/useTableQuery.js";
import { buildPath, PATHS } from "@/core/router/paths.js";
import { formatCurrency, truncate } from "@/core/utils/format.js";
import { usePublicProducts } from "../useProducts.js";

/** Trang danh sach san pham cho khach - khong can dang nhap. */
export default function ProductListPage() {
  const table = useTableQuery({ defaultLimit: 12, defaultSort: "-createdAt" });
  const { items, pagination, isLoading, error } = usePublicProducts(table.queryParams);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">San pham</h1>
          <p className="text-sm text-slate-500">{pagination.total} san pham dang ban</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <FormField
            label="Tim kiem"
            placeholder="Ban dang tim gi?"
            value={table.searchInput}
            onChange={(event) => table.setSearchInput(event.target.value)}
            className="w-full sm:w-64"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sort" className="text-sm font-medium text-slate-700">
              Sap xep
            </label>
            <select
              id="sort"
              value={table.sort}
              onChange={(event) => table.patchParams({ sort: event.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="-createdAt">Moi nhat</option>
              <option value="price">Gia tang dan</option>
              <option value="-price">Gia giam dan</option>
              <option value="title">Ten A-Z</option>
            </select>
          </div>
        </div>
      </header>

      {error && <Alert type="error">{error.message}</Alert>}

      {isLoading ? (
        <Spinner className="py-20" />
      ) : items.length === 0 ? (
        <p className="py-20 text-center text-slate-500">Khong tim thay san pham nao.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <li key={product.id}>
              <Link
                to={buildPath(PATHS.PRODUCT_DETAIL, { slug: product.slug })}
                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
              >
                <h2 className="font-semibold text-slate-900">{product.title}</h2>
                <p className="mt-1 flex-1 text-sm text-slate-500">
                  {truncate(product.description, 90) || "Chua co mo ta"}
                </p>
                <p className="mt-3 text-lg font-bold text-indigo-600">
                  {formatCurrency(product.price)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination pagination={pagination} onPageChange={table.setPage} />
    </section>
  );
}
