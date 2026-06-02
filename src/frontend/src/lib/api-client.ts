import { api } from './api';
import type {
  Amenity, Branch, Room, RoomImage, Booking, Voucher, Review,
  RoomQuery, RoomAvailability, TimeSlotSuggestion,
  CreateBookingDto, ValidateVoucherDto, ValidateVoucherResult,
  PaginatedResult, BookingSummary, RevenueData,
} from '@/types';
import {
  mockDelay, filterMockRooms, findMockRoom, validateMockVoucher,
  MOCK_BRANCHES, MOCK_BOOKINGS, MOCK_VOUCHERS, MOCK_REVIEWS,
} from './mock';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ─── Decimal coercion helpers ────────────────────────────────────────────────
// Prisma Decimal serializes as string in JSON; coerce back to number.

function n(v: unknown): number { return Number(v); }
function nn(v: unknown): number | null { return v == null ? null : Number(v); }

function coerceRoom(r: any): Room {
  return {
    ...r,
    pricePerHour:         n(r.pricePerHour),
    pricePerHourOriginal: nn(r.pricePerHourOriginal),
    pricePerDay:          n(r.pricePerDay),
    pricePerDayOriginal:  nn(r.pricePerDayOriginal),
    extraHourPrice:       nn(r.extraHourPrice),
    extraPersonPrice:     nn(r.extraPersonPrice),
    ratingAvg:            n(r.ratingAvg),
    branch:               r.branch ? coerceBranch(r.branch) : undefined,
    amenities: r.amenities?.map((a: any) => ({ ...a, price: nn(a.price) })),
    timeSlotSuggestions: r.timeSlotSuggestions?.map((ts: any) => ({
      ...ts,
      priceOverride: nn(ts.priceOverride),
      priceOriginal: nn(ts.priceOriginal),
    })),
  };
}

function coerceBranch(b: any): Branch {
  return {
    ...b,
    latitude:  nn(b.latitude),
    longitude: nn(b.longitude),
  };
}

function coerceBooking(b: any): Booking {
  return {
    ...b,
    baseAmount:     n(b.baseAmount),
    discountAmount: n(b.discountAmount),
    extraAmount:    n(b.extraAmount),
    totalAmount:    n(b.totalAmount),
    refundAmount:   nn(b.refundAmount),
  };
}

function coerceVoucher(v: any): Voucher {
  return {
    ...v,
    discountValue:     n(v.discountValue),
    maxDiscountAmount: nn(v.maxDiscountAmount),
    minBookingAmount:  n(v.minBookingAmount),
  };
}

// ─── Amenities ────────────────────────────────────────────────────────────────

async function getAmenities(): Promise<PaginatedResult<Amenity>> {
  const res = await api.get<PaginatedResult<Amenity>>('/api/v1/amenities?limit=200');
  return res.data;
}

async function createAmenity(dto: Partial<Amenity>, token: string): Promise<Amenity> {
  const res = await api.post<Amenity>('/api/v1/amenities', dto, token);
  return res.data;
}

async function updateAmenity(id: string, dto: Partial<Amenity>, token: string): Promise<Amenity> {
  const res = await api.patch<Amenity>(`/api/v1/amenities/${id}`, dto, token);
  return res.data;
}

async function deleteAmenity(id: string, token: string): Promise<void> {
  await api.delete(`/api/v1/amenities/${id}`, token);
}

interface RoomAmenityItem {
  amenityId: string;
  isFeatured?: boolean;
  isFree?: boolean;
  price?: number | null;
}

async function syncRoomAmenities(roomId: string, amenities: RoomAmenityItem[], token: string): Promise<Room> {
  const res = await api.put<Room>(`/api/v1/rooms/${roomId}/amenities`, { amenities }, token);
  return coerceRoom(res.data);
}

// ─── Branches ─────────────────────────────────────────────────────────────────

async function getBranches(): Promise<Branch[]> {
  if (isMock) return mockDelay(MOCK_BRANCHES);
  const res = await api.get<{ items: Branch[] }>('/api/v1/branches?limit=100');
  return (res.data.items ?? []).map(coerceBranch);
}

