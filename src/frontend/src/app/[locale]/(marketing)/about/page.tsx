import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  Waves, MapPin, Users, Star, Award, Heart,
  Clock, Shield, ArrowRight, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Về chúng tôi' };

type Props = { params: Promise<{ locale: string }> };

const STATS = [
  { value: '20+', label: 'Phòng nghỉ', sub: 'khắp miền Trung' },
  { value: '3',   label: 'Thành phố', sub: 'Đà Nẵng · Đà Lạt · Phú Quốc' },
  { value: '4.9', label: 'Điểm đánh giá', sub: 'trung bình từ khách hàng' },
  { value: '5K+', label: 'Lượt khách', sub: 'đã lưu trú thành công' },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Tận tâm phục vụ',
    desc: 'Mỗi khách lưu trú là một người thân. Đội ngũ luôn sẵn sàng 24/7 để đảm bảo trải nghiệm hoàn hảo nhất.',
  },
  {
    icon: Shield,
    title: 'Minh bạch & Tin cậy',
    desc: 'Giá niêm yết rõ ràng, không phát sinh chi phí ẩn. Đặt phòng và thanh toán được bảo mật tuyệt đối.',
  },
  {
    icon: Clock,
    title: 'Linh hoạt theo bạn',
    desc: 'Đặt theo giờ hay theo ngày đều được. Chính sách hủy linh động — chúng tôi hiểu kế hoạch có thể thay đổi.',
  },
  {
    icon: Award,
    title: 'Chất lượng nhất quán',
    desc: 'Từ Đà Nẵng đến Phú Quốc, mỗi phòng đều đạt tiêu chuẩn kiểm định nghiêm ngặt trước khi đón khách.',
  },
];

