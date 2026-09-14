import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Button } from "@/core/components/ui/Button.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { PATHS } from "@/core/router/paths.js";
import { registerSchema } from "../auth.schemas.js";
import { useAuthActions } from "../useAuthActions.js";
import { SocialLoginButtons } from "../components/SocialLoginButtons.jsx";

export default function RegisterPage() {
  const { register: submitRegister, loginWithGoogle, isSubmitting, serverError } = useAuthActions();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Tao tai khoan</h1>
      <p className="mb-6 text-sm text-slate-500">Chi mat chua toi mot phut.</p>

      <form
        onSubmit={handleSubmit((values) => submitRegister(values, { setError }))}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          label="Ho va ten"
          autoComplete="name"
          placeholder="Nguyen Van A"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          label="Mat khau"
          type="password"
          autoComplete="new-password"
          required
          hint="Toi thieu 8 ky tu, co chu hoa, chu thuong va so."
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Xac nhan mat khau"
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && <Alert type="error">{serverError}</Alert>}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Dang ky
        </Button>
      </form>

      <SocialLoginButtons onGoogleLogin={loginWithGoogle} isSubmitting={isSubmitting} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Da co tai khoan?{" "}
        <Link to={PATHS.LOGIN} className="font-medium text-indigo-600 hover:underline">
          Dang nhap
        </Link>
      </p>
    </div>
  );
}
