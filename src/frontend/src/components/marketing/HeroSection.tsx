"use client";

import { useState } from "react";
import Image from "next/image";
import { format, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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

const HERO_BG_IMAGE = "/images/hero-bg.jpg";

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
      const checkIn =
        tab === "hourly" ? `${dateStr}T${time}:00` : `${dateStr}T14:00:00`;
      params.set("checkIn", checkIn);
    }
    if (tab === "daily" && checkOutDate) {
      params.set("checkOut", `${format(checkOutDate, "yyyy-MM-dd")}T11:00:00`);
    }
    if (tab === "hourly") params.set("numHours", String(numHours));
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
    <section className="relative overflow-hidden hero-mesh grain-overlay min-h-[min(100vh,920px)]">
      {/* Background photo */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src={HERO_BG_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 hero-bg-overlay" />
      </div>

      <div
        className="absolute inset-0 z-1 hero-grid-pattern pointer-events-none opacity-40"
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div
          className="warm-blob absolute -top-24 -right-20 w-130 h-130 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 42%, transparent 72%)",
          }}
        />
        <div
          className="warm-blob-delay absolute -bottom-28 -left-24 w-105 h-105 rounded-full opacity-24"
          style={{
            background:
              "radial-gradient(circle at 55% 55%, rgba(255, 255, 255, 0.18) 0%, transparent 68%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-32 md:pb-20 text-center">
        <div
          className="hero-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-sm"
          style={{
            background: "rgba(255, 255, 255, 0.16)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            color: "#fff",
          }}
        >
          <Waves className="w-3.5 h-3.5 opacity-90" />
          {t("heroEyebrow")}
        </div>

        <h1
          className="hero-fade-up-d1 text-[2rem] sm:text-5xl lg:text-[3.35rem] font-bold mb-5 leading-[1.1] tracking-tight text-white drop-shadow-md"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="block">{t("heroTitle")}</span>
        </h1>

        <p className="hero-fade-up-d2 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto text-white/90">
          {t("heroSubtitle")}
        </p>

        <form
          className="hero-fade-up-d3 hero-search-card rounded-[28px] overflow-hidden text-left max-w-4xl mx-auto border border-white/20 bg-white/85 shadow-[0_32px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          {/* Booking type tabs */}
          <div className="p-3 pb-0">
            <div
              className="flex gap-1 p-1 rounded-2xl"
              role="tablist"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              {(["hourly", "daily"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={tab === type}
                  onClick={() => setTab(type)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                    tab === type
                      ? "text-white shadow-lg"
                      : "text-(--color-text-secondary) hover:text-(--color-text-primary)",
                  )}
                  style={
                    tab === type
                      ? {
                          background:
                            "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-light) 100%)",
                        }
                      : { background: "transparent" }
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-t-0 my-3 mx-3 rounded-b-[28px] overflow-hidden"
            style={{
              borderColor: "var(--color-border)",
              background: "rgba(255,255,255,0.88)",
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-(--color-surface-alt)"
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-(--color-surface-alt)"
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
                className="sm:col-span-2"
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
              className="w-full h-14 font-semibold rounded-2xl gap-2 text-white border-0 cursor-pointer transition-all duration-200 hover:brightness-105 hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 45%, var(--color-primary-light) 100%)",
                boxShadow: "0 10px 30px rgba(26, 74, 122, 0.25)",
              }}
            >
              <Search className="w-4 h-4" />
              {t("searchButton")}
            </Button>
          </div>
        </form>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 px-4 py-4 rounded-3xl transition-shadow hover:shadow-lg"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.8)",
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
    </section>
  );
}