async function getBranch(id: string): Promise<Branch> {
  if (isMock) {
    const branch = MOCK_BRANCHES.find((b) => b.id === id);
    if (!branch) throw new Error('Branch not found');
    return mockDelay(branch);
  }
  const res = await api.get<Branch>(`/api/v1/branches/${id}`);
  return coerceBranch(res.data);
}

async function createBranch(dto: Partial<Branch>, token: string): Promise<Branch> {
  const res = await api.post<Branch>('/api/v1/branches', dto, token);
  return coerceBranch(res.data);
}

async function updateBranch(id: string, dto: Partial<Branch>, token: string): Promise<Branch> {
  const res = await api.patch<Branch>(`/api/v1/branches/${id}`, dto, token);
  return coerceBranch(res.data);
}

async function deleteBranch(id: string, token: string): Promise<void> {
  await api.delete(`/api/v1/branches/${id}`, token);
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

async function getRooms(query: RoomQuery = {}): Promise<PaginatedResult<Room>> {
  if (isMock) return mockDelay(filterMockRooms(query));
  const params = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]),
  );
  const res = await api.get<PaginatedResult<Room>>(`/api/v1/rooms?${params}`);
  return { ...res.data, items: res.data.items.map(coerceRoom) };
}

async function getRoom(id: string): Promise<Room> {
  if (isMock) {
    const room = findMockRoom(id);
    if (!room) throw new Error('Room not found');
    return mockDelay(room);
  }
  const res = await api.get<Room>(`/api/v1/rooms/${id}`);
  return coerceRoom(res.data);
}

async function getRoomAvailability(id: string, checkIn: string, checkOut: string): Promise<RoomAvailability> {
  if (isMock) return mockDelay({ available: true, conflicts: [] });
  const res = await api.get<RoomAvailability>(
    `/api/v1/rooms/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
  );
  return res.data;
}

async function getTimeSlots(roomId: string, date: string): Promise<TimeSlotSuggestion[]> {
  if (isMock) {
    const room = findMockRoom(roomId);
    return mockDelay(room?.timeSlotSuggestions ?? []);
  }
  const res = await api.get<TimeSlotSuggestion[]>(`/api/v1/rooms/${roomId}/time-slots?date=${date}`);
  return (res.data ?? []).map((ts: any) => ({
    ...ts,
    priceOverride: nn(ts.priceOverride),
    priceOriginal: nn(ts.priceOriginal),
  }));
}

async function createRoom(dto: Partial<Room>, token: string): Promise<Room> {
  const res = await api.post<Room>('/api/v1/rooms', dto, token);
  return coerceRoom(res.data);
}

async function updateRoom(id: string, dto: Partial<Room>, token: string): Promise<Room> {
  const res = await api.patch<Room>(`/api/v1/rooms/${id}`, dto, token);
  return coerceRoom(res.data);
}

async function deleteRoom(id: string, token: string): Promise<void> {
  await api.delete(`/api/v1/rooms/${id}`, token);
}

async function uploadRoomImage(roomId: string, file: File, token: string): Promise<RoomImage> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/v1/rooms/${roomId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Upload thất bại');
  return body.data as RoomImage;
}

async function deleteRoomImage(roomId: string, imageId: string, token: string): Promise<void> {
  await api.delete(`/api/v1/rooms/${roomId}/images/${imageId}`, token);
}

async function setRoomImageCover(roomId: string, imageId: string, token: string): Promise<RoomImage> {
  const res = await api.patch<RoomImage>(`/api/v1/rooms/${roomId}/images/${imageId}/cover`, {}, token);
  return res.data;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

async function createBooking(dto: CreateBookingDto, token?: string): Promise<Booking> {
  if (isMock) {
    const mockBooking: Booking = {
      id: `booking-mock-${Date.now()}`,
      bookingCode: `HMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      roomId: dto.roomId,
      userId: null,
      bookingType: dto.bookingType,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      numHours: dto.numHours ?? null,
      numGuests: dto.numGuests,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      guestEmail: dto.guestEmail ?? null,
      guestNote: dto.guestNote ?? null,
      baseAmount: 500000,
      discountAmount: 0,
      extraAmount: 0,
      totalAmount: 500000,
      voucherId: null,
      voucherCode: dto.voucherCode ?? null,
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      cancelReason: null,
      refundAmount: null,
      adminNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(mockBooking);
  }
  const res = await api.post<Booking>('/api/v1/bookings', dto, token);
  return coerceBooking(res.data);
}

