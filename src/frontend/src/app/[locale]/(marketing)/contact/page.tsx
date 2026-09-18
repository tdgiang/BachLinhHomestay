import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Scale,
} from 'lucide-react';
import {
  ComplaintForm,
  ComplaintTracker,
} from '@/components/marketing/ComplaintForm';
import { BRANCHES, COMPANY, COMPLAINT_SLA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Liên hệ & tiếp nhận phản ánh, khiếu nại | Ba.Li Homestay',
  description:
    'Gửi phản ánh, yêu cầu, khiếu nại trực tuyến tới Ba.Li Homestay. Công khai kênh tiếp nhận, trình tự xử lý và thời hạn giải quyết theo Điều 7 Nghị định 248/2026/NĐ-CP.',
};

type Props = { params: Promise<{ locale: string }> };

/** Điều 7a — các kênh tiếp nhận, trong đó có ít nhất một kênh trực tuyến. */
const CHANNELS = [
  {
    icon: Globe,
    label: 'Biểu mẫu trực tuyến',
    value: 'Ngay trên trang này — có mã phiếu để tra cứu tiến độ',
    note: 'Hoạt động 24/7',
  },
  {
    icon: Mail,
    label: 'Email',
    value: COMPANY.email,
    href: COMPANY.emailHref,
    note: 'Hoạt động 24/7',
  },
  {
    icon: Phone,
    label: 'Hotline',
    value: COMPANY.hotline,
    href: COMPANY.hotlineHref,
    note: 'Trực 24/7',
  },
  {
    icon: MapPin,
    label: 'Trực tiếp tại quầy lễ tân',
    value: BRANCHES[0].address,
    note: 'Trong giờ hành chính',
  },
];

/** Điều 7b — trình tự, thủ tục tiếp nhận và xử lý. */
const STEPS = [
  {
    step: '01',
    title: 'Khách hàng gửi phản ánh',
    body: 'Qua biểu mẫu trực tuyến, email, hotline hoặc trực tiếp tại quầy. Nêu rõ mã đặt phòng (nếu có), nội dung sự việc và đề nghị cụ thể.',
  },
  {
    step: '02',
    title: 'Ba.Li Homestay tiếp nhận',
    body: 'Hệ thống cấp ngay mã phiếu và hiển thị trên màn hình — vui lòng lưu lại mã này để tra cứu tiến độ. Bộ phận phụ trách liên hệ phản hồi ban đầu qua điện thoại hoặc email trong thời hạn công bố ở bảng dưới.',
  },
  {
    step: '03',
    title: 'Xác minh và đề xuất phương án',
    body: 'Bộ phận phụ trách đối chiếu dữ liệu đặt phòng, thanh toán, camera và ghi nhận tại chi nhánh, sau đó liên hệ khách để thống nhất phương án xử lý.',
  },
  {
    step: '04',
    title: 'Thực hiện và thông báo kết quả',
    body: 'Thực hiện phương án đã thống nhất (hoàn tiền, đổi phòng, bồi hoàn, cải thiện dịch vụ). Kết quả được ghi vào phiếu — khách xem bằng mã phiếu tại mục tra cứu — và được nhân viên thông báo lại qua điện thoại hoặc email.',
  },
];

/** Điều 7c — thời hạn phản hồi ban đầu và thời hạn giải quyết theo loại vấn đề. */
const SLA_ROWS = Object.values(COMPLAINT_SLA).map((s) => ({
  issue: s.label,
  initial: `${s.initialResponseHours} giờ`,
  resolve:
    s.resolutionDays >= 30
      ? `${s.resolutionDays} ngày`
      : `${String(s.resolutionDays).padStart(2, '0')} ngày làm việc`,
}));

