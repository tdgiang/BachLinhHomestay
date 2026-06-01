"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  BedDouble,
  Calendar,
  Tag,
  BarChart2,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { APP_NAME, LOGO_SRC } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Chi nhánh", href: "/admin/branches", icon: MapPin },
  { label: "Phòng", href: "/admin/rooms", icon: BedDouble },
  { label: "Tiện ích", href: "/admin/amenities", icon: Package },
  { label: "Đặt phòng", href: "/admin/bookings", icon: Calendar },
  { label: "Voucher", href: "/admin/vouchers", icon: Tag },
  { label: "Báo cáo", href: "/admin/reports", icon: BarChart2 },
  { label: "Đánh giá", href: "/admin/reviews", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#0D1B2A] text-white transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-5 border-b border-white/10",
          collapsed && "justify-center px-2",
        )}
      >
        <Image
          src={LOGO_SRC}
          alt={APP_NAME}
          width={32}
          height={32}
          className="h-8 w-8 object-contain shrink-0 rounded-lg bg-white p-0.5"
        />
        {!collapsed && (
          <span className="font-semibold text-sm leading-tight">
            Ba.Li
            <br />
            <span className="text-[#90E0EF] text-xs font-normal">Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const fullHref = `/${locale}${href}`;
          const active = pathname.startsWith(fullHref);
          return (
            <Link
              key={href}
              href={fullHref}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#00B4D8] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0 mx-2",
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-[#00B4D8] border-2 border-white flex items-center justify-center text-white hover:bg-[#0077B6] transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
