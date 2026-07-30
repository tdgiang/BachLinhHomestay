import { Building2, FileText, Phone, UserRound } from "lucide-react";

const FIELDS = [
  {
    icon: Building2,
    label: "Tên tổ chức",
    value: "Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh",
  },
  {
    icon: FileText,
    label: "Địa chỉ trụ sở chính",
    value: "Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, TP Hà Nội, Việt Nam",
  },
  {
    icon: UserRound,
    label: "Người đại diện theo pháp luật",
    value: "Nguyễn Lan Phương — Chức danh: Giám đốc",
  },
  {
    icon: FileText,
    label: "Mã số doanh nghiệp / Mã số thuế",
    value: "0111484606",
  },
  {
    icon: FileText,
    label: "Nơi cấp",
    value: "Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội",
  },
  {
    icon: FileText,
    label: "Ngày cấp",
    value: "04/05/2026 (đăng ký lần đầu)",
  },
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
                Hotline 0931 708 256 (24/7) · Email: admin@bachlinh.com.vn · Biểu mẫu &quot;Liên hệ&quot; trên website
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
