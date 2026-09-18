import { Building2, FileText, Phone, UserRound } from "lucide-react";
import { COMPANY } from "@/lib/legal";

/** Điều 4 NĐ 248 — thông tin chủ quản, đặt ở vị trí dễ thấy trên trang chủ. */
const FIELDS = [
  { icon: Building2, label: "Tên tổ chức", value: COMPANY.name },
  { icon: FileText, label: "Địa chỉ trụ sở chính", value: COMPANY.headOffice },
  {
    icon: UserRound,
    label: "Người đại diện theo pháp luật",
    value: `${COMPANY.legalRepName} — Chức danh: ${COMPANY.legalRepTitle}`,
  },
  {
    icon: FileText,
    label: "Số GCN đăng ký doanh nghiệp / Mã số thuế",
    value: COMPANY.businessCode,
  },
  { icon: FileText, label: "Nơi cấp", value: COMPANY.businessRegIssuer },
  { icon: FileText, label: "Ngày cấp", value: COMPANY.businessRegDate },
];

export function HomeBusinessInfo() {
  return (
    <section
      className="py-16 md:py-20 px-4 sm:px-6"
      style={{ background: "white", borderTop: "1px solid var(--color-border)" }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl md:text-3xl font-bold mb-8 text-center"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Thông tin doanh nghiệp
        </h2>
        <div
          className="grid sm:grid-cols-2 gap-5 rounded-3xl p-6 md:p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {FIELDS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(26,74,122,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 sm:col-span-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(26,74,122,0.08)" }}
            >
              <Phone className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                Hỗ trợ trực tuyến
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Hotline {COMPANY.hotline} (24/7) · Email: {COMPANY.email} · Biểu
                mẫu phản ánh trực tuyến tại trang &quot;Liên hệ&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
