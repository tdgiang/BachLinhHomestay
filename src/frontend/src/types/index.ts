// ─── Enums ─────────────────────────────────────────────────────────────────

export type RoomStatus = 'active' | 'maintenance' | 'inactive';
export type BookingType = 'hourly' | 'daily';
export type PaymentMethod = 'vnpay' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed_amount';
export type UserRole = 'customer' | 'admin';

// ─── Domain types ───────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  nameEn: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  description: string | null;
  descriptionEn: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomImage {
  id: string;
  roomId: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export type AmenityCategory = 'basic' | 'entertainment' | 'convenience' | 'safety';

export interface Amenity {
  id: string;
  name: string;
  nameEn: string | null;
  icon: string | null;
  category: AmenityCategory;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAmenity {
  id: string;
  roomId: string;
  amenityId: string;
  isFeatured: boolean;
  isFree: boolean;
  price: number | null;
  createdAt: string;
  amenity: Amenity;
}

export interface TimeSlotSuggestion {
  id: string;
  roomId: string;
  label: string;
  startTime: string;
  endTime: string;
  priceOverride: number | null;
  priceOriginal: number | null;
  dayOfWeek: number | null;
  isActive: boolean;
}

export interface CancellationPolicy {
  id: string;
  roomId: string;
  daysBefore: number;
  refundPercentage: number;
  description: string | null;
  descriptionEn: string | null;
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  roomNumber: string;
  floor: number | null;
  capacity: number;
  pricePerHour: number;
  pricePerHourOriginal: number | null;
  pricePerDay: number;
  pricePerDayOriginal: number | null;
  minHours: number;
  extraHourPrice: number | null;
  extraPersonPrice: number | null;
  checkInTime: string;
  checkOutTime: string;
  allowHourly: boolean;
  status: RoomStatus;
  isFeatured: boolean;
  isGuestFavorite: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations (included in detail responses)
  branch?: Branch;
  images?: RoomImage[];
  amenities?: RoomAmenity[];
  timeSlotSuggestions?: TimeSlotSuggestion[];
  cancellationPolicies?: CancellationPolicy[];
  reviews?: Review[];
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minBookingAmount: number;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  gateway: PaymentMethod;
  gatewayTxnId: string | null;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  roomId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  user?: Pick<User, 'id' | 'fullName'>;
  room?: { id: string; name: string; roomNumber?: string };
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  userId: string | null;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  numHours: number | null;
  numGuests: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  guestNote: string | null;
  baseAmount: number;
  discountAmount: number;
  extraAmount: number;
  totalAmount: number;
  voucherId: string | null;
  voucherCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  cancelReason: string | null;
  refundAmount: number | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  room?: Pick<Room, 'id' | 'name' | 'roomNumber' | 'checkInTime' | 'checkOutTime'> & {
    branch?: Pick<Branch, 'id' | 'name' | 'address' | 'city'>;
    images?: Pick<RoomImage, 'url' | 'isCover'>[];
  };
  payment?: Payment;
  review?: Review;
}

// ─── API request/response types ─────────────────────────────────────────────

export interface CreateBookingDto {
  roomId: string;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  numHours?: number;
  numGuests: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestNote?: string;
  voucherCode?: string;
  paymentMethod: PaymentMethod;
}

export interface ValidateVoucherDto {
  code: string;
  bookingAmount: number;
}

export interface ValidateVoucherResult {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

export interface RoomAvailability {
  available: boolean;
  conflicts: Array<{ checkIn: string; checkOut: string }>;
}

export interface RoomQuery {
  branchId?: string;
  type?: BookingType;
  checkIn?: string;
  checkOut?: string;
  priceMax?: number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

// ─── Report types ────────────────────────────────────────────────────────────

export interface RevenueData {
  date?: string;
  month?: number;
  year?: number;
  revenue: number;
  bookingCount: number;
}

export interface BookingSummary {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  todayBookings: number;
  yesterdayBookings: number;
  occupancyRate: number;
}

// ─── Shared UI types ─────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

// ─── NextAuth session augmentation ──────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
    accessToken: string;
    error?: 'RefreshAccessTokenError';
  }
}
