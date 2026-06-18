import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  Banknote,
  Receipt,
  Lock,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chính sách thanh toán | Ba.Li Homestay",
  description:
    "Chính sách thanh toán Ba.Li Homestay — phương thức thanh toán, bảo mật giao dịch, hoàn tiền và xử lý sự cố qua cổng VNPay.",
};

type Props = { params: Promise<{ locale: string }> };

const METHODS = [
  {
    name: "Thẻ ATM nội địa",
    desc: "Napas — tất cả ngân hàng Việt Nam",
    icon: "🏦",
  },
  {
    name: "Thẻ quốc tế",
    desc: "Visa, Mastercard, JCB, American Express",
    icon: "💳",
  },
  { name: "MoMo", desc: "Ví điện tử MoMo", icon: "📱" },
  { name: "ZaloPay", desc: "Ví điện tử ZaloPay", icon: "💜" },
  { name: "VNPay QR", desc: "Quét mã QR qua app ngân hàng", icon: "📷" },
  { name: "Tiền mặt", desc: "Trực tiếp tại quầy lễ tân chi nhánh", icon: "💵" },
];

const SECTIONS = [
  {
    id: "methods",
    icon: CreditCard,
    title: "1. Phương thức thanh toán",
    content: [
      {
        subtitle: "Thanh toán trực tuyến qua VNPay",
        items: [
          "Tất cả giao dịch trực tuyến được xử lý qua cổng thanh toán VNPay — đối tác được Ngân hàng Nhà nước Việt Nam cấp phép.",
          "Hỗ trợ thẻ ATM nội địa (Napas), thẻ Visa/Mastercard/JCB/Amex, ví MoMo, ZaloPay và VNPay QR.",
          "Sau khi chọn phòng và xác nhận thông tin, bạn sẽ được chuyển đến trang thanh toán bảo mật của VNPay.",
          "Giao dịch thành công sẽ nhận email xác nhận trong vòng 5 phút.",
        ],
      },
      {
        subtitle: "Thanh toán tại quầy",
        items: [
          "Chấp nhận tiền mặt VNĐ tại tất cả chi nhánh Ba.Li Homestay.",
          "Áp dụng cho đặt phòng trực tiếp tại lễ tân, không áp dụng cho đặt phòng trực tuyến đã xác nhận.",
          "Biên lai được in và giao tận tay khách hàng ngay sau khi thanh toán.",
        ],
      },
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "2. Bảo mật giao dịch",
    content: [
      {
        subtitle: "Tiêu chuẩn bảo mật",
        items: [
          "Toàn bộ dữ liệu thanh toán được mã hóa bằng SSL/TLS 256-bit trong quá trình truyền tải.",
          "VNPay tuân thủ tiêu chuẩn PCI DSS — chuẩn bảo mật quốc tế dành riêng cho xử lý thẻ thanh toán.",
          "Ba.Li Homestay không lưu trữ số thẻ, mã CVV hay thông tin nhạy cảm của thẻ ngân hàng.",
          "Xác thực OTP qua SMS được áp dụng cho mọi giao dịch thẻ nội địa và quốc tế.",
        ],
      },
      {
        subtitle: "Phòng chống gian lận",
        items: [
          "Hệ thống tự động phát hiện giao dịch bất thường và tạm giữ để xác minh.",
          "Nếu phát hiện giao dịch đáng ngờ, chúng tôi sẽ liên hệ xác minh trước khi xử lý đặt phòng.",
          "Mọi hành vi gian lận thanh toán sẽ bị báo cáo với cơ quan có thẩm quyền.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    icon: Receipt,
    title: "3. Giá và hóa đơn",
    content: [
      {
        subtitle: "Chính sách giá",
        items: [
          "Tất cả giá hiển thị trên website đã bao gồm thuế VAT 8% theo quy định hiện hành.",
          "Giá được niêm yết theo đơn vị VNĐ. Không phát sinh phụ phí ẩn ngoài những gì đã thể hiện trước khi xác nhận.",
          "Giá đặt phòng có thể thay đổi theo thời điểm (mùa lễ, cuối tuần) nhưng được khóa tại thời điểm xác nhận đặt phòng thành công.",
          "Ưu đãi và mã giảm giá được áp dụng trước thuế và hiển thị rõ trong màn hình xác nhận.",
        ],
      },
      {
        subtitle: "Hóa đơn và chứng từ",
        items: [
          "Email xác nhận đặt phòng kèm chi tiết giao dịch được gửi tự động sau khi thanh toán thành công.",
          "Hóa đơn VAT điện tử được xuất theo yêu cầu trong vòng 3 ngày làm việc — liên hệ admin@bachlinh.com.vn kèm mã đặt phòng và thông tin công ty.",
          "Lịch sử giao dịch có thể tra cứu trong mục Đặt phòng của tài khoản.",
        ],
      },
    ],
  },
  {
    id: "processing",
    icon: Clock,
    title: "4. Thời gian xử lý giao dịch",
    content: [
      {
        subtitle: "Thời gian xác nhận",
        items: [
          "Thanh toán thẻ nội địa / quốc tế: xác nhận tức thì sau khi ngân hàng phê duyệt.",
          "Ví MoMo, ZaloPay, VNPay QR: xác nhận tức thì.",
          "Trong một số trường hợp hệ thống tải cao, xác nhận có thể mất tối đa 15 phút — nếu quá thời gian này mà chưa nhận email, vui lòng kiểm tra mục Spam hoặc liên hệ hotline.",
        ],
      },
      {
        subtitle: "Trường hợp giao dịch bị treo",
        items: [
          "Tiền bị trừ nhưng chưa nhận xác nhận: vui lòng chờ 30 phút, hệ thống tự động đối soát với VNPay.",
          "Sau 30 phút vẫn chưa xác nhận: liên hệ hotline 0931 708 256 kèm screenshot giao dịch ngân hàng.",
          "Nếu xác nhận tiền đã trừ nhưng đặt phòng không thành công: hoàn tiền 100% trong vòng 1–3 ngày làm việc.",
        ],
      },
    ],
  },
  {
    id: "refund",
    icon: RefreshCw,
    title: "5. Chính sách hoàn tiền",
    content: [
      {
        subtitle: "Điều kiện hoàn tiền",
        items: [
          "Hủy trước 48 giờ so với giờ check-in dự kiến: hoàn 100% giá trị đặt phòng.",
          "Hủy trong vòng 24–48 giờ trước giờ check-in: hoàn 50% giá trị đặt phòng.",
          "Hủy dưới 24 giờ hoặc không đến (no-show): không hoàn tiền.",
          "Đặt phòng theo giờ: hủy trước 2 giờ so với giờ nhận phòng được hoàn 100%.",
          "Trường hợp Ba.Li Homestay chủ động hủy (sự cố phòng, bảo trì khẩn cấp): hoàn 100% và bồi thường thêm voucher 10% cho lần đặt tiếp theo.",
        ],
      },
      {
        subtitle: "Thời gian hoàn tiền",
        items: [
          "Thẻ ngân hàng nội địa: 3–5 ngày làm việc kể từ khi yêu cầu được xử lý.",
          "Thẻ quốc tế Visa/Mastercard: 7–15 ngày làm việc (tùy ngân hàng phát hành).",
          "Ví MoMo, ZaloPay: 1–3 ngày làm việc.",
          "Phí giao dịch ngân hàng phát sinh từ phía ngân hàng (nếu có) không thuộc trách nhiệm của Ba.Li Homestay.",
        ],
      },
      {
        subtitle: "Quy trình yêu cầu hoàn tiền",
        items: [
          "Bước 1: Đăng nhập tài khoản → Lịch sử đặt phòng → Chọn đặt phòng → Yêu cầu hủy.",
          "Bước 2: Hệ thống xác nhận điều kiện hoàn tiền và gửi email thông báo.",
          "Bước 3: Tiền được hoàn về phương thức thanh toán ban đầu trong thời hạn trên.",
          "Bước 4: Email xác nhận hoàn tiền thành công được gửi khi giao dịch hoàn tất.",
        ],
      },
    ],
  },
  {
    id: "failure",
    icon: AlertCircle,
    title: "6. Xử lý thanh toán thất bại",
    content: [
      {
        subtitle: "Nguyên nhân thường gặp",
        items: [
          "Số dư tài khoản / ví không đủ để thực hiện giao dịch.",
          "Thẻ chưa được kích hoạt tính năng thanh toán trực tuyến (liên hệ ngân hàng để mở).",
          "Nhập sai mã OTP hoặc OTP hết hiệu lực (OTP có giá trị trong 3 phút).",
          "Kết nối mạng không ổn định trong quá trình chuyển trang thanh toán.",
          "Thẻ đã hết hạn hoặc bị khóa tạm thời bởi ngân hàng.",
        ],
      },
      {
        subtitle: "Hướng xử lý",
        items: [
          "Kiểm tra lại thông tin thẻ, số dư và trạng thái kích hoạt thanh toán online.",
          "Thử lại bằng phương thức thanh toán khác (VNPay QR, ví điện tử).",
          "Xóa cache trình duyệt hoặc thử trên trình duyệt khác nếu gặp lỗi kỹ thuật.",
          "Nếu vẫn thất bại sau 3 lần thử, liên hệ hotline 0931 708 256 để được hỗ trợ đặt phòng thủ công.",
        ],
      },
    ],
  },
  {
    id: "currency",
    icon: Banknote,
    title: "7. Đơn vị tiền tệ và tỷ giá",
    content: [
      {
        subtitle: "Giao dịch trong nước",
        items: [
          "Tất cả giá trên website được niêm yết bằng Việt Nam Đồng (VNĐ).",
          "Giao dịch thẻ nội địa và ví điện tử Việt Nam được thanh toán trực tiếp bằng VNĐ.",
        ],
      },
      {
        subtitle: "Giao dịch thẻ quốc tế",
        items: [
          "Thẻ Visa/Mastercard quốc tế được tính theo tỷ giá USD/VNĐ tại thời điểm giao dịch do ngân hàng phát hành quy định.",
          "Ba.Li Homestay không chịu trách nhiệm về chênh lệch tỷ giá giữa thời điểm đặt phòng và thời điểm ngân hàng ghi nợ.",
          "Một số ngân hàng quốc tế có thể thu thêm phí chuyển đổi ngoại tệ — vui lòng kiểm tra với ngân hàng phát hành thẻ của bạn.",
        ],
      },
    ],
  },
];

export default async function PaymentPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{
          background:
            "linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
            style={{ border: "1px solid white" }}
          />
          <div
            className="absolute -top-16 -right-16 w-[320px] h-[320px] rounded-full opacity-[0.08]"
            style={{ border: "1px solid white" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, white 0, white 1px, transparent 0, transparent 60px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Thanh toán
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chính sách
            <br />
            <span style={{ color: "rgba(147,205,255,1)" }}>thanh toán</span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Mọi giao dịch tại Ba.Li Homestay được xử lý qua cổng thanh toán
            VNPay được Ngân hàng Nhà nước cấp phép — minh bạch, an toàn và
            không phát sinh chi phí ẩn.
          </p>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Cập nhật lần cuối: 18 tháng 6 năm 2025
          </p>
        </div>
      </section>

      {/* ── PAYMENT METHODS GRID ─────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Phương thức thanh toán được chấp nhận
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {METHODS.map(({ name, desc, icon }) => (
              <div
                key={name}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span className="text-2xl leading-none shrink-0">{icon}</span>
                <div>
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-tight"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY BADGES ──────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Lock,
                label: "SSL 256-bit",
                desc: "Mã hóa toàn bộ dữ liệu",
              },
              {
                icon: ShieldCheck,
                label: "PCI DSS",
                desc: "Chuẩn bảo mật thẻ quốc tế",
              },
              {
                icon: Receipt,
                label: "Không phí ẩn",
                desc: "Giá niêm yết đã bao gồm VAT",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(26,74,122,0.08)" }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS ────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mục lục
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {SECTIONS.map(({ id, icon: Icon, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[--color-surface]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--color-primary)" }}
                />
                {title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-14">
          {SECTIONS.map(({ id, icon: Icon, title, content }) => (
            <div key={id} id={id} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(26,74,122,0.10), rgba(46,111,170,0.05))",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <h2
                  className="text-xl md:text-2xl font-bold pt-1.5"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {title}
                </h2>
              </div>

              <div className="ml-[60px] space-y-6">
                {content.map((block) => (
                  <div key={block.subtitle}>
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {block.subtitle}
                    </p>
                    <ul className="space-y-2.5">
                      {block.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: "var(--color-primary-light)",
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div
                className="mt-14 h-px"
                style={{ background: "var(--color-border)" }}
              />
            </div>
          ))}

          {/* Contact block */}
          <div
            id="support"
            className="scroll-mt-24 rounded-3xl p-8 md:p-10"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(26,74,122,0.10), rgba(46,111,170,0.05))",
                }}
              >
                <Phone
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <h2
                className="text-xl md:text-2xl font-bold pt-1.5"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Hỗ trợ thanh toán
              </h2>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 ml-[60px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Gặp sự cố giao dịch hoặc cần hỗ trợ về hoàn tiền? Đội ngũ của
              chúng tôi sẵn sàng 24/7:
            </p>

            <div className="ml-[60px] grid sm:grid-cols-2 gap-4">
              <a
                href="tel:0931708256"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(26,74,122,0.08)" }}
                >
                  <Phone
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Hotline 24/7
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    0931 708 256
                  </p>
                </div>
              </a>

              <a
                href="mailto:admin@bachlinh.com.vn"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(26,74,122,0.08)" }}
                >
                  <Mail
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Email hỗ trợ
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    admin@bachlinh.com.vn
                  </p>
                </div>
              </a>
            </div>

            <p
              className="mt-5 ml-[60px] text-xs leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              Khi liên hệ về sự cố thanh toán, vui lòng chuẩn bị:{" "}
              <strong>mã đặt phòng</strong>, <strong>số tiền giao dịch</strong>{" "}
              và <strong>screenshot thông báo từ ngân hàng/ví</strong> để được
              hỗ trợ nhanh nhất.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-4 sm:px-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{ border: "1px solid white" }}
          />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Đặt phòng ngay hôm nay
          </h2>
          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            Thanh toán an toàn, giá minh bạch — không lo bất ngờ khi check-in.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rooms">
              <Button
                className="h-11 px-7 font-semibold rounded-xl text-sm gap-2 text-white border-0"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Tìm phòng <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/terms">
              <Button
                variant="ghost"
                className="h-11 px-7 font-semibold rounded-xl text-sm"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                Điều khoản sử dụng
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
