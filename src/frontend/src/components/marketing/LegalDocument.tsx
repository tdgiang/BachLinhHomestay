import { Link } from "@/i18n/navigation";
import { FileText, Mail, Phone } from "lucide-react";
import { COMPANY } from "@/lib/legal";

/**
 * Khung trình bày văn bản chính sách đã ký ban hành (bản PDF trong
 * docs/page/). Nội dung truyền vào phải giữ nguyên câu chữ của văn bản gốc
 * vì đây là bản công bố trong hồ sơ đăng ký website với Bộ Công Thương.
 */

/** Đoạn văn thường, danh sách gạch đầu dòng, hoặc mục đánh số có nhãn in đậm. */
export type LegalBlock =
  | string
  | { items: string[] }
  | { label: string; text: string };

export type LegalArticle = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocumentData = {
  title: string;
  /** Dòng phạm vi áp dụng in dưới tiêu đề. */
  scope: string;
  bases: string[];
  preamble?: string[];
  articles: LegalArticle[];
};

/** Ngày ký ban hành chung của bộ văn bản chính sách. */
const ISSUED_AT = "Hà Nội, ngày 04 tháng 05 năm 2026";

export const LEGAL_PAGES = [
  { href: "/payment-policy", label: "Chính sách thanh toán" },
  { href: "/privacy", label: "Chính sách bảo mật" },
  { href: "/terms", label: "Điều khoản sử dụng" },
  {
    href: "/service-refund-policy",
    label: "Phương thức cung cấp dịch vụ & hoàn tiền",
  },
] as const;

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return <p>{block}</p>;
  }
  if ("items" in block) {
    return (
      <ul className="space-y-2 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "var(--color-primary-light)" }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div>
      <p
        className="font-semibold mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        {block.label}
      </p>
      <p>{block.text}</p>
    </div>
  );
}

export function LegalDocument({
  doc,
  currentHref,
}: {
  doc: LegalDocumentData;
  currentHref: (typeof LEGAL_PAGES)[number]["href"];
}) {
  return (
    <div style={{ background: "var(--color-surface)" }}>
      <style>{`
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          .legal-paper { box-shadow: none !important; border: none !important; padding: 0 !important; }
          .legal-wrap { padding: 0 !important; background: white !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="no-print relative overflow-hidden py-14 md:py-20"
        style={{
          background:
            "linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            Văn bản ban hành
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {doc.title}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {doc.scope} · Ban hành ngày 04/05/2026
          </p>
        </div>
      </section>

      <section className="legal-wrap py-10 md:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
          {/* ── TABLE OF CONTENTS ──────────────────────────────────────── */}
          <aside className="no-print lg:sticky lg:top-24 self-start">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              Nội dung
            </p>
            <nav className="flex flex-col gap-1 text-sm">
              {doc.articles.map((a) => (
                <a
                  key={a.id}
                  href={`#${a.id}`}
                  className="px-3 py-2 rounded-lg transition-colors hover:bg-white"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {a.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* ── DOCUMENT ───────────────────────────────────────────────── */}
          <article
            className="legal-paper bg-white rounded-3xl p-6 sm:p-10 md:p-14 text-[15px] leading-relaxed"
            style={{
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            <h2
              className="text-center text-xl md:text-2xl font-bold uppercase mb-2"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {doc.title}
            </h2>
            <p className="text-center italic mb-8">{doc.scope}</p>

            <ul className="italic space-y-1 mb-8 text-sm">
              {doc.bases.map((b) => (
                <li key={b}>- {b}</li>
              ))}
            </ul>

            {doc.preamble && (
              <div className="space-y-3 mb-8">
                <h3
                  className="font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Lời mở đầu
                </h3>
                {doc.preamble.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            <div className="space-y-8">
              {doc.articles.map((a) => (
                <section
                  key={a.id}
                  id={a.id}
                  className="scroll-mt-24 space-y-3"
                >
                  <h3
                    className="text-base md:text-lg font-bold"
                    style={{
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {a.title}
                  </h3>
                  {a.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>

        {/* ── CONTACT + RELATED ────────────────────────────────────────── */}
        <div className="no-print max-w-6xl mx-auto mt-8 lg:pl-[272px] grid md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Liên hệ hỗ trợ
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={COMPANY.hotlineHref}
                className="flex items-center gap-2"
                style={{ color: "var(--color-primary)" }}
              >
                <Phone className="w-4 h-4" /> {COMPANY.hotline}
              </a>
              <a
                href={COMPANY.emailHref}
                className="flex items-center gap-2"
                style={{ color: "var(--color-primary)" }}
              >
                <Mail className="w-4 h-4" /> {COMPANY.email}
              </a>
            </div>
          </div>
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Chính sách liên quan
            </p>
            <ul className="space-y-2 text-sm">
              {LEGAL_PAGES.filter((p) => p.href !== currentHref).map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/chinh-sach"
                  className="hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  Tổng hợp Chính sách &amp; Pháp lý
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
