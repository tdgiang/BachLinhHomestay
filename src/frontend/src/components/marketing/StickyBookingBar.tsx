"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { RatingStars } from "@/components/shared/RatingStars";

interface StickyBookingBarProps {
  roomId: string;
  pricePerHour: number;
  pricePerHourOriginal: number | null;
  pricePerDay: number;
  pricePerDayOriginal: number | null;
  allowHourly: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export function StickyBookingBar({
  roomId,
  pricePerHour,
  pricePerHourOriginal,
  pricePerDay,
  pricePerDayOriginal,
  allowHourly,
  ratingAvg,
  ratingCount,
}: StickyBookingBarProps) {
  const t = useTranslations("room");
  const router = useRouter();

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 border-t px-4 py-3 flex items-center justify-between gap-4 backdrop-blur-sm lg:hidden"
      style={{
        background: "rgba(255,255,255,0.96)",
        borderColor: "var(--color-border)",
      }}
    >
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          {allowHourly && (
            <PriceDisplay
              price={pricePerHour}
              originalPrice={pricePerHourOriginal}
              suffix={t("perHour")}
              size="sm"
            />
          )}
          <PriceDisplay
            price={pricePerDay}
            originalPrice={pricePerDayOriginal}
            suffix={t("perDay")}
            size="sm"
          />
        </div>
        <RatingStars rating={ratingAvg} count={ratingCount} size="sm" />
      </div>
      <Button
        onClick={() => router.push(`/booking/${roomId}`)}
        className="text-white font-semibold shrink-0"
        style={{ background: "var(--color-primary)" }}
      >
        {t("bookNow")}
      </Button>
    </div>
  );
}
