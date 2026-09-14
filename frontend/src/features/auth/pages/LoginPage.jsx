import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/core/components/ui/Alert.jsx";
import { Button } from "@/core/components/ui/Button.jsx";
import { FormField } from "@/core/components/ui/FormField.jsx";
import { PATHS } from "@/core/router/paths.js";
import { env } from "@/core/config/env.js";
import { loginSchema } from "../auth.schemas.js";
import { useAuthActions } from "../useAuthActions.js";
import { SocialLoginButtons } from "../components/SocialLoginButtons.jsx";
import { MagicLinkForm } from "../components/MagicLinkForm.jsx";

/**
 * Trang dang nhap - gop ca 3 phuong thuc.
 *
 * Trang chi lo GIAO DIEN. Moi logic goi API nam trong `useAuthActions`
 * -> de doc, de test, va dung lai duoc o cho khac (vd: modal dang nhap).
 */
export default function LoginPage() {
  const [mode, setMode] = useState("password"); // "password" | "magic-link"
  const [sentTo, setSentTo] = useState(null);
  const { login, loginWithGoogle, isSubmitting, serverError } = useAuthActions();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Dang nhap</h1>
      <p className="mb-6 text-sm text-slate-500">Chao mung ban quay lai {env.APP_NAME}.</p>

      {sentTo ? (
        <Alert type="success" title="Da gui lien ket dang nhap">
          Kiem tra hop thu <strong>{sentTo}</strong> va bam vao lien ket de dang nhap. Lien ket het
          han sau 15 phut.
        </Alert>
      ) : (
        <>
          {mode === "password" ? (
            <form
              onSubmit={handleSubmit((values) => login(values, { setError }))}
              className="flex flex-col gap-4"
              noValidate
            >
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
                autoComplete="current-password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register("password")}
              />

              {serverError && <Alert type="error">{serverError}</Alert>}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Dang nhap
              </Button>
            </form>
          ) : (
            <MagicLinkForm onSent={setSentTo} />
          )}

          {env.ENABLE_MAGIC_LINK && (
            <button
              type="button"
              onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
              className="mt-4 w-full text-sm text-indigo-600 underline-offset-2 hover:underline"
            >
              {mode === "password"
                ? "Dang nhap bang lien ket email (khong can mat khau)"
                : "Dang nhap bang mat khau"}
            </button>
          )}

          <SocialLoginButtons onGoogleLogin={loginWithGoogle} isSubmitting={isSubmitting} />
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Chua co tai khoan?{" "}
        <Link to={PATHS.REGISTER} className="font-medium text-indigo-600 hover:underline">
          Dang ky ngay
        </Link>
      </p>
    </div>
  );
}
