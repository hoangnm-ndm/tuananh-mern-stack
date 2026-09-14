import { Link, useParams } from "react-router";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Spinner } from "@/core/components/ui/Spinner.jsx";
import { PATHS } from "@/core/router/paths.js";
import { formatCurrency, formatDate } from "@/core/utils/format.js";
import { useProductBySlug } from "../useProducts.js";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { item: product, isLoading, error } = useProductBySlug(slug);

  if (isLoading) return <Spinner className="py-20" />;

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert type="error" title="Khong tai duoc san pham">
          {error.message}
        </Alert>
        <Link to={PATHS.PRODUCTS} className="text-sm font-medium text-indigo-600 hover:underline">
          ← Quay lai danh sach
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <article className="flex flex-col gap-4">
      <Link to={PATHS.PRODUCTS} className="text-sm font-medium text-indigo-600 hover:underline">
        ← Quay lai danh sach
      </Link>

      <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(product.price)}</p>

      <dl className="grid max-w-md grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Ton kho</dt>
        <dd className="text-slate-900">{product.stock}</dd>
        <dt className="text-slate-500">Ngay tao</dt>
        <dd className="text-slate-900">{formatDate(product.createdAt)}</dd>
      </dl>

      <p className="max-w-2xl whitespace-pre-line leading-relaxed text-slate-700">
        {product.description || "Chua co mo ta cho san pham nay."}
      </p>
    </article>
  );
}
