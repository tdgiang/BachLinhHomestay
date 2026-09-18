import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Printer, ShieldCheck } from "lucide-react";
import {
  COMPANY,
  POLICY_INDEX,
  BRANCHES,
  securityLicenseText,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Chính sách & Pháp lý | Ba.Li Homestay",
  description:
    "Trang tổng hợp toàn bộ nội dung công bố bắt buộc của Ba.Li Homestay theo Luật Thương mại điện tử 2025 và Nghị định 248/2026/NĐ-CP.",
};

type Props = { params: Promise<{ locale: string }> };

/** Điều 4 — thông tin chủ quản nền tảng, in kèm khi xuất PDF nộp hồ sơ. */
const OWNER_FIELDS: [string, string][] = [
  ["Tên tổ chức", COMPANY.name],
  ["Tên nền tảng thương mại điện tử", COMPANY.brand],
  ["Tên miền đã đăng ký với Bộ Công Thương", COMPANY.domain],
  ["Địa chỉ trụ sở chính", COMPANY.headOffice],
  [
    "Người đại diện theo pháp luật",
    `${COMPANY.legalRepName} — ${COMPANY.legalRepTitle}`,
  ],
  [
    "Số Giấy chứng nhận đăng ký doanh nghiệp (đồng thời là mã số thuế)",
    COMPANY.businessCode,
  ],
  ["Ngày cấp", COMPANY.businessRegDate],
  ["Nơi cấp", COMPANY.businessRegIssuer],
  ["Hỗ trợ trực tuyến", `Hotline ${COMPANY.hotline} (24/7) · Email ${COMPANY.email} · Biểu mẫu trực tuyến tại trang Liên hệ`],
  ["Địa điểm cung cấp dịch vụ", BRANCHES.map((b) => `Chi nhánh ${b.name}: ${b.address}`).join(" · ")],
  ["Ngành nghề kinh doanh có điều kiện", securityLicenseText()],
];

export default async function PolicyHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* Bản in bỏ nền tối và hiệu ứng để chụp/xuất PDF nộp hồ sơ. */}
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          section { padding: 12px 0 !important; background: white !important; }
          a { text-decoration: none !important; color: #0F2D50 !important; }
          .print-block { break-inside: avoid; border: 1px solid #ccc !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Công bố bắt buộc
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chính sách &amp; Pháp lý
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Toàn bộ nội dung Ba.Li Homestay công khai theo Luật Thương mại điện
            tử 2025 và Nghị định 248/2026/NĐ-CP, hiệu lực từ 01/7/2026.
          </p>

          <p className="text-sm mt-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            Cập nhật lần cuối: 18 tháng 9 năm 2026
          </p>
        </div>
      </section>

      {/* ── THÔNG TIN CHỦ QUẢN (Điều 4) ──────────────────────────────── */}
      <section className="py-14 md:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            id="chu-quan"
            className="text-2xl md:text-3xl font-bold mb-6 scroll-mt-24"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Thông tin chủ quản nền tảng (Điều 4)
          </h2>

          <dl
            className="print-block rounded-3xl divide-y"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderColor: "var(--color-border)",
            }}
          >
            {OWNER_FIELDS.map(([label, value]) => (
              <div
                key={label}
                className="grid sm:grid-cols-[minmax(0,280px)_1fr] gap-1 sm:gap-4 px-6 py-4"
                style={{ borderColor: "var(--color-border)" }}
              >
                <dt
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </dt>
                <dd
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── MỤC LỤC 13 NHÓM NỘI DUNG ─────────────────────────────────── */}
      <section
        className="py-14 md:py-20 px-4 sm:px-6"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Danh mục nội dung công bố
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Mỗi mục dẫn tới trang chứa nội dung chi tiết tương ứng với điều
            khoản của Nghị định 248/2026/NĐ-CP.
          </p>

          <ol className="space-y-3">
            {POLICY_INDEX.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="print-block group flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: "white",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{
                      background: "rgba(26,74,122,0.08)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {i + 1}
                  </span>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {item.title}
                      </p>
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{
                          background: "rgba(26,74,122,0.08)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {item.article}
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  <ArrowRight
                    className="w-4 h-4 mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: "var(--color-primary)" }}
                  />
                </Link>
              </li>
            ))}
          </ol>

          <p
            className="no-print text-xs mt-8 flex items-center gap-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Printer className="w-3.5 h-3.5" />
            Trang này đã tối ưu để in hoặc xuất PDF (Ctrl/Cmd + P) khi cần đính
            kèm hồ sơ đăng ký với Bộ Công Thương.
          </p>
        </div>
      </section>
    </div>
  );
}
