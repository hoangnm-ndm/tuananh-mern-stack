import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/core/components/ui/Button.jsx";
import { FormField, TextAreaField } from "@/core/components/ui/FormField.jsx";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { productFormDefaults, productFormSchema } from "../products.schemas.js";

/**
 * Form dung chung cho CA tao moi va chinh sua.
 * Phan biet qua prop `product`: co thi la sua, khong thi la tao.
 */
export function ProductForm({ product = null, onSubmit, isSubmitting, serverError, onCancel }) {
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  });

  /** Nap du lieu vao form khi mo che do chinh sua (hoac doi san pham khac). */
  useEffect(() => {
    reset(
      product
        ? {
            title: product.title ?? "",
            price: product.price ?? 0,
            stock: product.stock ?? 0,
            description: product.description ?? "",
            isActive: product.isActive ?? true,
          }
        : productFormDefaults,
    );
  }, [product, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Ten san pham"
        required
        placeholder="Vi du: Ao thun co tron"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Gia (VND)"
          type="number"
          min="0"
          step="1000"
          required
          error={errors.price?.message}
          {...register("price")}
        />

        <FormField
          label="Ton kho"
          type="number"
          min="0"
          step="1"
          required
          error={errors.stock?.message}
          {...register("stock")}
        />
      </div>

      <TextAreaField
        label="Mo ta"
        placeholder="Mo ta chi tiet san pham..."
        error={errors.description?.message}
        {...register("description")}
      />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          {...register("isActive")}
        />
        Dang ban (hien tren trang cong khai)
      </label>

      {serverError && <Alert type="error">{serverError}</Alert>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Huy
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Luu thay doi" : "Tao san pham"}
        </Button>
      </div>
    </form>
  );
}
