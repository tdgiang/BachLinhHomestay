'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/branches':  'Chi nhánh',
  '/admin/rooms':     'Phòng',
  '/admin/bookings':  'Đặt phòng',
  '/admin/vouchers':  'Voucher',
  '/admin/reports':   'Báo cáo',
  '/admin/reviews':   'Đánh giá',
};

interface AdminTopbarProps {
  userName?: string;
}

export function AdminTopbar({ userName }: AdminTopbarProps) {
  const pathname = usePathname();

  const matchedKey = Object.keys(BREADCRUMB_MAP).find((k) => pathname.includes(k));
  const pageName = matchedKey ? BREADCRUMB_MAP[matchedKey] : 'Admin';

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div className="text-sm">
        <span className="text-gray-400">Admin</span>
        <span className="mx-1.5 text-gray-300">/</span>
        <span className="font-medium text-gray-800">{pageName}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-gray-500">
          <Bell size={18} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#00B4D8] flex items-center justify-center text-white text-xs font-bold">
              {userName ? userName[0].toUpperCase() : 'A'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {userName ?? 'Admin'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2 text-gray-600">
              <User size={14} /> Tài khoản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-500 focus:text-red-500"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={14} /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
