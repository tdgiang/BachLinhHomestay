import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  UserCheck,
  CreditCard,
  CalendarX,
  Star,
  AlertTriangle,
  Scale,
  RefreshCw,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Ba.Li Homestay",
  description:
    "Điều khoản sử dụng dịch vụ Ba.Li Homestay — quy định đặt phòng, thanh toán, hủy phòng và quyền lợi khách hàng.",
};

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = [
  {
    id: "general",
    icon: FileText,
    title: "1. Điều khoản chung",
    content: [
      {
        subtitle: "Phạm vi áp dụng",
        items: [
          "Các điều khoản này áp dụng cho toàn bộ người dùng truy cập và sử dụng dịch vụ đặt phòng trực tuyến tại website Ba.Li Homestay.",
          "Bằng việc đăng ký tài khoản hoặc thực hiện đặt phòng, bạn xác nhận đã đọc, hiểu và đồng ý ràng buộc bởi các điều khoản này.",
          "Ba.Li Homestay có quyền cập nhật điều khoản bất kỳ lúc nào. Thay đổi có hiệu lực ngay khi đăng tải trên website. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp thuận điều khoản mới.",
        ],
      },
      {
        subtitle: "Đối tượng sử dụng",
        items: [
          "Người dùng phải đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.",
          "Người dùng chịu trách nhiệm về tính chính xác của thông tin cá nhân cung cấp khi đăng ký.",
          "Mỗi người chỉ được tạo một tài khoản. Việc tạo nhiều tài khoản để lợi dụng ưu đãi là vi phạm điều khoản.",
        ],
      },
    ],
  },
  {
    id: "booking",
    icon: CalendarX,
    title: "2. Quy định đặt phòng",
    content: [
      {
        subtitle: "Quy trình đặt phòng",
        items: [
          "Đặt phòng được xác nhận sau khi thanh toán thành công qua cổng VNPay.",
          "Email xác nhận kèm mã đặt phòng sẽ được gửi trong vòng 5 phút sau khi giao dịch hoàn tất.",
          "Mỗi đặt phòng chỉ áp dụng cho số lượng khách đã đăng ký. Việc đưa thêm người vào phòng mà không thông báo có thể bị từ chối phục vụ.",
        ],
      },
      {
        subtitle: "Loại hình đặt phòng",
        items: [
          "Đặt theo giờ: tối thiểu 2 giờ, thanh toán theo số giờ thực tế sử dụng.",
          "Đặt theo ngày: tính từ 14:00 ngày nhận phòng đến 12:00 ngày trả phòng (có thể thay đổi theo từng chi nhánh).",
          "Check-in sớm hoặc trả phòng muộn có thể phát sinh phụ phí tùy theo tình trạng phòng, vui lòng liên hệ trước.",
        ],
      },
      {
        subtitle: "Điều kiện nhận phòng",
        items: [
          "Khách cần xuất trình CMND/CCCD hoặc hộ chiếu hợp lệ tại quầy lễ tân.",
          "Khách nước ngoài cần có hộ chiếu còn hiệu lực và visa phù hợp.",
          "Phòng sẽ được giữ tối đa 30 phút sau giờ check-in dự kiến nếu không có thông báo trước.",
        ],
      },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "3. Thanh toán",
    content: [
      {
        subtitle: "Phương thức thanh toán",
        items: [
          "Thanh toán trực tuyến qua cổng VNPay: thẻ ATM nội địa, thẻ Visa/Mastercard, ví điện tử (MoMo, ZaloPay, VNPay QR).",
          "Thanh toán tiền mặt trực tiếp tại quầy lễ tân chi nhánh (chỉ áp dụng cho đặt phòng tại chỗ).",
          "Tất cả giao dịch trực tuyến được mã hóa SSL và xử lý bởi VNPay — Ba.Li Homestay không lưu trữ thông tin thẻ của bạn.",
        ],
      },
      {
        subtitle: "Giá và phụ phí",
        items: [
          "Giá hiển thị trên website đã bao gồm thuế VAT 8%.",
          "Phụ phí dịch vụ (nếu có) sẽ được thông báo rõ ràng trước khi xác nhận đặt phòng.",
          "Ba.Li Homestay không thu bất kỳ khoản phí ẩn nào ngoài những gì đã niêm yết.",
          "Tỷ giá quy đổi cho khách nước ngoài theo tỷ giá ngân hàng tại thời điểm giao dịch.",
        ],
      },
    ],
  },
  {
    id: "cancellation",
    icon: CalendarX,
    title: "4. Hủy phòng và hoàn tiền",
    content: [
      {
        subtitle: "Chính sách hủy phòng",
        items: [
          "Hủy trước 48 giờ so với giờ check-in: hoàn 100% giá trị đặt phòng.",
          "Hủy trong vòng 24–48 giờ trước giờ check-in: hoàn 50% giá trị đặt phòng.",
          "Hủy dưới 24 giờ hoặc không đến (no-show): không hoàn tiền.",
          "Đặt phòng theo giờ: hủy trước 2 giờ so với giờ nhận phòng sẽ được hoàn 100%.",
        ],
      },
      {
        subtitle: "Quy trình hoàn tiền",
        items: [
          "Hoàn tiền được xử lý trong vòng 3–7 ngày làm việc kể từ khi yêu cầu được chấp nhận.",
          "Tiền hoàn trả về đúng phương thức thanh toán ban đầu.",
          "Phí giao dịch ngân hàng (nếu có) do bên ngân hàng thu, Ba.Li Homestay không chịu trách nhiệm.",
          "Trường hợp hủy do sự cố kỹ thuật từ phía Ba.Li Homestay: hoàn 100% và được ưu đãi đặt phòng lần sau.",
        ],
      },
      {
        subtitle: "Trường hợp bất khả kháng",
        items: [
          "Thiên tai, dịch bệnh, hoặc lệnh hành chính của cơ quan nhà nước ảnh hưởng đến việc lưu trú: hai bên thương lượng phương án phù hợp.",
          "Vui lòng liên hệ hotline trong vòng 24 giờ sau khi sự kiện bất khả kháng xảy ra.",
        ],
      },
    ],
  },
  {
    id: "conduct",
    icon: UserCheck,
    title: "5. Quy tắc ứng xử và sử dụng cơ sở",
    content: [
      {
        subtitle: "Khách lưu trú có trách nhiệm",
        items: [
          "Giữ gìn vệ sinh, trật tự và tôn trọng không gian chung, không gây ồn ào sau 22:00.",
          "Không đưa người lạ vào phòng khi chưa được đăng ký thêm khách.",
          "Không hút thuốc trong phòng và khu vực cấm hút thuốc (phạt 500.000 VNĐ nếu vi phạm).",
          "Không mang thú cưng vào cơ sở trừ khi được thông báo và chấp thuận trước.",
          "Không sử dụng cơ sở vào mục đích bất hợp pháp hoặc vi phạm thuần phong mỹ tục.",
        ],
      },
      {
        subtitle: "Bồi thường thiệt hại",
        items: [
          "Khách chịu trách nhiệm bồi thường toàn bộ thiệt hại do cố ý hoặc sơ suất gây ra đối với tài sản của cơ sở.",
          "Giá trị bồi thường dựa trên hóa đơn thực tế hoặc giá trị tài sản được định giá tại thời điểm xảy ra.",
          "Ba.Li Homestay có quyền yêu cầu khách rời khỏi cơ sở mà không hoàn tiền nếu vi phạm nghiêm trọng điều khoản.",
        ],
      },
    ],
  },
  {
    id: "reviews",
    icon: Star,
    title: "6. Đánh giá và nội dung người dùng",
    content: [
      {
        subtitle: "Quy định đánh giá",
        items: [
          "Chỉ khách đã hoàn thành lưu trú mới được để lại đánh giá.",
          "Đánh giá phải trung thực, khách quan và không chứa nội dung xúc phạm, phân biệt đối xử.",
          "Ba.Li Homestay có quyền ẩn hoặc xóa đánh giá vi phạm mà không cần thông báo trước.",
        ],
      },
      {
        subtitle: "Quyền sở hữu nội dung",
        items: [
          "Khi đăng nội dung (ảnh, bình luận), bạn cấp cho Ba.Li Homestay quyền sử dụng không độc quyền để hiển thị trên nền tảng.",
          "Bạn đảm bảo nội dung đăng tải không vi phạm quyền sở hữu trí tuệ của bên thứ ba.",
          "Chúng tôi không sử dụng nội dung của bạn cho mục đích thương mại ngoài việc vận hành dịch vụ.",
        ],
      },
    ],
  },
  {
    id: "liability",
    icon: AlertTriangle,
    title: "7. Giới hạn trách nhiệm",
    content: [
      {
        subtitle: "Ba.Li Homestay không chịu trách nhiệm về",
        items: [
          "Thiệt hại gián tiếp, mất mát dữ liệu hoặc lợi nhuận phát sinh từ việc sử dụng dịch vụ.",
          "Sự cố kỹ thuật ngoài tầm kiểm soát như mất điện, thiên tai, tấn công mạng từ bên thứ ba.",
          "Tài sản cá nhân để trong phòng ngoài két sắt được cung cấp (nếu có).",
          "Sự thay đổi về chính sách của bên thứ ba (ngân hàng, cổng thanh toán) ảnh hưởng đến giao dịch.",
        ],
      },
      {
        subtitle: "Giới hạn bồi thường",
        items: [
          "Trách nhiệm tối đa của Ba.Li Homestay trong mọi trường hợp không vượt quá giá trị đặt phòng mà khách đã thanh toán.",
          "Các tranh chấp vượt quá giới hạn này sẽ được giải quyết theo quy định của pháp luật Việt Nam.",
        ],
      },
    ],
  },
  {
    id: "dispute",
    icon: Scale,
    title: "8. Giải quyết tranh chấp",
    content: [
      {
        subtitle: "Quy trình khiếu nại",
        items: [
          "Bước 1: Liên hệ trực tiếp qua hotline hoặc email trong vòng 7 ngày kể từ khi phát sinh tranh chấp.",
          "Bước 2: Chúng tôi phản hồi và xử lý trong vòng 5 ngày làm việc.",
          "Bước 3: Nếu không đạt thỏa thuận, hai bên có thể yêu cầu hòa giải qua Hội bảo vệ người tiêu dùng.",
          "Bước 4: Trường hợp cuối cùng, tranh chấp được giải quyết tại Tòa án nhân dân có thẩm quyền tại Đà Nẵng.",
        ],
      },
      {
        subtitle: "Luật áp dụng",
        items: [
          "Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam.",
          "Luật Bảo vệ quyền lợi người tiêu dùng số 59/2010/QH12 và các văn bản hướng dẫn thi hành.",
          "Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân áp dụng song song với chính sách riêng tư của chúng tôi.",
        ],
      },
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "9. Cập nhật điều khoản",
    content: [
      {
        subtitle: "Thông báo thay đổi",
        items: [
          "Mọi thay đổi trọng yếu về điều khoản sẽ được thông báo qua email đăng ký ít nhất 7 ngày trước khi có hiệu lực.",
          "Thay đổi nhỏ (chính tả, cách diễn đạt không ảnh hưởng đến quyền lợi) có thể được áp dụng ngay.",
          "Lịch sử các phiên bản điều khoản được lưu trữ và cung cấp theo yêu cầu.",
        ],
      },
    ],
  },
];

export default async function TermsPage({ params }: Props) {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            Pháp lý
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Điều khoản
            <br />
            <span style={{ color: "rgba(147,205,255,1)" }}>sử dụng dịch vụ</span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng dịch vụ
            đặt phòng của Ba.Li Homestay. Việc đặt phòng đồng nghĩa với việc
            bạn chấp thuận toàn bộ nội dung này.
          </p>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Có hiệu lực từ: 01 tháng 01 năm 2025 &nbsp;·&nbsp; Cập nhật lần
            cuối: 18 tháng 6 năm 2025
          </p>
        </div>
      </section>

      {/* ── HIGHLIGHTS ───────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Tóm tắt quan trọng
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: CalendarX,
                label: "Hủy miễn phí",
                desc: "Trước 48 giờ, hoàn 100%",
              },
              {
                icon: CreditCard,
                label: "Không phí ẩn",
                desc: "Giá niêm yết bao gồm VAT",
              },
              {
                icon: ShieldCheck,
                label: "Thanh toán an toàn",
                desc: "Mã hóa SSL qua VNPay",
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
            id="contact"
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
                10. Liên hệ & hỗ trợ
              </h2>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 ml-[60px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Nếu bạn có thắc mắc về điều khoản sử dụng hoặc cần hỗ trợ liên
              quan đến đặt phòng, hãy liên hệ với chúng tôi:
            </p>

            <div className="ml-[60px] grid sm:grid-cols-2 gap-4">
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
            </div>

            <div className="ml-[60px] mt-5 flex flex-wrap gap-3">
              <Link href="/privacy">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Chính sách bảo mật
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Trang liên hệ
                </Button>
              </Link>
            </div>
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
            Sẵn sàng trải nghiệm?
          </h2>
          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            Chúng tôi cam kết minh bạch và đặt quyền lợi của bạn lên hàng đầu.
            Hãy đặt phòng và cảm nhận sự khác biệt của Ba.Li.
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
                Đặt phòng ngay <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="ghost"
                className="h-11 px-7 font-semibold rounded-xl text-sm"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                Liên hệ tư vấn
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
