import { FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { POLICY_INDEX } from "@/lib/legal";

/**
 * Khối "Chính sách & Pháp lý" trên trang chủ.
 *
 * Nghị định 248/2026/NĐ-CP yêu cầu công bố các nội dung bắt buộc "ở vị trí dễ
 * thấy trên trang chủ" — link ở footer là chưa đủ. Khối này liệt kê đủ 13 nhóm
 * nội dung kèm số điều tương ứng, mỗi mục trỏ thẳng tới trang chứa nội dung.
 */
export function HomePolicyHub() {
  return (
    <section
      className="py-16 md:py-20 px-4 sm:px-6"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              background: "rgba(26,74,122,0.08)",
              color: "var(--color-primary)",
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Công bố theo Nghị định 248/2026/NĐ-CP
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Chính sách &amp; Pháp lý
          </h2>
          <p
            className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Toàn bộ nội dung bắt buộc phải công khai đối với nền tảng thương mại
            điện tử, theo Luật Thương mại điện tử 2025 và Nghị định
            248/2026/NĐ-CP (hiệu lực từ 01/7/2026).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POLICY_INDEX.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col p-5 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(26,74,122,0.08)",
                    color: "var(--color-primary)",
                  }}
                >
                  {item.article}
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>

              <p
                className="text-sm font-semibold mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.title}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chinh-sach"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            <FileText className="w-4 h-4" />
            Xem trang tổng hợp toàn bộ chính sách
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
