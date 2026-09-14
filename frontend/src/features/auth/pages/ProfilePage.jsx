import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Button } from "@/core/components/ui/Button.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { useAuth } from "@/core/auth/useAuth.js";
import { useToast } from "@/core/hooks/useToast.js";
import { ROLE_LABELS } from "@/core/config/constants.js";
import { authApi } from "../auth.api.js";
import { changePasswordSchema, updateProfileSchema } from "../auth.schemas.js";
import { useState } from "react";

/** Trang ho so ca nhan: doi ten va doi mat khau. */
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Ho so cua toi</h1>
        <p className="text-sm text-slate-500">
          {user?.email} · {ROLE_LABELS[user?.role] ?? user?.role}
        </p>
      </header>

      <ProfileForm user={user} onUpdated={setUser} toast={toast} />
      <ChangePasswordForm toast={toast} />
    </div>
  );
}

function ProfileForm({ user, onUpdated, toast }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const response = await authApi.updateProfile(values);
      onUpdated(response.data);
      toast.success("Cap nhat ho so thanh cong");
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-900">Thong tin ca nhan</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField label="Ho va ten" error={errors.name?.message} {...register("name")} />
        {serverError && <Alert type="error">{serverError}</Alert>}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Luu thay doi
          </Button>
        </div>
      </form>
    </section>
  );
}

function ChangePasswordForm({ toast }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await authApi.changePassword(values);
      toast.success("Doi mat khau thanh cong");
      reset();
    } catch (error) {
      if (error.isValidationError) {
        for (const [field, message] of Object.entries(error.toFormErrors())) {
          setError(field, { type: "server", message });
        }
        return;
      }
      setServerError(error.message);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-slate-900">Doi mat khau</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          label="Mat khau hien tai"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <FormField
          label="Mat khau moi"
          type="password"
          autoComplete="new-password"
          hint="Toi thieu 8 ky tu, co chu hoa, chu thuong va so."
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <FormField
          label="Xac nhan mat khau moi"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Doi mat khau
          </Button>
        </div>
      </form>
    </section>
  );
}