/** Điều 7d — biện pháp, công cụ hỗ trợ giải quyết. */
const TOOLS = [
  'Mã phiếu khiếu nại và trang tra cứu tiến độ trực tuyến ngay trên website, hoạt động 24/7 không cần đăng nhập.',
  'Lịch sử đặt phòng và hóa đơn điện tử trong mục "Lịch sử đặt phòng" của tài khoản.',
  'Đối soát giao dịch với VNPay và ngân hàng phát hành thẻ đối với khiếu nại thanh toán.',
  'Hoàn tiền về đúng phương thức thanh toán ban đầu, hoặc bù voucher khi khách đồng ý.',
  'Lưu trữ toàn bộ hồ sơ phản ánh tối thiểu 02 năm để phục vụ tra cứu và kiểm tra của cơ quan nhà nước.',
  'Trường hợp không đạt thỏa thuận: hòa giải qua tổ chức bảo vệ quyền lợi người tiêu dùng, hoặc khởi kiện tại Tòa án nhân dân có thẩm quyền tại TP Hà Nội.',
];

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ background: 'var(--color-surface)' }}>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-24"
        style={{
          background:
            'linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)',
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Hỗ trợ trực tuyến
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Liên hệ & tiếp nhận
            <br />
            <span style={{ color: 'rgba(147,205,255,1)' }}>
              phản ánh, yêu cầu, khiếu nại
            </span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            Công khai theo Điều 7 Nghị định 248/2026/NĐ-CP: kênh tiếp nhận, trình
            tự xử lý, thời hạn phản hồi và các công cụ hỗ trợ giải quyết.
          </p>
        </div>
      </section>

      {/* ── KÊNH TIẾP NHẬN (Điều 7a) ─────────────────────────────────── */}
      <section className="py-14 md:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Kênh tiếp nhận
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Bạn có thể chọn bất kỳ kênh nào dưới đây. Kênh trực tuyến hoạt động
            24/7 và có mã phiếu để theo dõi tiến độ.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {CHANNELS.map(({ icon: Icon, label, value, href, note }) => {
              const inner = (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(26,74,122,0.08)' }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium mb-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {value}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {note}
                    </p>
                  </div>
                </>
              );

              const className =
                'flex items-start gap-3 p-5 rounded-2xl transition-all hover:-translate-y-0.5';
              const style = {
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              };

              return href ? (
                <a key={label} href={href} className={className} style={style}>
                  {inner}
                </a>
              ) : (
                <div key={label} className={className} style={style}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BIỂU MẪU + TRA CỨU ───────────────────────────────────────── */}
      <section
        className="py-14 md:py-16 px-4 sm:px-6"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div>
            <h2
              id="bieu-mau"
              className="text-2xl md:text-3xl font-bold mb-2 scroll-mt-24"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Gửi phản ánh trực tuyến
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Điền biểu mẫu dưới đây. Sau khi gửi, bạn nhận ngay mã phiếu để tra
              cứu tiến độ xử lý.
            </p>
            <ComplaintForm />
          </div>

          <div className="lg:sticky lg:top-24">
            <ComplaintTracker />
          </div>
        </div>
      </section>

      {/* ── QUY TRÌNH (Điều 7b) ──────────────────────────────────────── */}
      <section className="py-14 md:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Trình tự, thủ tục xử lý
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {STEPS.map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-2xl p-6"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  BƯỚC {step}
                </span>
                <p
                  className="text-base font-semibold mt-2 mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {title}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THỜI HẠN (Điều 7c) ───────────────────────────────────────── */}
      <section
        className="py-14 md:py-16 px-4 sm:px-6"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Thời hạn phản hồi và giải quyết
            </h2>
          </div>

          <div
            className="overflow-x-auto rounded-2xl"
            style={{ background: 'white', border: '1px solid var(--color-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  <th
                    className="text-left font-semibold px-5 py-3.5"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Loại vấn đề
                  </th>
                  <th
                    className="text-left font-semibold px-5 py-3.5 whitespace-nowrap"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Phản hồi ban đầu
                  </th>
                  <th
                    className="text-left font-semibold px-5 py-3.5"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Thời hạn giải quyết
                  </th>
                </tr>
              </thead>
              <tbody>
                {SLA_ROWS.map((row) => (
                  <tr
                    key={row.issue}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.issue}
                    </td>
                    <td
                      className="px-5 py-3.5 whitespace-nowrap font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {row.initial}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.resolve}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            Thời hạn tính theo ngày làm việc, không kể ngày nghỉ lễ theo quy định
            của pháp luật lao động.
          </p>
        </div>
      </section>

      {/* ── CÔNG CỤ HỖ TRỢ (Điều 7d) ─────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Biện pháp và công cụ hỗ trợ giải quyết
            </h2>
          </div>

          <ul className="space-y-3">
            {TOOLS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--color-primary-light)' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
