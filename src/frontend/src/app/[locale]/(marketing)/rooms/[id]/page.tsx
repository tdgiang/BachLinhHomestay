import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Users, Layers, Key, Clock, CalendarDays, ShieldCheck } from 'lucide-react';
import { ImageCarousel } from '@/components/shared/ImageCarousel';
import { GoogleMapsEmbed } from '@/components/shared/GoogleMapsEmbed';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { RatingStars } from '@/components/shared/RatingStars';
import { AmenitiesSection } from '@/components/marketing/AmenitiesSection';
import { DescriptionSection } from '@/components/marketing/DescriptionSection';
import { ReviewsSection } from '@/components/marketing/ReviewsSection';
import { TimeSlotsSection } from '@/components/marketing/TimeSlotsSection';
import { StickyBookingBar } from '@/components/marketing/StickyBookingBar';
import { apiClient } from '@/lib/api-client';

// ISR: revalidate room detail every hour
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const room = await apiClient.getRoom(id);
    return {
      title: room.name,
      description: room.description ?? undefined,
      openGraph: {
        title: room.name,
        description: room.description ?? undefined,
        images: room.images?.[0]?.url ? [room.images[0].url] : [],
      },
    };
  } catch {
    return { title: 'Phòng không tìm thấy' };
  }
}

export default async function RoomDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [room, t, tr] = await Promise.all([
    apiClient.getRoom(id).catch(() => null),
    getTranslations('room'),
    getTranslations('room'),
  ]);

  if (!room) notFound();

  const images = room.images ?? [];
  const amenities = room.amenities ?? [];
  const cancellationPolicies = room.cancellationPolicies ?? [];
  const reviewsRes = await apiClient.getReviews(id, 1);

  const branch = room.branch;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: room.name,
    description: room.description ?? undefined,
    image: images[0]?.url,
    priceRange: `${room.pricePerHour.toLocaleString('vi-VN')}₫/giờ`,
    aggregateRating: room.ratingCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: room.ratingAvg.toFixed(1),
          reviewCount: room.ratingCount,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
    address: branch
      ? {
          '@type': 'PostalAddress',
          streetAddress: branch.address,
          addressLocality: branch.city,
          addressCountry: 'VN',
        }
      : undefined,
    url: `${siteUrl}/${locale}/rooms/${id}`,
  };

  return (
    <div className="pt-16 pb-24 lg:pb-8 min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── 1. Image Carousel ── */}
      <div className="max-w-5xl mx-auto px-0 md:px-4 md:pt-4">
        <ImageCarousel
          images={images}
          alt={room.name}
          aspectRatio="16/9"
          className="md:rounded-[var(--radius-card)]"
          showCounter
          showArrows
          showDots
        />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 mt-6">
          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* ── 2. Title + specs ── */}
            <div>
              <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {room.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <RatingStars rating={room.ratingAvg} count={room.ratingCount} />
                {branch && (
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {branch.name} · {branch.city}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <Spec icon={<Users className="w-4 h-4" />} label={t('capacity', { count: room.capacity })} />
                {room.floor && <Spec icon={<Layers className="w-4 h-4" />} label={t('floor', { floor: room.floor })} />}
                <Spec icon={<Clock className="w-4 h-4" />} label={`Check-in ${room.checkInTime}`} />
                <Spec icon={<CalendarDays className="w-4 h-4" />} label={`Check-out ${room.checkOutTime}`} />
              </div>
            </div>

            <Divider />

            {/* ── 3. Host info ── */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                O
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
                  Host: Ocean Blue Homestay
                </p>
                <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                  Superhost · Kinh nghiệm 5+ năm
                </p>
              </div>
            </div>

            <Divider />

            {/* ── 4. Highlights ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <HighlightCard
                icon={<Key className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />}
                title={t('selfCheckin')}
                desc={t('selfCheckinDesc')}
              />
              {room.allowHourly && (
                <HighlightCard
                  icon={<Clock className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />}
                  title={t('hourlyBooking')}
                  desc={t('hourlyBookingDesc')}
                />
              )}
              <HighlightCard
                icon={<CalendarDays className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />}
                title={t('checkTime')}
                desc={`${t('checkinTime', { time: room.checkInTime })} · ${t('checkoutTime', { time: room.checkOutTime })}`}
              />
            </div>

            <Divider />

            {/* ── 5. Amenities ── */}
            {amenities.length > 0 && (
              <>
                <AmenitiesSection amenities={amenities} />
                <Divider />
              </>
            )}

            {/* ── 6. Description ── */}
            {room.description && (
              <>
                <DescriptionSection description={room.description} />
                <Divider />
              </>
            )}

            {/* ── 7. Map ── */}
            {branch?.latitude && branch?.longitude && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {t('location')}
                  </h2>
                  <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {branch.address}
                  </p>
                  <GoogleMapsEmbed
                    latitude={branch.latitude}
                    longitude={branch.longitude}
                    label={branch.name}
                  />
                </div>
                <Divider />
              </>
            )}

            {/* ── 8. Policies ── */}
            {cancellationPolicies.length > 0 && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {t('cancellationPolicy')}
                  </h2>
                  <div className="space-y-2">
                    {cancellationPolicies
                      .sort((a, b) => b.daysBefore - a.daysBefore)
                      .map((policy) => (
                        <div key={policy.id} className="flex items-start gap-3 text-sm">
                          <ShieldCheck
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: policy.refundPercentage > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                          />
                          <p style={{ color: 'var(--color-text-primary)' }}>
                            {policy.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
                <Divider />
              </>
            )}

            {/* ── 9. Reviews ── */}
            <ReviewsSection
              roomId={id}
              initialReviews={reviewsRes.items}
              initialTotal={reviewsRes.meta.total}
            />

            <Divider />

            {/* ── 10. Time Slots ── */}
            {room.allowHourly && <TimeSlotsSection roomId={id} />}
          </div>

          {/* ── Right column: Booking card (desktop) ── */}
          <aside className="hidden lg:block">
            <div
              className="sticky top-24 rounded-2xl border p-6 shadow-sm"
              style={{ borderColor: 'var(--color-border)', background: 'white' }}
            >
              <div className="mb-4">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  {room.allowHourly && (
                    <PriceDisplay
                      price={room.pricePerHour}
                      originalPrice={room.pricePerHourOriginal}
                      suffix={t('perHour')}
                      size="md"
                    />
                  )}
                </div>
                <PriceDisplay
                  price={room.pricePerDay}
                  originalPrice={room.pricePerDayOriginal}
                  suffix={t('perDay')}
                  size="md"
                />
                <RatingStars rating={room.ratingAvg} count={room.ratingCount} className="mt-2" />
              </div>

              <a
                href={`/booking/${room.id}`}
                className="block w-full text-center py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}
              >
                {t('bookNow')}
              </a>

              <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                Chưa bị tính phí
              </p>

              {room.allowHourly && room.minHours > 0 && (
                <p className="text-xs text-center mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('minHours', { hours: room.minHours })}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── 11. Sticky booking bar (mobile) ── */}
      <StickyBookingBar
        roomId={room.id}
        pricePerHour={room.pricePerHour}
        pricePerHourOriginal={room.pricePerHourOriginal}
        pricePerDay={room.pricePerDay}
        pricePerDayOriginal={room.pricePerDayOriginal}
        allowHourly={room.allowHourly}
        ratingAvg={room.ratingAvg}
        ratingCount={room.ratingCount}
      />
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: 'var(--color-border)' }} />;
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      {icon}
      {label}
    </span>
  );
}

function HighlightCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {desc}
        </p>
      </div>
    </div>
  );
}