async function getBookingByCode(code: string): Promise<Booking> {
  if (isMock) {
    const booking = MOCK_BOOKINGS.find((b) => b.bookingCode === code);
    if (!booking) throw new Error('Booking not found');
    return mockDelay(booking);
  }
  const res = await api.get<Booking>(`/api/v1/bookings/code/${code}`);
  return coerceBooking(res.data);
}

async function getBooking(id: string, token?: string): Promise<Booking> {
  if (isMock) {
    const booking = MOCK_BOOKINGS.find((b) => b.id === id) ?? MOCK_BOOKINGS[0];
    return mockDelay(booking);
  }
  const res = await api.get<Booking>(`/api/v1/bookings/${id}`, token);
  return coerceBooking(res.data);
}

async function getMyBookings(token: string): Promise<PaginatedResult<Booking>> {
  if (isMock) return mockDelay({
    items: MOCK_BOOKINGS,
    meta: { total: MOCK_BOOKINGS.length, page: 1, limit: 10, totalPages: 1 },
  });
  const res = await api.get<PaginatedResult<Booking>>('/api/v1/bookings/my', token);
  return { ...res.data, items: res.data.items.map(coerceBooking) };
}

async function getAdminBookings(
  query: { page?: number; limit?: number; bookingStatus?: string; search?: string } = {},
  token: string,
): Promise<PaginatedResult<Booking>> {
  if (isMock) return mockDelay({
    items: MOCK_BOOKINGS,
    meta: { total: MOCK_BOOKINGS.length, page: 1, limit: 20, totalPages: 1 },
  });
  const params = new URLSearchParams();
  if (query.page)    params.set('page',    String(query.page));
  if (query.limit)   params.set('limit',   String(query.limit));
  if (query.bookingStatus && query.bookingStatus !== 'all') params.set('bookingStatus', query.bookingStatus);
  if (query.search)  params.set('search',  query.search);
  const qs = params.toString();
  const res = await api.get<PaginatedResult<Booking>>(
    `/api/v1/bookings${qs ? '?' + qs : ''}`, token,
  );
  return { ...res.data, items: res.data.items.map(coerceBooking) };
}

async function updateBookingStatus(
  id: string,
  bookingStatus: string,
  token: string,
): Promise<Booking> {
  const res = await api.patch<Booking>(`/api/v1/bookings/${id}/status`, { bookingStatus }, token);
  return coerceBooking(res.data);
}