const BRANCHES = [
  {
    city: 'TP. Hồ Chí Minh',
    name: 'Sài Gòn Central',
    address: '28 Bùi Viện, Quận 1',
    desc: 'Giữa trung tâm phố Tây sôi động, cách Bến Thành 10 phút đi bộ.',
    rooms: 3,
    img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
  },
  {
    city: 'Đà Lạt',
    name: 'Đà Lạt Highland',
    address: '15 Huỳnh Thúc Kháng, P. 9',
    desc: 'Đồi thông yên bình, view thung lũng, không khí mát lành quanh năm.',
    rooms: 3,
    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80',
  },
  {
    city: 'Phú Quốc',
    name: 'Phú Quốc Beachside',
    address: '68 Trần Hưng Đạo, Dương Tơ',
    desc: 'Sát biển Dương Tơ trong xanh, hồ bơi vô cực nhìn ra đại dương.',
    rooms: 3,
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  },
];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ background: 'var(--color-surface)' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[480px] md:min-h-[540px] flex items-center"
        style={{
          background: 'linear-gradient(135deg, #0F2D50 0%, #1A4A7A 45%, #2E6FAA 100%)',
        }}
      >
        {/* Decorative wave rings */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
            style={{ border: '1px solid white' }}
          />
          <div
            className="absolute -top-20 -right-20 w-[360px] h-[360px] rounded-full opacity-[0.08]"
            style={{ border: '1px solid white' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.04]"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 1px, transparent 0, transparent 60px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              <Waves className="w-3.5 h-3.5" />
              Ocean Blue Homestay
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-[3.2rem] font-bold leading-[1.08] tracking-tight text-white mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Nơi mỗi
              <br />
              <span style={{ color: 'rgba(147,205,255,1)' }}>khoảnh khắc</span>
              <br />
              đều đáng nhớ
            </h1>
            <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Từ cà phê sáng nhìn ra biển Phú Quốc đến chiều tà trong lành giữa đồi thông Đà Lạt —
              Ocean Blue mang đến không gian nghỉ dưỡng đúng nghĩa, mọi lúc bạn cần.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rooms">
                <Button
                  className="h-11 px-6 font-semibold rounded-xl gap-2 text-sm text-white border-0"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Khám phá phòng <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  className="h-11 px-6 font-semibold rounded-xl text-sm"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Liên hệ chúng tôi
                </Button>
              </Link>
            </div>
          </div>

          {/* Image collage */}
          <div className="hidden lg:block relative h-[340px]">
            <img
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=80"
              alt="Ocean Blue Homestay"
              className="absolute right-0 top-0 w-[68%] h-[75%] object-cover rounded-2xl"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            />
            <img
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80"
              alt="Phòng nghỉ Đà Lạt"
              className="absolute left-0 bottom-0 w-[52%] h-[60%] object-cover rounded-2xl"
              style={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '3px solid rgba(255,255,255,0.15)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ '--tw-divide-color': 'var(--color-border)' } as React.CSSProperties}>
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="px-6 py-8 md:py-10 text-center">
                <p
                  className="text-4xl md:text-5xl font-bold mb-1 tabular-nums"
                  style={{
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {value}
                </p>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80"
              alt="Câu chuyện Ocean Blue"
              className="w-full h-[420px] md:h-[500px] object-cover rounded-3xl"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            />
            {/* Floating badge */}
            <div
              className="absolute -bottom-5 -right-4 md:-right-8 flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                background: 'white',
                boxShadow: '0 8px 32px rgba(26,74,122,0.14)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
              >
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>4.9 / 5.0</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>5,000+ đánh giá</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-primary-light)' }}
            >
              Câu chuyện của chúng tôi
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight mb-6"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Sinh ra từ tình yêu với biển và con người
            </h2>
            <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <p>
                Ocean Blue Homestay ra đời từ một niềm tin đơn giản: <strong style={{ color: 'var(--color-text-primary)' }}>mỗi người xứng đáng có những khoảnh khắc nghỉ ngơi thực sự</strong> — không ồn ào, không vội vã, không lo lắng.
              </p>
              <p>
                Chúng tôi bắt đầu với một căn phòng nhỏ ở Đà Nẵng, nơi hướng thẳng ra biển Mỹ Khê. Từ sự đón nhận nồng nhiệt của khách lưu trú, Ocean Blue dần mở rộng sang Đà Lạt và Phú Quốc — mang theo cùng một triết lý: <em>chất lượng không thỏa hiệp, giá cả không bất ngờ</em>.
              </p>
              <p>
                Ngày nay, với hơn 20 phòng tại 3 thành phố, chúng tôi phục vụ hàng nghìn lượt khách mỗi năm — từ những cặp đôi tìm góc riêng tư, gia đình tìm kỳ nghỉ ý nghĩa, đến những bạn trẻ cần không gian yên tĩnh làm việc xa nhà.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary-light)' }}>
              Giá trị cốt lõi
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Những điều chúng tôi cam kết
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <article
                key={title}
                className="group relative p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-7 right-7 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))' }}
                />
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: `linear-gradient(145deg, rgba(26,74,122,${0.08 + i * 0.02}) 0%, rgba(46,111,170,${0.04 + i * 0.01}) 100%)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="text-[15px] font-bold mb-2.5" style={{ color: 'var(--color-text-primary)' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANCHES ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-primary-light)' }}>
                Hệ thống chi nhánh
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                3 thành phố, 1 tiêu chuẩn
              </h2>
            </div>
            <Link href="/rooms">
              <Button
                variant="outline"
                className="shrink-0 rounded-xl gap-2 font-semibold h-10"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
              >
                Xem tất cả phòng <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {BRANCHES.map(({ city, name, address, desc, rooms, img }) => (
              <article
                key={name}
                className="group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(15,45,80,0.5) 0%, transparent 60%)' }}
                  />
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-white text-xs font-medium">{city}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 bg-white">
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {name}
                  </h3>
                  <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin className="w-3 h-3 shrink-0" />{address}
                  </p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {desc}
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(26,74,122,0.07)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Users className="w-3 h-3" />
                    {rooms} phòng
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMITMENT BAND ──────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center"
            style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {[
              { icon: Clock, title: 'Check-in 24/7', desc: 'Đến bất cứ lúc nào, chúng tôi luôn sẵn sàng đón bạn.' },
              { icon: Shield, title: 'Đảm bảo hoàn tiền', desc: 'Hủy trước 48 giờ — hoàn 100% không điều kiện.' },
              { icon: Phone, title: 'Hỗ trợ trực tiếp', desc: 'Gọi hotline hoặc nhắn tin — phản hồi dưới 5 phút.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(145deg, rgba(26,74,122,0.1), rgba(46,111,170,0.06))' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-32 px-4 sm:px-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05]"
            style={{ border: '1px solid white' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.07]"
            style={{ border: '1px solid white' }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <Waves className="w-3.5 h-3.5" />
            Bắt đầu ngay hôm nay
          </div>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Kỳ nghỉ hoàn hảo của bạn
            <br />
            đang chờ ở đây
          </h2>
          <p className="text-base md:text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Hơn 20 phòng tại 3 thành phố biển đảo đẹp nhất Việt Nam.
            Đặt ngay, nhận ưu đãi sớm.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rooms">
              <Button
                className="h-12 px-8 font-bold rounded-xl text-sm gap-2 text-white border-0"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                Tìm phòng ngay <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="ghost"
                className="h-12 px-8 font-semibold rounded-xl text-sm"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Tư vấn miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
