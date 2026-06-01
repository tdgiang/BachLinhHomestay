export const APP_NAME = 'Ba.Li Homestay';
export const LOGO_SRC = '/images/logo.png';
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const API_URL = process.env.API_INTERNAL_URL
  ?? process.env.NEXT_PUBLIC_API_URL
  ?? 'http://localhost:4000';

export const NAV_ITEMS = [
  // { label: 'Tìm phòng', href: '/rooms' },
  // { label: 'Về chúng tôi', href: '/about' },
  // { label: 'Liên hệ', href: '/contact' },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Chi nhánh', href: '/admin/branches', icon: 'MapPin' },
  { label: 'Phòng', href: '/admin/rooms', icon: 'BedDouble' },
  { label: 'Đặt phòng', href: '/admin/bookings', icon: 'Calendar' },
  { label: 'Voucher', href: '/admin/vouchers', icon: 'Tag' },
  { label: 'Báo cáo', href: '/admin/reports', icon: 'BarChart2' },
  { label: 'Đánh giá', href: '/admin/reviews', icon: 'Star' },
];

export const FILTER_CHIPS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Theo giờ', value: 'hourly' },
  { label: 'Theo ngày', value: 'daily' },
  { label: 'Dưới 500k', value: 'under500k' },
  { label: 'Ban công', value: 'balcony' },
  { label: 'Bồn tắm', value: 'bathtub' },
  { label: 'Duplex', value: 'duplex' },
  { label: 'Gác xép', value: 'loft' },
];

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};
