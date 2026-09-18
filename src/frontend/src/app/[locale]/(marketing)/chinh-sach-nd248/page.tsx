import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Scale,
  MessageSquare,
  Receipt,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  Phone,
  Mail,
  ArrowRight,
  FileText,
  ListOrdered,
  Video,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { securityLicenseText } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Chính sách hoạt động theo NĐ 248 | Ba.Li Homestay",
  description:
    "Chính sách hoạt động của Ba.Li Homestay theo Nghị định 248/2026/NĐ-CP — quyền và nghĩa vụ các bên, khiếu nại, giá, phương thức cung cấp dịch vụ, chấm dứt dịch vụ và hoàn tiền.",
};

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = [
  {
    id: "rights-obligations",
    icon: Scale,
    title: "I. Quyền và nghĩa vụ của các bên (Điều 6)",
    content: [
      {
        subtitle: "Ba.Li Homestay có trách nhiệm",
        items: [
          "Ban hành và công khai điều kiện hoạt động, điều kiện giao dịch.",
          "Công khai tiêu chuẩn dịch vụ và quy trình đặt phòng.",
          "Thu phí theo chính sách giá đã công khai.",
          "Thông tin đầy đủ về khuyến mại trước khi khách đặt phòng.",
          "Bảo đảm vận hành an toàn, ổn định.",
          "Quy định các trường hợp tạm ngừng, hạn chế tài khoản.",
          "Bảo đảm an toàn thông tin cá nhân của khách hàng.",
          "Tiếp nhận và giải quyết phản ánh, khiếu nại.",
          "Giám sát, ngăn chặn hành vi vi phạm và phối hợp cung cấp thông tin cho cơ quan nhà nước có thẩm quyền.",
        ],
      },
      {
        subtitle: "Khách hàng có quyền và nghĩa vụ",
        items: [
          "Được cung cấp thông tin đầy đủ, chính xác về dịch vụ.",
          "Được bảo vệ quyền lợi người tiêu dùng và dữ liệu cá nhân.",
          "Được lựa chọn phòng và phương thức thanh toán.",
          "Được giải quyết phản ánh, khiếu nại.",
          "Có nghĩa vụ cung cấp thông tin chính xác, thanh toán đầy đủ đúng hạn.",
          "Tuân thủ pháp luật và điều kiện giao dịch của nền tảng.",
        ],
      },
    ],
  },
  {
    id: "complaints",
    icon: MessageSquare,
    title: "II. Tiếp nhận và giải quyết phản ánh, khiếu nại (Điều 7)",
    content: [
      {
        subtitle: "Kênh tiếp nhận",
        items: [
          "Biểu mẫu trực tuyến tại trang Liên hệ — hoạt động 24/7, cấp mã phiếu để khách tự tra cứu tiến độ, không cần đăng nhập.",
          "Email admin@bachlinh.com.vn.",
          "Hotline 0931 708 256 (trực 24/7).",
          "Trực tiếp tại quầy lễ tân chi nhánh trong giờ hành chính.",
        ],
      },
      {
        subtitle: "Quy trình xử lý",
        items: [
          "Bước 1: Khách gửi phản ánh kèm mã đặt phòng (nếu có).",
          "Bước 2: Ba.Li tiếp nhận, cấp mã phiếu và phản hồi ban đầu trong thời hạn công bố theo từng nhóm vấn đề.",
          "Bước 3: Xác minh và đề xuất phương án xử lý.",
          "Bước 4: Thực hiện và thông báo kết quả bằng văn bản qua email.",
          "Chi tiết từng bước, thời hạn theo loại vấn đề và công cụ hỗ trợ được công bố đầy đủ tại trang Liên hệ.",
        ],
      },
      {
        subtitle: "Thời hạn và biện pháp hỗ trợ",
        items: [
          "Phản hồi ban đầu trong 24–72 giờ tùy nhóm vấn đề.",
          "Giải quyết trong 02–07 ngày làm việc tùy nhóm vấn đề; riêng yêu cầu về dữ liệu cá nhân tối đa 30 ngày. Bảng thời hạn chi tiết công bố tại trang Liên hệ.",
          "Nếu không đạt thỏa thuận, hai bên có thể hòa giải qua tổ chức bảo vệ quyền lợi người tiêu dùng, hoặc giải quyết tại Tòa án nhân dân có thẩm quyền tại TP Hà Nội.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    icon: Receipt,
    title: "III. Chính sách về giá (Điều 8)",
    content: [
      {
        subtitle: "Nguyên tắc niêm yết giá",
        items: [
          "Giá niêm yết bằng VNĐ và đã bao gồm thuế GTGT theo quy định hiện hành.",
          "Không phát sinh phụ phí ẩn ngoài các khoản đã hiển thị trước khi khách xác nhận đặt phòng.",
          "Giá có thể thay đổi theo thời điểm (mùa lễ, cuối tuần) nhưng được khóa tại thời điểm đặt phòng thành công.",
          "Trường hợp thay đổi biểu phí dịch vụ, Ba.Li Homestay công khai trên nền tảng ít nhất 20 ngày trước thời điểm áp dụng.",
        ],
      },
      {
        subtitle: "Chi phí dịch vụ dành cho người bán (Điều 8 khoản b)",
        items: [
          "Không áp dụng. Ba.Li Homestay tự vận hành và tự cung cấp toàn bộ dịch vụ lưu trú trên nền tảng, không có người bán thứ ba tham gia.",
          "Nền tảng không thu phí mở tài khoản, phí duy trì tài khoản, phí xử lý đơn hàng hay bất kỳ loại phí dịch vụ nào đối với người bán.",
          "Nếu trong tương lai nền tảng cho phép người bán thứ ba tham gia, biểu giá dịch vụ, cách tính từng loại phí và thời điểm áp dụng sẽ được công bố tại mục này ít nhất 20 ngày trước khi áp dụng.",
        ],
      },
    ],
  },
  {
    id: "service-delivery",
    icon: KeyRound,
    title: "IV. Phương thức cung cấp dịch vụ (Điều 15 — đặt trước, sử dụng sau)",
    content: [
      {
        subtitle: "Quy trình đặt và nhận phòng",
        items: [
          "Đặt phòng được xác nhận sau khi thanh toán thành công qua VNPay; email xác nhận kèm mã đặt phòng gửi trong vòng 5 phút.",
          "Khách xuất trình mã đặt phòng và giấy tờ tùy thân khi nhận phòng tại chi nhánh đã chọn.",
          "Thời hạn sử dụng: đặt theo giờ tối thiểu 2 giờ/lượt; đặt theo ngày nhận phòng từ 14:00, trả phòng trước 12:00.",
          "Điều kiện đổi/hủy: liên hệ hotline trước giờ nhận phòng, hỗ trợ tùy tình trạng phòng trống.",
        ],
      },
      {
        subtitle: "Chi phí phát sinh và hạn chế sử dụng",
        items: [
          "Phụ thu khách vượt số lượng đăng ký, phí vệ sinh/hư hỏng, phạt hút thuốc nơi cấm 500.000 VNĐ.",
          "Không dùng cơ sở vào mục đích trái pháp luật.",
          "Giữ trật tự sau 22:00.",
          "Không mang thú cưng khi chưa được chấp thuận.",
        ],
      },
    ],
  },
  {
    id: "termination",
    icon: RefreshCw,
    title: "V. Chấm dứt dịch vụ và hoàn tiền (Điều 16)",
    content: [
      {
        subtitle: "Các trường hợp chấm dứt",
        items: [
          "Khách chủ động hủy.",
          "Ba.Li chấm dứt khi khách vi phạm nghiêm trọng.",
          "Sự kiện bất khả kháng.",
        ],
      },
      {
        subtitle: "Thời điểm chấm dứt hiệu lực và quy trình",
        items: [
          "Khi khách là bên chấm dứt: hợp đồng chấm dứt hiệu lực tại thời điểm Ba.Li Homestay nhận được thông báo hủy hợp lệ qua tài khoản, hotline hoặc email.",
          "Khách gửi yêu cầu hủy qua mục \"Lịch sử đặt phòng\" hoặc hotline/email; Ba.Li xác nhận và phản hồi trong 02 ngày làm việc.",
        ],
      },
      {
        subtitle: "Điều kiện và cách thức hoàn tiền",
        items: [
          "Hủy trước 48 giờ: hoàn 100%.",
          "Hủy trong 24–48 giờ: hoàn 50%.",
          "Hủy dưới 24 giờ hoặc không đến (no-show): không hoàn tiền.",
          "Đặt theo giờ hủy trước 2 giờ: hoàn 100%.",
          "Ba.Li chủ động hủy: hoàn 100% kèm voucher.",
          "Tiền hoàn về đúng phương thức thanh toán ban đầu, theo mốc thời gian tại trang Chính sách thanh toán.",
        ],
      },
    ],
  },
  {
    id: "display-ranking",
    icon: ListOrdered,
    title: "VI. Chính sách về ưu tiên hiển thị (Điều 11)",
    content: [
      {
        subtitle: "Cách kết quả được lọc",
        items: [
          "Từ khóa và bộ lọc khách chọn quyết định phòng nào xuất hiện: tên phòng, mô tả, chi nhánh, loại hình đặt (theo giờ / theo ngày) và khoảng giá.",
          "Phòng đã kín lịch trong khung thời gian khách tìm bị loại khỏi kết quả, không hiển thị.",
          "Khách có thể tự lọc riêng nhóm \"Phòng nổi bật\" hoặc \"Khách yêu thích\" — đây là bộ lọc do khách chủ động bật, không phải yếu tố tự động đẩy phòng lên trên.",
        ],
      },
      {
        subtitle: "Cách kết quả được sắp xếp",
        items: [
          "Mặc định, danh sách phòng sắp xếp theo thời điểm đăng, phòng đăng gần đây nhất hiển thị trước.",
          "Khách có thể tự đổi tiêu chí sắp xếp (ví dụ theo giá) và thứ tự tăng/giảm tại trang Tìm phòng. Khi đó thứ tự hoàn toàn theo lựa chọn của khách.",
          "Ngoài hai cơ chế trên, nền tảng không áp dụng thuật toán xếp hạng nào khác.",
        ],
      },
      {
        subtitle: "Những yếu tố KHÔNG ảnh hưởng đến thứ tự hiển thị",
        items: [
          "Không có hình thức trả phí để được ưu tiên hiển thị. Ba.Li Homestay không bán vị trí hiển thị cho bất kỳ bên nào.",
          "Không cá nhân hóa thứ tự theo lịch sử tìm kiếm hoặc lịch sử giao dịch của từng người dùng.",
          "Điểm đánh giá, số lượt đánh giá và số đơn đặt thành công không tác động đến thứ tự hiển thị.",
          "Không phân biệt theo địa phương, quốc gia hay vùng lãnh thổ của người truy cập.",
          "Không phân biệt theo phương thức thanh toán mà khách lựa chọn.",
        ],
      },
      {
        subtitle: "Minh bạch",
        items: [
          "Khách hàng có thể tự sắp xếp và lọc kết quả theo giá, sức chứa, tiện ích và chi nhánh tại trang Tìm phòng.",
          "Thông tin tại mục này mô tả đúng cơ chế đang vận hành trên nền tảng.",
          "Khi thay đổi tiêu chí ưu tiên hiển thị, Ba.Li Homestay cập nhật công khai tại mục này.",
        ],
      },
    ],
  },
  {
    id: "livestream",
    icon: Video,
    title: "VII. Quy chế hoạt động livestream bán hàng (Điều 12)",
    content: [
      {
        subtitle: "Không áp dụng",
        items: [
          "Ba.Li Homestay không cung cấp và không cho phép chức năng phát trực tuyến (livestream) bán hàng trên nền tảng.",
          "Nền tảng không có tài khoản người livestream bán hàng, không có công cụ phát trực tuyến và không đặt đường dẫn mua hàng trong nội dung phát trực tuyến.",
          "Trường hợp triển khai chức năng này trong tương lai, Ba.Li Homestay sẽ ban hành và công khai quy chế livestream đầy đủ theo Điều 12 Nghị định 248/2026/NĐ-CP trước khi đưa vào sử dụng, bao gồm quyền và nghĩa vụ các bên, quy trình định danh xác thực điện tử, điều kiện mở tài khoản, các trường hợp dừng phát và cơ chế tiếp nhận khiếu nại của người xem.",
        ],
      },
    ],
  },
  {
    id: "goods-delivery",
    icon: PackageX,
    title: "VIII. Giao hàng, đổi trả hàng hóa (Điều 13, Điều 14)",
    content: [
      {
        subtitle: "Không áp dụng",
        items: [
          "Ba.Li Homestay kinh doanh dịch vụ lưu trú, không kinh doanh hàng hóa hữu hình. Nền tảng không có hoạt động giao nhận hàng hóa nên không phát sinh chính sách giao hàng theo Điều 13 và chính sách đổi trả hàng theo Điều 14.",
          "Nội dung tương ứng đối với dịch vụ được công bố tại mục IV (Phương thức cung cấp dịch vụ — Điều 15) và mục V (Chấm dứt dịch vụ và hoàn tiền — Điều 16) của trang này.",
          "Các khoản phụ thu tại chỗ (đồ ăn, đồ uống, vật dụng bổ sung) được tính trực tiếp tại chi nhánh khi khách sử dụng, không phát sinh vận chuyển.",
        ],
      },
    ],
  },
  {
    id: "conditional-industry",
    icon: ShieldAlert,
    title: "IX. Ngành nghề kinh doanh có điều kiện",
    content: [
      {
        subtitle: "An ninh, trật tự",
        items: [
          "Kinh doanh dịch vụ lưu trú thuộc ngành nghề đầu tư kinh doanh có điều kiện về an ninh, trật tự theo Nghị định 96/2016/NĐ-CP.",
          securityLicenseText(),
          "Cơ sở lưu trú thực hiện khai báo tạm trú cho khách theo quy định của Luật Cư trú; khách xuất trình giấy tờ tùy thân hợp lệ khi nhận phòng.",
        ],
      },
    ],
  },
];

export default async function Nd248PolicyPage({ params }: Props) {
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
            Chính sách hoạt động
            <br />
            <span style={{ color: "rgba(147,205,255,1)" }}>
              theo Nghị định 248/2026/NĐ-CP
            </span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Công khai quyền và nghĩa vụ các bên, phương thức khiếu nại, chính
            sách giá, phương thức cung cấp dịch vụ và chính sách chấm dứt dịch
            vụ, hoàn tiền của Ba.Li Homestay.
          </p>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Cập nhật lần cuối: 18 tháng 9 năm 2026
          </p>
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
                Liên hệ & hỗ trợ
              </h2>
            </div>

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
              <Link href="/contact">
                <Button
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{ background: "var(--color-primary)", color: "white" }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Gửi phản ánh trực tuyến
                </Button>
              </Link>
              <Link href="/terms">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Điều khoản sử dụng
                </Button>
              </Link>
              <Link href="/payment-policy">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Chính sách thanh toán
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
