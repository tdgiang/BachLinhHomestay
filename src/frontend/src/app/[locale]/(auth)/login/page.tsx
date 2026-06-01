"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, getSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  login: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
    // Detect email vs phone — phone contains only digits and starts with 0/+
    const isPhone = /^[0+][0-9]{8,14}$/.test(data.login.replace(/\s/g, ""));
    const result = await signIn("credentials", {
      email: isPhone ? undefined : data.login,
      phone: isPhone ? data.login : undefined,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email/số điện thoại hoặc mật khẩu không đúng");
    } else {
      const session = await getSession();
      if (session?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
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
          {t("loginTitle")}
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("loginSubtitle")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login">{t("emailOrPhone")}</Label>
            <Input
              id="login"
              type="text"
              placeholder="email@example.com hoặc 09xxxxxxxx"
              autoComplete="username"
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
                autoComplete="current-password"
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
              t("loginButton")
            )}
          </Button>
        </form>

        <p
          className="text-sm text-center mt-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {t("registerButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}
