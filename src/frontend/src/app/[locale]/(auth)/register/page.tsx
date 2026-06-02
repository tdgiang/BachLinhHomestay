"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const schema = z
  .object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    login: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const isEmail = data.login.includes("@");
      await api.post("/api/v1/auth/register", {
        fullName: data.fullName,
        email: isEmail ? data.login : undefined,
        phone: !isEmail ? data.login : undefined,
        password: data.password,
      });
      router.push("/login?registered=1");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    }
  };

  return (
    <div className="w-full max-w-md">
      <BrandLogo
        showText
        size="lg"
        asLink={false}
        className="justify-center mb-8"
      />

      <div
        className="bg-white rounded-2xl shadow-sm border p-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {t("registerTitle")}
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("registerSubtitle")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login">{t("emailOrPhone")}</Label>
            <Input
              id="login"
              placeholder="email@example.com hoặc 09xxxxxxxx"
              {...register("login")}
            />
            {errors.login && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {errors.login.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-secondary)" }}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div
              className="text-sm rounded-lg px-3 py-2.5"
              style={{ background: "#FEF2F2", color: "var(--color-danger)" }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-semibold"
            style={{ background: "var(--color-primary)" }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("registerButton")
            )}
          </Button>
        </form>

        <p
          className="text-sm text-center mt-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {t("loginButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}
