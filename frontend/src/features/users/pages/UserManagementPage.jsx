import { Button } from "@/core/components/ui/Button.jsx";
import { DataTable } from "@/core/components/ui/DataTable.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { Pagination } from "@/core/components/ui/Pagination.jsx";
import { useTableQuery } from "@/core/hooks/useTableQuery.js";
import { useToast } from "@/core/hooks/useToast.js";
import { useAuth } from "@/core/auth/useAuth.js";
import { ROLES, ROLE_LABELS } from "@/core/config/constants.js";
import { formatDateTime } from "@/core/utils/format.js";
import { useChangeUserRole, useSetUserStatus, useUsers } from "../useUsers.js";

/** Trang quan tri nguoi dung - vi du thu hai cua khuon mau CRUD. */
export default function UserManagementPage() {
  const toast = useToast();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const table = useTableQuery({ defaultSort: "-createdAt" });

  const { items, pagination, isLoading, error } = useUsers(table.queryParams);

  const changeRole = useChangeUserRole({
    onSuccess: (_, message) => toast.success(message),
    onError: (apiError) => toast.error(apiError.message),
  });

  const setStatus = useSetUserStatus({
    onSuccess: (_, message) => toast.success(message),
    onError: (apiError) => toast.error(apiError.message),
  });

  const columns = [
    { key: "name", header: "Ho ten", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "role",
      header: "Vai tro",
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        // Chi superAdmin moi duoc doi vai tro, va khong duoc tu doi cua chinh minh
        if (!isSuperAdmin || isSelf) {
          return <span className="text-slate-700">{ROLE_LABELS[row.role] ?? row.role}</span>;
        }
        return (
          <select
            value={row.role}
            onChange={(event) => changeRole.mutate({ id: row.id, role: event.target.value })}
            disabled={changeRole.isPending}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            aria-label={`Vai tro cua ${row.name}`}
          >
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "isActive",
      header: "Trang thai",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Hoat dong" : "Bi khoa"}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Dang nhap gan nhat",
      sortable: true,
      render: (row) => (row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Chua tung"),
    },
    {
      key: "actions",
      header: "Thao tac",
      render: (row) => {
        if (row.id === currentUser?.id) {
          return <span className="text-xs text-slate-400">Tai khoan cua ban</span>;
        }
        return (
          <Button
            size="sm"
            variant="ghost"
            className={
              row.isActive ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
            }
            onClick={() => setStatus.mutate({ id: row.id, isActive: !row.isActive })}
            isLoading={setStatus.isPending && setStatus.variables?.id === row.id}
          >
            {row.isActive ? "Khoa" : "Mo khoa"}
          </Button>
        );
      },
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Quan ly nguoi dung</h1>
        <p className="text-sm text-slate-500">Tong cong {pagination.total} tai khoan</p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <FormField
          label="Tim kiem"
          placeholder="Ten hoac email..."
          value={table.searchInput}
          onChange={(event) => table.setSearchInput(event.target.value)}
          className="w-full sm:w-72"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-role" className="text-sm font-medium text-slate-700">
            Vai tro
          </label>
          <select
            id="filter-role"
            value={table.filters.role ?? ""}
            onChange={(event) => table.setFilter("role", event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tat ca</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
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
        emptyMessage="Khong co nguoi dung nao khop dieu kien"
        onSort={table.toggleSort}
        getSortDirection={table.getSortDirection}
      />

      <Pagination pagination={pagination} onPageChange={table.setPage} />
    </section>
  );
}
