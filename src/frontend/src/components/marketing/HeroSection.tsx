"use client";

import { useState } from "react";
import Image from "next/image";
import { format, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const HERO_BG_IMAGE = "/images/hero-bg.jpg";
import {
  HeroFormField,
  HeroSelect,
  HeroDatePicker,
} from "@/components/marketing/hero/HeroFormControls";
import {
  Search,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Sparkles,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Branch } from "@/types";

const TIME_OPTIONS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

interface HeroSectionProps {
  branches: Branch[];
}

export function HeroSection({ branches }: HeroSectionProps) {
  const t = useTranslations("home");
  const router = useRouter();

  const [tab, setTab] = useState<"hourly" | "daily">("hourly");
  const [branchId, setBranchId] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [time, setTime] = useState("14:00");
  const [numHours, setNumHours] = useState(2);

  const today = startOfDay(new Date());

  const handleCheckInChange = (date: Date | undefined) => {
    setCheckInDate(date);
    if (date && checkOutDate && checkOutDate < date) {
      setCheckOutDate(undefined);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (branchId) params.set("branchId", branchId);
    params.set("type", tab);

    if (checkInDate) {
      const dateStr = format(checkInDate, "yyyy-MM-dd");
      if (tab === "hourly") {
        const checkInMs = new Date(`${dateStr}T${time}:00`).getTime();
        params.set("checkIn", new Date(checkInMs).toISOString());
        params.set(
          "checkOut",
          new Date(checkInMs + numHours * 3600000).toISOString(),
        );
      } else {
        params.set("checkIn", new Date(`${dateStr}T14:00:00`).toISOString());
        if (checkOutDate) {
          params.set(
            "checkOut",
            new Date(
              `${format(checkOutDate, "yyyy-MM-dd")}T11:00:00`,
            ).toISOString(),
          );
        }
      }
    }

    router.push(`/?${params.toString()}#rooms`);
  };

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  const timeOptions = TIME_OPTIONS.map((opt) => ({ value: opt, label: opt }));

  const stats = [
    { value: "20+", label: t("statRooms"), icon: Sparkles },
    { value: "5+", label: t("statBranches"), icon: MapPin },
    { value: "4.8", label: t("statRating"), icon: Star },
  ];

  return (
    <section className="relative overflow-hidden min-h-[560px] md:min-h-[620px] grain-overlay">
      {/* Background image */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src={HERO_BG_IMAGE}
          alt=""
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,31,51,0.72) 0%, rgba(26,74,122,0.45) 28%, rgba(237,242,248,0.82) 58%, rgba(245,248,252,0.96) 100%)",
          }}
        />
        <div className="absolute inset-0 hero-grid-pattern opacity-[0.15]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-14 md:pt-32 md:pb-20 text-center">
        <div
          className="hero-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-sm"
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            color: "#fff",
          }}
        >
          <Waves className="w-3.5 h-3.5 opacity-90" />
          {t("heroEyebrow")}
        </div>

        <h1
          className="hero-fade-up-d1 text-[2rem] sm:text-5xl lg:text-[3.35rem] font-bold mb-5 leading-[1.1] tracking-tight  drop-shadow-md"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span style={{ color: "var(--color-secondary)" }} className="block">
            {t("heroTitle")}
          </span>
        </h1>

        <p
          style={{ color: "var(--color-text-note)" }}
          className="hero-fade-up-d2 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto text-white drop-shadow-sm"
        >
          {t("heroSubtitle")}
        </p>

        <form
          className="hero-fade-up-d3 hero-search-card rounded-2xl overflow-hidden text-left max-w-3xl mx-auto shadow-xl"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          {/* Booking type tabs */}
          <div className="p-3 pb-0">
            <div
              className="flex gap-1 p-1 rounded-xl"
              role="tablist"
              style={{ background: "var(--color-surface-alt)" }}
            >
              {(["hourly", "daily"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={tab === type}
                  onClick={() => setTab(type)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
                    tab === type
                      ? "text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                  )}
                  style={
                    tab === type
                      ? {
                          background:
                            "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-light) 100%)",
                        }
                      : undefined
                  }
                >
                  {type === "hourly" ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <CalendarDays className="w-3.5 h-3.5" />
                  )}
                  {type === "hourly" ? t("tabHourly") : t("tabDaily")}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "grid grid-cols-1 border-y my-3 mx-3 rounded-xl overflow-hidden",
              tab === "hourly"
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-3",
            )}
            style={{
              borderColor: "var(--color-border)",
              background: "rgba(255,255,255,0.6)",
            }}
          >
            <HeroFormField
              label={t("selectBranch")}
              icon={<MapPin className="w-3.5 h-3.5" />}
            >
              <HeroSelect
                id="branch"
                value={branchId}
                onValueChange={setBranchId}
                placeholder={t("selectBranch")}
                options={branchOptions}
                allowEmpty
                isSearchable
                noOptionsMessage={t("noBranches")}
              />
            </HeroFormField>

            <HeroFormField
              label={t("date")}
              icon={<CalendarDays className="w-3.5 h-3.5" />}
              bordered
            >
              <HeroDatePicker
                value={checkInDate}
                onChange={handleCheckInChange}
                placeholder={t("pickDate")}
                minDate={today}
              />
            </HeroFormField>

            {tab === "hourly" ? (
              <>
                <HeroFormField
                  label={t("time")}
                  icon={<Clock className="w-3.5 h-3.5" />}
                  bordered
                >
                  <HeroSelect
                    id="check-in-time"
                    value={time}
                    onValueChange={setTime}
                    placeholder={t("time")}
                    options={timeOptions}
                  />
                </HeroFormField>

                <HeroFormField
                  label={t("numHours")}
                  icon={<Clock className="w-3.5 h-3.5" />}
                  bordered
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNumHours((n) => Math.max(1, n - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--color-surface-alt)]"
                      style={{ color: "var(--color-primary)" }}
                      aria-label={t("decreaseHours")}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span
                      className="flex-1 font-bold text-center text-sm tabular-nums"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {numHours}h
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumHours((n) => Math.min(24, n + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--color-surface-alt)]"
                      style={{ color: "var(--color-primary)" }}
                      aria-label={t("increaseHours")}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </HeroFormField>
              </>
            ) : (
              <HeroFormField
                label={t("checkout")}
                icon={<CalendarDays className="w-3.5 h-3.5" />}
                bordered
              >
                <HeroDatePicker
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  placeholder={t("pickCheckout")}
                  minDate={checkInDate ?? today}
                  disabled={!checkInDate}
                />
              </HeroFormField>
            )}
          </div>

          <div className="px-4 pb-4">
            <Button
              type="submit"
              className="w-full h-12 font-semibold rounded-xl gap-2 text-white border-0 cursor-pointer transition-all duration-200 hover:brightness-105 hover:shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 45%, var(--color-primary-light) 100%)",
                boxShadow: "0 8px 28px rgba(26, 74, 122, 0.3)",
              }}
            >
              <Search className="w-4 h-4" />
              {t("searchButton")}
            </Button>
          </div>
        </form>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 px-2 sm:px-4 py-3 rounded-xl transition-shadow hover:shadow-md"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Icon
                className="w-4 h-4 mb-1"
                style={{ color: "var(--color-primary-light)" }}
              />
              <span
                className="text-base sm:text-lg font-bold tabular-nums"
                style={{ color: "var(--color-primary)" }}
              >
                {value}
              </span>
              <span
                className="text-[10px] sm:text-xs text-center leading-tight"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave divider */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden
      >
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 md:h-12"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48L60 40C120 32 240 16 360 10.7C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 26.7C1200 26.7 1320 21.3 1380 18.7L1440 16V48H0Z"
            fill="var(--color-surface)"
          />
        </svg>
      </div>
    </section>
  );
}
