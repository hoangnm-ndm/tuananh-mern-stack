import { useState } from "react";
import { Button } from "@/core/components/ui/Button.jsx";
import { DataTable } from "@/core/components/ui/DataTable.jsx";
import { Modal } from "@/core/components/ui/Modal.jsx";
import { Pagination } from "@/core/components/ui/Pagination.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { useDisclosure } from "@/core/hooks/useDisclosure.js";
import { useTableQuery } from "@/core/hooks/useTableQuery.js";
import { useToast } from "@/core/hooks/useToast.js";
import { useAuth } from "@/core/auth/useAuth.js";
import { PERMISSIONS } from "@/core/config/constants.js";
import { formatCurrency, formatDate } from "@/core/utils/format.js";
import { ProductForm } from "../components/ProductForm.jsx";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../useProducts.js";

/**
 * Trang quan tri san pham - VI DU HOAN CHINH cua mot man hinh CRUD.
 *
 * Chu y so luong code rat it: moi phan viec nang deu da nam trong core/
 *   - `useTableQuery`  : trang thai bang, dong bo len URL
 *   - `useProducts`    : cache + goi API (sinh boi createCrudHooks)
 *   - `DataTable`      : bang + trang thai dang tai / rong / loi
 * Trang chi con viec KHAI BAO cot va noi cac manh lai.
 */
export default function ProductManagementPage() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const table = useTableQuery({ defaultSort: "-createdAt" });
  const formModal = useDisclosure();
  const [editingProduct, setEditingProduct] = useState(null);
  const [serverError, setServerError] = useState(null);

  const { items, pagination, isLoading, error } = useProducts(table.queryParams);

  const handleSuccess = (message) => {
    toast.success(message);
    formModal.close();
    setEditingProduct(null);
    setServerError(null);
  };
  const handleError = (apiError) => setServerError(apiError.message);

  const createMutation = useCreateProduct({
    onSuccess: (_, message) => handleSuccess(message),
    onError: handleError,
  });
  const updateMutation = useUpdateProduct({
    onSuccess: (_, message) => handleSuccess(message),
    onError: handleError,
  });
  const deleteMutation = useDeleteProduct({
    onSuccess: (_, message) => toast.success(message),
    onError: handleError,
  });

  const canCreate = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PRODUCT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRODUCT_DELETE);

  const openCreateForm = () => {
    setEditingProduct(null);
    setServerError(null);
    formModal.open();
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setServerError(null);
    formModal.open();
  };

  const handleDelete = (product) => {
    if (!window.confirm(`Xoa san pham "${product.title}"?`)) return;
    deleteMutation.mutate(product.id);
  };

  const handleSubmit = (values) => {
    if (editingProduct) updateMutation.mutate({ id: editingProduct.id, ...values });
    else createMutation.mutate(values);
  };

  /** Khai bao cot - day la toan bo phan "cau hinh" cua bang. */
  const columns = [
    { key: "title", header: "Ten san pham", sortable: true },
    {
      key: "price",
      header: "Gia",
      sortable: true,
      render: (row) => formatCurrency(row.price),
    },
    { key: "stock", header: "Ton kho", sortable: true },
    {
      key: "isActive",
      header: "Trang thai",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.isActive ? "Dang ban" : "Ngung ban"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngay tao",
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "Thao tac",
      render: (row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <Button size="sm" variant="ghost" onClick={() => openEditForm(row)}>
              Sua
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(row)}
              isLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
            >
              Xoa
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quan ly san pham</h1>
          <p className="text-sm text-slate-500">Tong cong {pagination.total} san pham</p>
        </div>
        {canCreate && <Button onClick={openCreateForm}>+ Them san pham</Button>}
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <FormField
          label="Tim kiem"
          placeholder="Nhap ten san pham..."
          value={table.searchInput}
          onChange={(event) => table.setSearchInput(event.target.value)}
          className="w-full sm:w-72"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-status" className="text-sm font-medium text-slate-700">
            Trang thai
          </label>
          <select
            id="filter-status"
            value={table.filters.isActive ?? ""}
            onChange={(event) => table.setFilter("isActive", event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tat ca</option>
            <option value="true">Dang ban</option>
            <option value="false">Ngung ban</option>
          </select>
        </div>

        <Button variant="ghost" onClick={table.resetAll}>
          Xoa bo loc
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        isLoading={isLoading}
        error={error}
        emptyMessage="Chua co san pham nao khop voi dieu kien loc"
        onSort={table.toggleSort}
        getSortDirection={table.getSortDirection}
      />

      <Pagination pagination={pagination} onPageChange={table.setPage} />

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={editingProduct ? "Chinh sua san pham" : "Them san pham moi"}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={formModal.close}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          serverError={serverError}
        />
      </Modal>
    </section>
  );
}
