import { useAuth } from "@/core/auth/useAuth.js";
import { ROLE_LABELS, PERMISSIONS } from "@/core/config/constants.js";
import { useProducts } from "@/features/products/useProducts.js";
import { useUsers } from "@/features/users/useUsers.js";

/** Trang tong quan cua khu vuc quan tri. */
export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  const canReadUsers = hasPermission(PERMISSIONS.USER_READ);
  const products = useProducts({ limit: 1 });
  const users = useUsers({ limit: 1 }, { enabled: canReadUsers });

  const stats = [
    { label: "Tong san pham", value: products.pagination.total, isLoading: products.isLoading },
    ...(canReadUsers
      ? [{ label: "Tong nguoi dung", value: users.pagination.total, isLoading: users.isLoading }]
      : []),
  ];

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Xin chao, {user?.name}</h1>
        <p className="text-sm text-slate-500">
          Ban dang dang nhap voi vai tro <strong>{ROLE_LABELS[user?.role] ?? user?.role}</strong>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {stat.isLoading ? "…" : stat.value}
            </p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Quyen cua ban</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(user?.permissions ?? []).map((permission) => (
            <li
              key={permission}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
            >
              {permission}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
