import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@homestay.vn' },
    update: {},
    create: {
      email: 'admin@homestay.vn',
      password: adminPassword,
      fullName: 'Admin',
      role: 'admin',
      isActive: true,
      isVerified: true,
    },
  });

  // ─── Branches ──────────────────────────────────────────────────────────────
  const branch1 = await prisma.branch.upsert({
    where: { id: 'branch-da-nang-001' },
    update: {},
    create: {
      id: 'branch-da-nang-001',
      name: 'Homestay Ocean Blue — Đà Nẵng Trung Tâm',
      nameEn: 'Ocean Blue Homestay — Da Nang Center',
      address: '12 Bạch Đằng, Hải Châu',
      city: 'Đà Nẵng',
      latitude: 16.0544,
      longitude: 108.2022,
      phone: '0236 123 4567',
      description: 'Chi nhánh trung tâm Đà Nẵng, cách biển Mỹ Khê 5 phút di chuyển.',
      descriptionEn: 'Da Nang city center branch, 5 minutes from My Khe Beach.',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-da-nang-002' },
    update: {},
    create: {
      id: 'branch-da-nang-002',
      name: 'Homestay Ocean Blue — Mỹ Khê',
      nameEn: 'Ocean Blue Homestay — My Khe Beach',
      address: '58 Võ Nguyên Giáp, Ngũ Hành Sơn',
      city: 'Đà Nẵng',
      latitude: 16.0429,
      longitude: 108.2472,
      phone: '0236 987 6543',
      description: 'Chi nhánh ven biển Mỹ Khê, view biển trực tiếp từ nhiều phòng.',
      descriptionEn: 'Beachfront branch with direct ocean views from most rooms.',
      isActive: true,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { id: 'branch-hoi-an-001' },
    update: {},
    create: {
      id: 'branch-hoi-an-001',
      name: 'Homestay Ocean Blue — Hội An',
      nameEn: 'Ocean Blue Homestay — Hoi An',
      address: '45 Cửa Đại, Cẩm An',
      city: 'Hội An',
      latitude: 15.8801,
      longitude: 108.3380,
      phone: '0235 456 7890',
      description: 'Chi nhánh Hội An yên tĩnh, gần phố cổ và bãi biển Cửa Đại.',
      descriptionEn: 'Peaceful Hoi An branch near the Ancient Town and Cua Dai Beach.',
      isActive: true,
    },
  });

  // ─── Rooms ─────────────────────────────────────────────────────────────────
  const rooms = [
    {
      id: 'room-001',
      branchId: branch1.id,
      name: 'Phòng Deluxe Hướng Phố',
      nameEn: 'City View Deluxe Room',
      description: 'Phòng Deluxe rộng 30m², view phố Bạch Đằng, nội thất hiện đại.',
      descriptionEn: '30sqm Deluxe room with Bach Dang street view and modern furnishings.',
      roomNumber: '101',
      floor: 1,
      capacity: 2,
      pricePerHour: 150000,
      pricePerHourOriginal: 200000,
      pricePerDay: 750000,
      pricePerDayOriginal: 950000,
      minHours: 2,
      extraHourPrice: 50000,
      extraPersonPrice: 100000,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      allowHourly: true,
      status: 'active' as const,
      isFeatured: true,
      isGuestFavorite: true,
      ratingAvg: 4.8,
      ratingCount: 124,
    },
    {
      id: 'room-002',
      branchId: branch1.id,
      name: 'Phòng Studio Gác Xép',
      nameEn: 'Loft Studio Room',
      description: 'Studio 2 tầng độc đáo với gác xép, phù hợp cặp đôi hoặc 2 người.',
      descriptionEn: 'Unique 2-floor studio with loft, ideal for couples or 2 guests.',
      roomNumber: '201',
      floor: 2,
      capacity: 2,
      pricePerHour: 200000,
      pricePerHourOriginal: 250000,
      pricePerDay: 950000,
      pricePerDayOriginal: 1200000,
      minHours: 3,
      extraHourPrice: 60000,
      extraPersonPrice: 120000,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      allowHourly: true,
      status: 'active' as const,
      isFeatured: true,
      isGuestFavorite: false,
      ratingAvg: 4.6,
      ratingCount: 89,
    },
    {
      id: 'room-003',
      branchId: branch2.id,
      name: 'Phòng Superior View Biển',
      nameEn: 'Sea View Superior Room',
      description: 'Phòng Superior với ban công view biển Mỹ Khê tuyệt đẹp.',
      descriptionEn: 'Superior room with stunning My Khe beach view balcony.',
      roomNumber: '301',
      floor: 3,
      capacity: 2,
      pricePerHour: 250000,
      pricePerHourOriginal: 320000,
      pricePerDay: 1200000,
      pricePerDayOriginal: 1500000,
      minHours: 2,
      extraHourPrice: 80000,
      extraPersonPrice: 150000,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      allowHourly: true,
      status: 'active' as const,
      isFeatured: true,
      isGuestFavorite: true,
      ratingAvg: 4.9,
      ratingCount: 213,
    },
    {
      id: 'room-004',
      branchId: branch2.id,
      name: 'Phòng Duplex Gia Đình',
      nameEn: 'Family Duplex Room',
      description: 'Phòng Duplex 2 tầng 60m² với 2 phòng ngủ, phù hợp gia đình 4 người.',
      descriptionEn: '60sqm 2-floor duplex with 2 bedrooms, perfect for 4-person families.',
      roomNumber: '401',
      floor: 4,
      capacity: 4,
      pricePerHour: 350000,
      pricePerHourOriginal: 450000,
      pricePerDay: 1800000,
      pricePerDayOriginal: 2200000,
      minHours: 4,
      extraHourPrice: 100000,
      extraPersonPrice: 200000,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      allowHourly: true,
      status: 'active' as const,
      isFeatured: false,
      isGuestFavorite: false,
      ratingAvg: 4.5,
      ratingCount: 67,
    },
    {
      id: 'room-005',
      branchId: branch3.id,
      name: 'Phòng Garden View Hội An',
      nameEn: 'Hoi An Garden View Room',
      description: 'Phòng hướng vườn yên tĩnh, phong cách truyền thống Hội An.',
      descriptionEn: 'Quiet garden-facing room with traditional Hoi An style.',
      roomNumber: '101',
      floor: 1,
      capacity: 2,
      pricePerHour: 180000,
      pricePerHourOriginal: null,
      pricePerDay: 850000,
      pricePerDayOriginal: null,
      minHours: 2,
      extraHourPrice: 55000,
      extraPersonPrice: 100000,
      checkInTime: '13:00',
      checkOutTime: '12:00',
      allowHourly: true,
      status: 'active' as const,
      isFeatured: false,
      isGuestFavorite: true,
      ratingAvg: 4.7,
      ratingCount: 156,
    },
    {
      id: 'room-006',
      branchId: branch3.id,
      name: 'Phòng Suite Bồn Tắm',
      nameEn: 'Bathtub Suite Room',
      description: 'Suite cao cấp 50m² với bồn tắm freestanding và ban công riêng.',
      descriptionEn: '50sqm premium suite with freestanding bathtub and private balcony.',
      roomNumber: '201',
      floor: 2,
      capacity: 2,
      pricePerHour: 300000,
      pricePerHourOriginal: 380000,
      pricePerDay: 1500000,
      pricePerDayOriginal: 1900000,
      minHours: 3,
      extraHourPrice: 90000,
      extraPersonPrice: 180000,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      allowHourly: false,
      status: 'active' as const,
      isFeatured: true,
      isGuestFavorite: true,
      ratingAvg: 4.9,
      ratingCount: 98,
    },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: room as any,
    });
  }

  // ─── Room amenities ─────────────────────────────────────────────────────────
  const amenitiesData = [
    { roomId: 'room-001', name: 'Wifi tốc độ cao', nameEn: 'High-speed WiFi', icon: 'wifi', isFeatured: true, isFree: true },
    { roomId: 'room-001', name: 'Điều hòa', nameEn: 'Air conditioning', icon: 'wind', isFeatured: true, isFree: true },
    { roomId: 'room-001', name: 'Smart TV 55"', nameEn: 'Smart TV 55"', icon: 'tv', isFeatured: false, isFree: true },
    { roomId: 'room-001', name: 'Gửi xe máy', nameEn: 'Motorbike parking', icon: 'car', isFeatured: false, isFree: true },
    { roomId: 'room-001', name: 'Tủ lạnh', nameEn: 'Refrigerator', icon: 'package', isFeatured: false, isFree: true },
    { roomId: 'room-001', name: 'Gửi ô tô', nameEn: 'Car parking', icon: 'car', isFeatured: false, isFree: false, price: 50000 },
    { roomId: 'room-003', name: 'Wifi tốc độ cao', nameEn: 'High-speed WiFi', icon: 'wifi', isFeatured: true, isFree: true },
    { roomId: 'room-003', name: 'Điều hòa', nameEn: 'Air conditioning', icon: 'wind', isFeatured: true, isFree: true },
    { roomId: 'room-003', name: 'Ban công view biển', nameEn: 'Sea view balcony', icon: 'sun', isFeatured: true, isFree: true },
    { roomId: 'room-003', name: 'Bồn tắm', nameEn: 'Bathtub', icon: 'droplets', isFeatured: true, isFree: true },
    { roomId: 'room-006', name: 'Bồn tắm freestanding', nameEn: 'Freestanding bathtub', icon: 'droplets', isFeatured: true, isFree: true },
    { roomId: 'room-006', name: 'Ban công riêng', nameEn: 'Private balcony', icon: 'sun', isFeatured: true, isFree: true },
    { roomId: 'room-006', name: 'Wifi tốc độ cao', nameEn: 'High-speed WiFi', icon: 'wifi', isFeatured: true, isFree: true },
  ];

  for (const amenity of amenitiesData) {
    await prisma.roomAmenity.create({ data: amenity as any });
  }

  // ─── Room images ────────────────────────────────────────────────────────────
  const imagesData = [
    { roomId: 'room-001', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-001', url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', sortOrder: 1, isCover: false },
    { roomId: 'room-002', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-002', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', sortOrder: 1, isCover: false },
    { roomId: 'room-003', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-003', url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', sortOrder: 1, isCover: false },
    { roomId: 'room-004', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-005', url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-006', url: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800', sortOrder: 0, isCover: true },
    { roomId: 'room-006', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', sortOrder: 1, isCover: false },
  ];

  for (const image of imagesData) {
    await prisma.roomImage.create({ data: image });
  }

  // ─── Time slot suggestions ──────────────────────────────────────────────────
  const timeSlotsData = [
    { roomId: 'room-001', label: 'Buổi sáng', startTime: '08:00', endTime: '12:00', priceOverride: 400000, priceOriginal: 600000, dayOfWeek: null, isActive: true },
    { roomId: 'room-001', label: 'Buổi chiều', startTime: '14:00', endTime: '18:00', priceOverride: 450000, priceOriginal: 600000, dayOfWeek: null, isActive: true },
    { roomId: 'room-001', label: 'Buổi tối', startTime: '20:00', endTime: '23:00', priceOverride: 380000, priceOriginal: 450000, dayOfWeek: null, isActive: true },
    { roomId: 'room-003', label: 'Nghỉ trưa', startTime: '12:00', endTime: '15:00', priceOverride: 600000, priceOriginal: 750000, dayOfWeek: null, isActive: true },
    { roomId: 'room-003', label: 'Buổi tối view biển', startTime: '19:00', endTime: '23:00', priceOverride: 800000, priceOriginal: 1000000, dayOfWeek: null, isActive: true },
  ];

  for (const slot of timeSlotsData) {
    await prisma.timeSlotSuggestion.create({ data: slot as any });
  }

  // ─── Cancellation policies ──────────────────────────────────────────────────
  const policiesData = [
    { roomId: 'room-001', daysBefore: 3, refundPercentage: 100, description: 'Hủy trước 3 ngày: hoàn 100%' },
    { roomId: 'room-001', daysBefore: 1, refundPercentage: 50, description: 'Hủy trước 1 ngày: hoàn 50%' },
    { roomId: 'room-001', daysBefore: 0, refundPercentage: 0, description: 'Hủy trong ngày: không hoàn tiền' },
    { roomId: 'room-003', daysBefore: 7, refundPercentage: 100, description: 'Hủy trước 7 ngày: hoàn 100%' },
    { roomId: 'room-003', daysBefore: 3, refundPercentage: 50, description: 'Hủy trước 3 ngày: hoàn 50%' },
    { roomId: 'room-006', daysBefore: 7, refundPercentage: 100, description: 'Hủy trước 7 ngày: hoàn 100%' },
    { roomId: 'room-006', daysBefore: 2, refundPercentage: 0, description: 'Hủy trong vòng 2 ngày: không hoàn tiền' },
  ];

  for (const policy of policiesData) {
    await prisma.cancellationPolicy.create({ data: policy });
  }

  // ─── Vouchers ──────────────────────────────────────────────────────────────
  await prisma.voucher.upsert({
    where: { code: 'SUMMER30' },
    update: {},
    create: {
      code: 'SUMMER30',
      description: 'Giảm 30% cho đặt phòng mùa hè',
      discountType: 'percentage',
      discountValue: 30,
      maxDiscountAmount: 300000,
      minBookingAmount: 500000,
      usageLimit: 100,
      validFrom: new Date('2026-05-01'),
      validUntil: new Date('2026-08-31'),
      isActive: true,
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'WELCOME100' },
    update: {},
    create: {
      code: 'WELCOME100',
      description: 'Giảm 100.000₫ cho lần đặt đầu tiên',
      discountType: 'fixed_amount',
      discountValue: 100000,
      minBookingAmount: 300000,
      usageLimit: 500,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Seed completed:');
  console.log('   Admin: admin@homestay.vn / Admin@123');
  console.log('   3 branches, 6 rooms, amenities, images, time slots, policies, 2 vouchers');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
