import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Bell,
  Trash2,
  Phone,
  Mail,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chính sách bảo vệ thông tin cá nhân | Ba.Li Homestay",
  description:
    "Chính sách bảo vệ thông tin cá nhân của Ba.Li Homestay — cam kết bảo mật dữ liệu khách hàng theo quy định pháp luật Việt Nam.",
};

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = [
  {
    id: "collect",
    icon: Database,
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      {
        subtitle: "Thông tin bạn cung cấp trực tiếp",
        items: [
          "Họ tên, số điện thoại, địa chỉ email khi đăng ký tài khoản",
          "Thông tin đặt phòng: ngày nhận phòng, ngày trả phòng, loại phòng",
          "Thông tin thanh toán (được mã hóa qua cổng VNPay — chúng tôi không lưu trữ thông tin thẻ)",
          "Nội dung phản hồi, đánh giá bạn để lại trên hệ thống",
        ],
      },
      {
        subtitle: "Thông tin thu thập tự động",
        items: [
          "Địa chỉ IP, loại trình duyệt, thiết bị truy cập",
          "Cookie phiên đăng nhập và cookie phân tích (có thể tắt trong cài đặt trình duyệt)",
          "Lịch sử đặt phòng và tương tác với hệ thống",
        ],
      },
    ],
  },
  {
    id: "use",
    icon: Eye,
    title: "2. Mục đích sử dụng thông tin",
    content: [
      {
        subtitle: "Cung cấp và cải thiện dịch vụ",
        items: [
          "Xử lý và xác nhận đặt phòng, gửi thông báo liên quan",
          "Hỗ trợ khách hàng và giải quyết khiếu nại",
          "Cải thiện tính năng và trải nghiệm sử dụng nền tảng",
        ],
      },
      {
        subtitle: "Liên lạc và marketing",
        items: [
          "Gửi xác nhận đặt phòng và nhắc nhở check-in/check-out qua email, SMS",
          "Thông báo ưu đãi, khuyến mãi (chỉ khi bạn đồng ý nhận)",
          "Khảo sát sự hài lòng sau kỳ lưu trú",
        ],
      },
      {
        subtitle: "Tuân thủ pháp lý",
        items: [
          "Lưu trữ hồ sơ giao dịch theo yêu cầu của cơ quan thuế và pháp luật",
          "Phòng chống gian lận và bảo vệ an toàn hệ thống",
        ],
      },
    ],
  },
  {
    id: "share",
    icon: UserCheck,
    title: "3. Chia sẻ thông tin với bên thứ ba",
    content: [
      {
        subtitle: "Chúng tôi có thể chia sẻ thông tin với",
        items: [
          "Cổng thanh toán VNPay để xử lý giao dịch tài chính",
          "Nhà cung cấp dịch vụ email/SMS hỗ trợ gửi thông báo (dữ liệu được ký hợp đồng bảo mật)",
          "Cơ quan nhà nước có thẩm quyền khi có yêu cầu bằng văn bản theo quy định pháp luật",
        ],
      },
      {
        subtitle: "Chúng tôi KHÔNG bao giờ",
        items: [
          "Bán, cho thuê hoặc trao đổi thông tin cá nhân với bên thứ ba vì mục đích thương mại",
          "Chia sẻ thông tin với đối tác quảng cáo không liên quan đến dịch vụ của bạn",
        ],
      },
    ],
  },
  {
    id: "storage",
    icon: Lock,
    title: "4. Bảo mật và lưu trữ dữ liệu",
    content: [
      {
        subtitle: "Biện pháp bảo mật kỹ thuật",
        items: [
          "Mã hóa SSL/TLS cho toàn bộ dữ liệu truyền tải",
          "Mật khẩu được băm bằng thuật toán bcrypt — chúng tôi không thể đọc mật khẩu của bạn",
          "Hệ thống tường lửa và giám sát xâm nhập 24/7",
          "Sao lưu dữ liệu định kỳ theo tiêu chuẩn bảo mật",
        ],
      },
      {
        subtitle: "Thời gian lưu trữ",
        items: [
          "Thông tin tài khoản: trong suốt thời gian tài khoản còn hoạt động",
          "Lịch sử đặt phòng: 5 năm kể từ ngày giao dịch (theo quy định kế toán)",
          "Log hệ thống: tối đa 12 tháng",
          "Dữ liệu sẽ được xóa an toàn sau khi hết thời hạn lưu trữ",
        ],
      },
    ],
  },
  {
    id: "rights",
    icon: Shield,
    title: "5. Quyền của bạn đối với dữ liệu cá nhân",
    content: [
      {
        subtitle: "Bạn có quyền",
        items: [
          "Truy cập và xem toàn bộ thông tin cá nhân chúng tôi đang lưu trữ",
          "Yêu cầu chỉnh sửa thông tin không chính xác hoặc lỗi thời",
          "Yêu cầu xóa tài khoản và dữ liệu cá nhân (trừ dữ liệu pháp lý bắt buộc)",
          "Từ chối nhận email marketing bất kỳ lúc nào qua link hủy đăng ký",
          "Phản đối việc xử lý dữ liệu trong trường hợp cụ thể",
          "Nhận bản sao dữ liệu của bạn theo định dạng có thể đọc được",
        ],
      },
    ],
  },
  {
    id: "cookies",
    icon: Bell,
    title: "6. Cookie và công nghệ theo dõi",
    content: [
      {
        subtitle: "Các loại cookie chúng tôi sử dụng",
        items: [
          "Cookie cần thiết: duy trì phiên đăng nhập và giỏ đặt phòng (không thể tắt)",
          "Cookie phân tích: đo lường lưu lượng truy cập ẩn danh để cải thiện dịch vụ",
          "Cookie tùy chọn: lưu ngôn ngữ, giao diện ưa thích",
        ],
      },
      {
        subtitle: "Kiểm soát cookie",
        items: [
          "Bạn có thể tắt cookie phân tích và tùy chọn trong cài đặt trình duyệt",
          "Tắt cookie cần thiết có thể ảnh hưởng đến chức năng đăng nhập và đặt phòng",
        ],
      },
    ],
  },
  {
    id: "delete",
    icon: Trash2,
    title: "7. Xóa tài khoản và dữ liệu",
    content: [
      {
        subtitle: "Quy trình xóa dữ liệu",
        items: [
          "Gửi yêu cầu qua email admin@bachlinh.com.vn với tiêu đề “Yêu cầu xóa dữ liệu”",
          "Chúng tôi xác minh danh tính và xử lý trong vòng 7–14 ngày làm việc",
          "Dữ liệu giao dịch tài chính được giữ lại theo đúng thời hạn pháp lý",
          "Bạn sẽ nhận xác nhận qua email sau khi hoàn tất",
        ],
      },
    ],
  },
];