async function cancelBooking(id: string, reason: string, token: string): Promise<Booking> {
  if (isMock) {
    const booking = MOCK_BOOKINGS.find((b) => b.id === id) ?? MOCK_BOOKINGS[0];
    return mockDelay({ ...booking, bookingStatus: 'cancelled', cancelReason: reason });
  }
  const res = await api.post<Booking>(`/api/v1/bookings/${id}/cancel`, { reason }, token);
  return coerceBooking(res.data);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

async function createVnpayPayment(bookingId: string, token?: string): Promise<{ paymentUrl: string }> {
  if (isMock) return mockDelay({ paymentUrl: `https://sandbox.vnpayment.vn/mock?bookingId=${bookingId}` });
  const res = await api.post<{ paymentUrl: string }>('/api/v1/payments/vnpay/create', { bookingId }, token);
  return res.data;
}

// ─── Vouchers ─────────────────────────────────────────────────────────────────

async function validateVoucher(dto: ValidateVoucherDto): Promise<ValidateVoucherResult> {
  if (isMock) return mockDelay(validateMockVoucher(dto));
  const res = await api.post<ValidateVoucherResult>('/api/v1/vouchers/validate', dto);
  return res.data;
}

async function getVouchers(token: string): Promise<PaginatedResult<Voucher>> {
  if (isMock) return mockDelay({
    items: MOCK_VOUCHERS,
    meta: { total: MOCK_VOUCHERS.length, page: 1, limit: 10, totalPages: 1 },
  });
  const res = await api.get<PaginatedResult<Voucher>>('/api/v1/vouchers?limit=100', token);
  return { ...res.data, items: res.data.items.map(coerceVoucher) };
}

interface CreateVoucherDto {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number;
  minBookingAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

async function createVoucher(dto: CreateVoucherDto, token: string): Promise<Voucher> {
  const res = await api.post<Voucher>('/api/v1/vouchers', dto, token);
  return coerceVoucher(res.data);
}

async function updateVoucher(id: string, dto: Partial<CreateVoucherDto>, token: string): Promise<Voucher> {
  const res = await api.patch<Voucher>(`/api/v1/vouchers/${id}`, dto, token);
  return coerceVoucher(res.data);
}

async function deleteVoucher(id: string, token: string): Promise<void> {
  await api.delete(`/api/v1/vouchers/${id}`, token);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

async function getReviews(roomId: string, page = 1): Promise<PaginatedResult<Review>> {
  if (isMock) {
    const items = MOCK_REVIEWS.filter((r) => r.roomId === roomId);
    return mockDelay({ items, meta: { total: items.length, page, limit: 10, totalPages: 1 } });
  }
  const res = await api.get<PaginatedResult<Review>>(
    `/api/v1/reviews/room/${roomId}?page=${page}&limit=10`,
  );
  return res.data;
}

async function getAdminReviews(
  query: { isVisible?: boolean; roomId?: string; page?: number; limit?: number } = {},
  token: string,
): Promise<PaginatedResult<Review>> {
  const params = new URLSearchParams();
  if (query.page)   params.set('page',   String(query.page));
  params.set('limit', String(Math.min(query.limit ?? 100, 100)));
  if (query.roomId) params.set('roomId', query.roomId);
  if (query.isVisible !== undefined) params.set('isVisible', String(query.isVisible));
  const qs = params.toString();
  const res = await api.get<PaginatedResult<Review>>(
    `/api/v1/reviews${qs ? '?' + qs : ''}`,
    token,
  );
  return res.data;
}

async function setReviewVisibility(id: string, isVisible: boolean, token: string): Promise<Review> {
  const res = await api.patch<Review>(`/api/v1/reviews/${id}/visibility`, { isVisible }, token);
  return res.data;
}

async function deleteReview(id: string, token: string): Promise<void> {
  await api.delete(`/api/v1/reviews/${id}`, token);
}

// ─── Reports (Admin) ──────────────────────────────────────────────────────────

async function getReportSummary(token: string): Promise<BookingSummary> {
  if (isMock) return mockDelay({
    total: 28, pending: 3, confirmed: 8, checkedIn: 5, completed: 10, cancelled: 2,
    todayRevenue: 4500000, yesterdayRevenue: 3800000,
    todayBookings: 6, yesterdayBookings: 5,
    occupancyRate: 75,
  });
  const res = await api.get<BookingSummary>('/api/v1/reports/bookings/summary', token);
  return res.data;
}

async function getRevenueYearly(year: number, token: string): Promise<RevenueData[]> {
  if (isMock) return mockDelay(
    Array.from({ length: 12 }, (_, i) => ({
      month: i + 1, year,
      revenue: Math.floor(Math.random() * 50000000) + 20000000,
      bookingCount: Math.floor(Math.random() * 50) + 20,
    })),
  );
  const res = await api.get<RevenueData[]>(`/api/v1/reports/revenue/yearly?year=${year}`, token);
  return res.data;
}

async function getRevenueMonthly(year: number, month: number, token: string): Promise<RevenueData[]> {
  if (isMock) {
    const daysInMonth = new Date(year, month, 0).getDate();
    return mockDelay(
      Array.from({ length: daysInMonth }, (_, i) => ({
        date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
        revenue: Math.floor(Math.random() * 5000000) + 500000,
        bookingCount: Math.floor(Math.random() * 8) + 1,
      })),
    );
  }
  const res = await api.get<RevenueData[]>(
    `/api/v1/reports/revenue/monthly?year=${year}&month=${month}`,
    token,
  );
  return res.data;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const apiClient = {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  syncRoomAmenities,
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getRooms,
  getRoom,
  getRoomAvailability,
  getTimeSlots,
  createBooking,
  getBookingByCode,
  getBooking,
  getAdminBookings,
  updateBookingStatus,
  getMyBookings,
  cancelBooking,
  createVnpayPayment,
  validateVoucher,
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getReviews,
  getAdminReviews,
  setReviewVisibility,
  deleteReview,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  deleteRoomImage,
  setRoomImageCover,
  getReportSummary,
  getRevenueYearly,
  getRevenueMonthly,
};
