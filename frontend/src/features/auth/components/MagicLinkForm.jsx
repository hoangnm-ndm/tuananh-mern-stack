import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/core/components/ui/Button.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { env } from "@/core/config/env.js";
import { magicLinkSchema } from "../auth.schemas.js";
import { useAuthActions } from "../useAuthActions.js";

/**
 * Form gui magic link.
 * Sau khi gui thanh cong, doi giao dien sang trang thai "da gui"
 * de nguoi dung biet can di kiem tra hop thu.
 */
export function MagicLinkForm({ onSent }) {
  const { requestMagicLink, isSubmitting, serverError } = useAuthActions();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  if (!env.ENABLE_MAGIC_LINK) return null;

  const onSubmit = async (values) => {
    const { success } = await requestMagicLink(values, { setError });
    if (success) onSent?.(values.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="ban@example.com"
        error={errors.email?.message}
        hint="Chung toi se gui mot lien ket dang nhap toi email nay."
        {...register("email")}
      />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Gui lien ket dang nhap
      </Button>
    </form>
  );
}