export default async function PrivacyPage({ params }: Props) {
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
            <FileText className="w-3.5 h-3.5" />
            Chính sách
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chính sách bảo vệ
            <br />
            <span style={{ color: "rgba(147,205,255,1)" }}>
              thông tin cá nhân
            </span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Ba.Li Homestay cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của
            bạn theo đúng quy định Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá
            nhân tại Việt Nam.
          </p>

          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Cập nhật lần cuối: 18 tháng 6 năm 2025
          </p>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS ────────────────────────────────────────── */}
      <section className="bg-white border-b" style={{ borderColor: "var(--color-border)" }}>
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
              {/* Section header */}
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

              {/* Sub-sections */}
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
                            style={{ background: "var(--color-primary-light)" }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div
                className="mt-14 h-px"
                style={{ background: "var(--color-border)" }}
              />
            </div>
          ))}

          {/* Contact section */}
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
                8. Liên hệ về quyền riêng tư
              </h2>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 ml-[60px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc muốn thực hiện quyền
              của mình về dữ liệu cá nhân, hãy liên hệ với chúng tôi qua:
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
                    Email bảo mật
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
                    Hotline hỗ trợ
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

            <p
              className="mt-5 ml-[60px] text-xs leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              Chúng tôi cam kết phản hồi trong vòng <strong>3 ngày làm việc</strong> kể từ khi
              nhận được yêu cầu hợp lệ. Đối với yêu cầu xóa dữ liệu phức tạp,
              thời gian xử lý có thể lên đến 14 ngày làm việc.
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
            Còn thắc mắc?
          </h2>
          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi về
            quyền riêng tư và bảo mật dữ liệu của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button
                className="h-11 px-7 font-semibold rounded-xl text-sm gap-2 text-white border-0"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Liên hệ chúng tôi <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/rooms">
              <Button
                variant="ghost"
                className="h-11 px-7 font-semibold rounded-xl text-sm"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                Khám phá phòng
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
