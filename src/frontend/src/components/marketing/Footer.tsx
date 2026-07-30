import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  Receipt,
  UserRound,
  FileCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const navLinks = [
    { label: tNav("findRoom"), href: "/rooms" },
    { label: tNav("about"), href: "/about" },
    { label: tNav("contact"), href: "/contact" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách thanh toán", href: "/payment-policy" },
    { label: "Chính sách hoạt động theo NĐ 248", href: "/chinh-sach-nd248" },
  ];

  const branches = [
    { name: "Cầu Giấy", address: "66 Ngõ 61 Phạm Tuấn Tài" },
    // { name: "Đống Đa", address: "60 Ngõ 128 Nguyễn Đình Chiểu" },
    // { name: "Ba Đình", address: "105 Ngõ 103 Vũ Trọng Phụng" },
  ];

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <BrandLogo className="mb-3" />
            <p
              className="text-sm leading-relaxed max-w-xs mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("tagline")}
            </p>
            <div className="space-y-1.5">
              <a
                href="tel:0931708256"
                className="flex items-center gap-2 text-sm transition-colors hover:text-[--color-primary]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Phone className="w-3.5 h-3.5" /> 0931 708 256
              </a>
              <a
                href="mailto:admin@bachlinh.com.vn"
                className="flex items-center gap-2 text-sm transition-colors hover:text-[--color-primary]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Mail className="w-3.5 h-3.5" /> admin@bachlinh.com.vn
              </a>
            </div>

            <div
              className="mt-5 pt-4 space-y-2 text-xs leading-relaxed border-t"
              style={{
                color: "var(--color-text-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <p
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {t("companyName")}
              </p>
              <p className="flex items-start gap-2">
                <Receipt className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("taxCodeLabel")}: {t("taxCode")}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("headOfficeLabel")}: {t("headOffice")}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <UserRound className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("legalRepLabel")}: {t("legalRepName")} —{" "}
                  {t("legalRepTitle")}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <FileCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("bizRegLabel")}: {t("bizRegDate")} — {t("bizRegIssuer")}
                </span>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="font-semibold mb-4 text-sm uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("navigation")}
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-[--color-primary]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h3
              className="font-semibold mb-4 text-sm uppercase tracking-wider"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Chi nhánh
            </h3>
            <ul className="space-y-3">
              {branches.map((b) => (
                <li key={b.name}>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {b.name}
                  </p>
                  <p
                    className="text-xs flex items-start gap-1 mt-0.5"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {b.address}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator
          className="my-8"
          style={{ background: "var(--color-border)" }}
        />

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>Made with ❤️ in Hà Nội</p>
        </div>
      </div>
    </footer>
  );
}
