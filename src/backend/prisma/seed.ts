import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ─── Admin user ─────────────────────────────────────────────────────────────
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

  // ─── Amenities (global catalog) ─────────────────────────────────────────────
  const amenities = [
    { id: 'am-wifi',      name: 'Wifi tốc độ cao',    nameEn: 'High-speed WiFi',       icon: 'wifi',     category: 'basic' },
    { id: 'am-ac',        name: 'Điều hoà nhiệt độ',  nameEn: 'Air conditioning',      icon: 'wind',     category: 'basic' },
    { id: 'am-tv',        name: 'Smart TV 4K',          nameEn: 'Smart TV 4K',           icon: 'tv',       category: 'entertainment' },
    { id: 'am-fridge',    name: 'Tủ lạnh mini',         nameEn: 'Mini fridge',           icon: 'package',  category: 'basic' },
    { id: 'am-bathtub',   name: 'Bồn tắm thả',          nameEn: 'Freestanding bathtub',  icon: 'droplets', category: 'basic' },
    { id: 'am-balcony',   name: 'Ban công riêng',        nameEn: 'Private balcony',       icon: 'sun',      category: 'basic' },
    { id: 'am-pool',      name: 'Hồ bơi riêng',         nameEn: 'Private pool',          icon: 'waves',    category: 'convenience' },
    { id: 'am-parking',   name: 'Đỗ xe miễn phí',       nameEn: 'Free parking',          icon: 'car',      category: 'convenience' },
    { id: 'am-kettle',    name: 'Ấm đun nước & trà',    nameEn: 'Electric kettle & tea', icon: 'coffee',   category: 'basic' },
    { id: 'am-hairdryer', name: 'Máy sấy tóc',          nameEn: 'Hair dryer',            icon: 'zap',      category: 'basic' },
    { id: 'am-safe',      name: 'Két an toàn',          nameEn: 'In-room safe',          icon: 'shield',   category: 'safety' },
    { id: 'am-breakfast', name: 'Bữa sáng miễn phí',    nameEn: 'Free breakfast',        icon: 'utensils', category: 'convenience' },
    { id: 'am-workspace', name: 'Góc làm việc',         nameEn: 'Work desk',             icon: 'monitor',  category: 'convenience' },
    { id: 'am-view',      name: 'View thành phố',       nameEn: 'City view',             icon: 'building', category: 'convenience' },
    { id: 'am-seaview',   name: 'View biển',            nameEn: 'Sea view',              icon: 'anchor',   category: 'convenience' },
    { id: 'am-bbq',       name: 'Khu BBQ',              nameEn: 'BBQ area',              icon: 'flame',    category: 'entertainment' },
    { id: 'am-bath',      name: 'Bồn tắm nằm',         nameEn: 'Soaking bathtub',       icon: 'bath',     category: 'basic' },
  ] as const;

  for (const a of amenities) {
    await prisma.amenity.upsert({
      where: { id: a.id },
      update: {},
      create: a as any,
    });
  }

  // ─── Branches ───────────────────────────────────────────────────────────────
  const branchHcm = await prisma.branch.upsert({
    where: { id: 'br-hcm-01' },
    update: {},
    create: {
      id: 'br-hcm-01',
      name: 'Ocean Blue Homestay — Sài Gòn Central',
      nameEn: 'Ocean Blue Homestay — Saigon Central',
      address: '28 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1',
      city: 'TP. Hồ Chí Minh',
      latitude: 10.76935,
      longitude: 106.69252,
      phone: '028 3838 9999',
      description: 'Toạ lạc ngay trung tâm phố Tây Bùi Viện sôi động, cách Bến Thành 10 phút đi bộ. Phòng nghỉ hiện đại, thiết kế Indochine tinh tế, phù hợp cho cả du khách và khách công tác.',
      descriptionEn: 'Located in the heart of vibrant Bui Vien walking street, 10 minutes walk from Ben Thanh Market. Modern rooms with refined Indochine design, ideal for both leisure and business travelers.',
      isActive: true,
    },
  });

  const branchDl = await prisma.branch.upsert({
    where: { id: 'br-dl-01' },
    update: {},
    create: {
      id: 'br-dl-01',
      name: 'Ocean Blue Homestay — Đà Lạt Highland',
      nameEn: 'Ocean Blue Homestay — Da Lat Highland',
      address: '15 Huỳnh Thúc Kháng, Phường 9',
      city: 'Đà Lạt',
      latitude: 11.94066,
      longitude: 108.43832,
      phone: '0263 3822 888',
      description: 'Nằm trên đồi thông yên tĩnh, cách hồ Xuân Hương chỉ 5 phút. Không khí trong lành mát mẻ quanh năm, view thung lũng và rừng thông, lý tưởng cho kỳ nghỉ lãng mạn và retreat.',
      descriptionEn: 'Nestled on a quiet pine hill, 5 minutes from Xuan Huong Lake. Cool fresh air year-round, valley and pine forest views — perfect for romantic getaways and retreats.',
      isActive: true,
    },
  });

  const branchPq = await prisma.branch.upsert({
    where: { id: 'br-pq-01' },
    update: {},
    create: {
      id: 'br-pq-01',
      name: 'Ocean Blue Homestay — Phú Quốc Beachside',
      nameEn: 'Ocean Blue Homestay — Phu Quoc Beachside',
      address: '68 Trần Hưng Đạo, Dương Tơ, Phú Quốc',
      city: 'Phú Quốc',
      latitude: 10.22884,
      longitude: 103.97598,
      phone: '0297 3988 666',
      description: 'Sát mặt biển Dương Tơ trong xanh, cách sân bay Phú Quốc 10 phút lái xe. Phòng nghỉ view biển, hồ bơi vô cực nhìn ra đại dương, thiên đường nghỉ dưỡng đích thực.',
      descriptionEn: 'Steps from the crystal-clear Duong To beach, 10 minutes drive from Phu Quoc Airport. Sea-view rooms, infinity pool overlooking the ocean — a true island paradise.',
      isActive: true,
    },
  });

  // ─── Rooms ──────────────────────────────────────────────────────────────────
  type RoomSeed = {
    id: string; branchId: string; name: string; nameEn: string;
    description: string; descriptionEn: string; roomNumber: string;
    floor: number; capacity: number;
    pricePerHour: number; pricePerHourOriginal?: number;
    pricePerDay: number; pricePerDayOriginal?: number;
    minHours: number; extraHourPrice: number; extraPersonPrice: number;
    checkInTime: string; checkOutTime: string; allowHourly: boolean;
    isFeatured: boolean; isGuestFavorite: boolean;
    ratingAvg: number; ratingCount: number;
  };

  const rooms: RoomSeed[] = [
    // ── Sài Gòn ──────────────────────────────────────────
    {
      id: 'rm-hcm-01', branchId: branchHcm.id,
      name: 'Phòng Deluxe Indochine', nameEn: 'Deluxe Indochine Room',
      description: 'Phòng 35m² phong cách Đông Dương hiện đại với gỗ teak ấm áp, tranh Hội hoạ Việt Nam và ánh đèn vàng dịu. View nhìn ra phố đi bộ Bùi Viện tấp nập. Giường King-size, bồn tắm đứng, minibar đầy đủ.',
      descriptionEn: '35sqm modern Indochine room with warm teak wood, Vietnamese artwork and soft amber lighting. Overlooking vibrant Bui Vien walking street. King-size bed, standing bathtub, full minibar.',
      roomNumber: '101', floor: 1, capacity: 2,
      pricePerHour: 180000, pricePerHourOriginal: 230000,
      pricePerDay: 890000, pricePerDayOriginal: 1100000,
      minHours: 2, extraHourPrice: 60000, extraPersonPrice: 120000,
      checkInTime: '14:00', checkOutTime: '12:00', allowHourly: true,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 4.8, ratingCount: 217,
    },
    {
      id: 'rm-hcm-02', branchId: branchHcm.id,
      name: 'Phòng Suite Panorama', nameEn: 'Panorama Suite',
      description: 'Suite 55m² tầng cao nhất với cửa kính full-wall nhìn toàn cảnh trung tâm Sài Gòn về đêm. Gồm phòng khách riêng, bếp nhỏ, bồn tắm freestanding và sân thượng mini riêng tư.',
      descriptionEn: '55sqm top-floor suite with floor-to-ceiling glass overlooking Saigon at night. Includes separate living room, kitchenette, freestanding bathtub and private mini rooftop terrace.',
      roomNumber: '501', floor: 5, capacity: 3,
      pricePerHour: 280000, pricePerHourOriginal: 350000,
      pricePerDay: 1450000, pricePerDayOriginal: 1800000,
      minHours: 2, extraHourPrice: 90000, extraPersonPrice: 180000,
      checkInTime: '14:00', checkOutTime: '12:00', allowHourly: true,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 4.9, ratingCount: 89,
    },
    {
      id: 'rm-hcm-03', branchId: branchHcm.id,
      name: 'Phòng Studio Công Tác', nameEn: 'Business Studio',
      description: 'Studio 28m² thiết kế tối giản dành riêng cho khách công tác. Bàn làm việc rộng 1.8m, ghế công thái học, màn hình phụ 27", ổ cắm điện và USB đa quốc gia. Wifi đối xứng 500Mbps.',
      descriptionEn: '28sqm minimalist studio designed for business travelers. 1.8m workdesk, ergonomic chair, 27" secondary monitor, multi-country power outlets & USB. 500Mbps symmetric WiFi.',
      roomNumber: '201', floor: 2, capacity: 2,
      pricePerHour: 120000, pricePerHourOriginal: 150000,
      pricePerDay: 650000, pricePerDayOriginal: 800000,
      minHours: 2, extraHourPrice: 40000, extraPersonPrice: 100000,
      checkInTime: '14:00', checkOutTime: '12:00', allowHourly: true,
      isFeatured: false, isGuestFavorite: false, ratingAvg: 4.5, ratingCount: 143,
    },
    // ── Đà Lạt ───────────────────────────────────────────
    {
      id: 'rm-dl-01', branchId: branchDl.id,
      name: 'Phòng Loft Thông Đà Lạt', nameEn: 'Dalat Pine Loft',
      description: 'Loft 2 tầng 40m² ốp gỗ thông toàn bộ, mùi thơm dịu nhẹ, ánh sáng tự nhiên xuyên cửa kính lớn. Tầng trên là phòng ngủ với giường đôi, tầng dưới là khu sinh hoạt và góc đọc sách ấm cúng.',
      descriptionEn: '40sqm 2-floor pine wood loft, filled with subtle pine scent and natural light through large windows. Upper floor: double bedroom; lower floor: living area and cozy reading nook.',
      roomNumber: '101', floor: 1, capacity: 2,
      pricePerHour: 160000, pricePerHourOriginal: 200000,
      pricePerDay: 780000, pricePerDayOriginal: 980000,
      minHours: 2, extraHourPrice: 55000, extraPersonPrice: 110000,
      checkInTime: '13:00', checkOutTime: '12:00', allowHourly: true,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 4.9, ratingCount: 312,
    },
    {
      id: 'rm-dl-02', branchId: branchDl.id,
      name: 'Phòng Valley View Retreat', nameEn: 'Valley View Retreat',
      description: 'Phòng 45m² có ban công rộng nhìn thẳng ra thung lũng xanh mướt và đồi chè Cầu Đất. Lò sưởi gas thật, chăn lông vũ ấm áp, bồn tắm ngâm và góc ngồi uống cà phê đón bình minh tuyệt vời.',
      descriptionEn: '45sqm room with wide balcony facing the lush valley and Cau Dat tea hills. Real gas fireplace, warm down duvet, soaking tub and the perfect morning coffee corner for sunrise watching.',
      roomNumber: '201', floor: 2, capacity: 2,
      pricePerHour: 200000, pricePerHourOriginal: 260000,
      pricePerDay: 980000, pricePerDayOriginal: 1250000,
      minHours: 2, extraHourPrice: 70000, extraPersonPrice: 130000,
      checkInTime: '13:00', checkOutTime: '12:00', allowHourly: true,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 4.8, ratingCount: 178,
    },
    {
      id: 'rm-dl-03', branchId: branchDl.id,
      name: 'Phòng Gia Đình Đà Lạt Garden', nameEn: 'Dalat Garden Family Room',
      description: 'Phòng 60m² 2 phòng ngủ bao quanh bởi vườn hoa dã quỳ và hướng dương. Thích hợp gia đình 4 người. Phòng khách chung, 2 nhà vệ sinh riêng, bếp nhỏ đầy đủ nồi, chảo và dụng cụ làm bếp.',
      descriptionEn: '60sqm 2-bedroom family room surrounded by wild sunflower and daisy garden. Perfect for 4 guests. Shared living room, 2 separate bathrooms, small kitchen with full cookware.',
      roomNumber: '301', floor: 3, capacity: 4,
      pricePerHour: 240000, pricePerHourOriginal: 300000,
      pricePerDay: 1250000, pricePerDayOriginal: 1600000,
      minHours: 3, extraHourPrice: 80000, extraPersonPrice: 150000,
      checkInTime: '13:00', checkOutTime: '12:00', allowHourly: false,
      isFeatured: false, isGuestFavorite: true, ratingAvg: 4.7, ratingCount: 95,
    },
    // ── Phú Quốc ─────────────────────────────────────────
    {
      id: 'rm-pq-01', branchId: branchPq.id,
      name: 'Phòng Ocean Breeze', nameEn: 'Ocean Breeze Room',
      description: 'Phòng 38m² nhìn ra biển Dương Tơ xanh ngọc, trang bị nội thất nhiệt đới mây tre đan. Ban công riêng với võng đôi, bàn ghế cà phê. Cửa kính mở ra bãi biển chỉ 30 bước chân.',
      descriptionEn: '38sqm room overlooking the turquoise Duong To sea with tropical rattan & bamboo furnishings. Private balcony with double hammock and coffee table. Glass doors open to the beach just 30 steps away.',
      roomNumber: '101', floor: 1, capacity: 2,
      pricePerHour: 200000, pricePerHourOriginal: 260000,
      pricePerDay: 980000, pricePerDayOriginal: 1200000,
      minHours: 2, extraHourPrice: 65000, extraPersonPrice: 130000,
      checkInTime: '14:00', checkOutTime: '11:00', allowHourly: true,
      isFeatured: false, isGuestFavorite: true, ratingAvg: 4.7, ratingCount: 264,
    },
    {
      id: 'rm-pq-02', branchId: branchPq.id,
      name: 'Phòng Beachfront Premium', nameEn: 'Beachfront Premium Room',
      description: 'Phòng 50m² cao cấp sát mặt biển, cửa kính toàn bộ mặt tiền nhìn ra đại dương. Thiết kế sang trọng với đá marble trắng, đèn trần pha lê và jacuzzi ngoài ban công. Breakfast included.',
      descriptionEn: '50sqm premium beachfront room, fully glazed oceanfront facade. Luxurious white marble interior, crystal chandelier and private balcony jacuzzi. Breakfast included.',
      roomNumber: '201', floor: 2, capacity: 2,
      pricePerHour: 320000, pricePerHourOriginal: 400000,
      pricePerDay: 1680000, pricePerDayOriginal: 2100000,
      minHours: 2, extraHourPrice: 100000, extraPersonPrice: 200000,
      checkInTime: '14:00', checkOutTime: '11:00', allowHourly: true,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 4.9, ratingCount: 156,
    },
    {
      id: 'rm-pq-03', branchId: branchPq.id,
      name: 'Biệt Thự Pool Villa', nameEn: 'Pool Villa',
      description: 'Biệt thự độc lập 80m² với hồ bơi riêng 15m² nhìn thẳng ra biển. 2 phòng ngủ, phòng khách, bếp đầy đủ, sân vườn và khu BBQ riêng tư. Đỉnh cao của trải nghiệm nghỉ dưỡng biển đảo.',
      descriptionEn: 'Independent 80sqm villa with private 15sqm pool directly facing the sea. 2 bedrooms, living room, fully equipped kitchen, garden and private BBQ area. The pinnacle of island resort experience.',
      roomNumber: '301', floor: 1, capacity: 4,
      pricePerHour: 450000, pricePerHourOriginal: 580000,
      pricePerDay: 2500000, pricePerDayOriginal: 3200000,
      minHours: 3, extraHourPrice: 150000, extraPersonPrice: 250000,
      checkInTime: '14:00', checkOutTime: '11:00', allowHourly: false,
      isFeatured: true, isGuestFavorite: true, ratingAvg: 5.0, ratingCount: 72,
    },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({ where: { id: room.id }, update: {}, create: room as any });
  }

  // ─── Room images ─────────────────────────────────────────────────────────────
  const images = [
    // HCM-01
    { id: 'img-hcm01-1', roomId: 'rm-hcm-01', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-hcm01-2', roomId: 'rm-hcm-01', url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-hcm01-3', roomId: 'rm-hcm-01', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-hcm01-4', roomId: 'rm-hcm-01', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', sortOrder: 3, isCover: false },
    // HCM-02
    { id: 'img-hcm02-1', roomId: 'rm-hcm-02', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-hcm02-2', roomId: 'rm-hcm-02', url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-hcm02-3', roomId: 'rm-hcm-02', url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-hcm02-4', roomId: 'rm-hcm-02', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', sortOrder: 3, isCover: false },
    // HCM-03
    { id: 'img-hcm03-1', roomId: 'rm-hcm-03', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-hcm03-2', roomId: 'rm-hcm-03', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-hcm03-3', roomId: 'rm-hcm-03', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80', sortOrder: 2, isCover: false },
    // DL-01
    { id: 'img-dl01-1', roomId: 'rm-dl-01', url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-dl01-2', roomId: 'rm-dl-01', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-dl01-3', roomId: 'rm-dl-01', url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-dl01-4', roomId: 'rm-dl-01', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80', sortOrder: 3, isCover: false },
    // DL-02
    { id: 'img-dl02-1', roomId: 'rm-dl-02', url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-dl02-2', roomId: 'rm-dl-02', url: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-dl02-3', roomId: 'rm-dl-02', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-dl02-4', roomId: 'rm-dl-02', url: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1200&q=80', sortOrder: 3, isCover: false },
    // DL-03
    { id: 'img-dl03-1', roomId: 'rm-dl-03', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-dl03-2', roomId: 'rm-dl-03', url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-dl03-3', roomId: 'rm-dl-03', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', sortOrder: 2, isCover: false },
    // PQ-01
    { id: 'img-pq01-1', roomId: 'rm-pq-01', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-pq01-2', roomId: 'rm-pq-01', url: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-pq01-3', roomId: 'rm-pq-01', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-pq01-4', roomId: 'rm-pq-01', url: 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=1200&q=80', sortOrder: 3, isCover: false },
    // PQ-02
    { id: 'img-pq02-1', roomId: 'rm-pq-02', url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-pq02-2', roomId: 'rm-pq-02', url: 'https://images.unsplash.com/photo-1602002418082-dd4a3f5b4f5e?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-pq02-3', roomId: 'rm-pq-02', url: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-pq02-4', roomId: 'rm-pq-02', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', sortOrder: 3, isCover: false },
    // PQ-03
    { id: 'img-pq03-1', roomId: 'rm-pq-03', url: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200&q=80', sortOrder: 0, isCover: true },
    { id: 'img-pq03-2', roomId: 'rm-pq-03', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', sortOrder: 1, isCover: false },
    { id: 'img-pq03-3', roomId: 'rm-pq-03', url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', sortOrder: 2, isCover: false },
    { id: 'img-pq03-4', roomId: 'rm-pq-03', url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&q=80', sortOrder: 3, isCover: false },
  ];

  for (const img of images) {
    await prisma.roomImage.upsert({ where: { id: img.id }, update: {}, create: img });
  }

  // ─── Room amenities ──────────────────────────────────────────────────────────
  type RoomAmenityEntry = { roomId: string; amenityId: string; isFeatured: boolean; isFree: boolean; price?: number };
  const roomAmenities: RoomAmenityEntry[] = [
    // HCM-01 Deluxe Indochine
    { roomId: 'rm-hcm-01', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-tv',        isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-bathtub',   isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-hairdryer', isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-01', amenityId: 'am-parking',   isFeatured: false, isFree: false, price: 50000 },
    // HCM-02 Suite Panorama
    { roomId: 'rm-hcm-02', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-tv',        isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-bath',      isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-balcony',   isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-breakfast', isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-workspace', isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-02', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    // HCM-03 Business Studio
    { roomId: 'rm-hcm-03', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-workspace', isFeatured: true,  isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-hcm-03', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    // DL-01 Pine Loft
    { roomId: 'rm-dl-01', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-tv',        isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-balcony',   isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-hairdryer', isFeatured: false, isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-01', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    // DL-02 Valley View
    { roomId: 'rm-dl-02', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-balcony',   isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-bath',      isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-breakfast', isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    { roomId: 'rm-dl-02', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    // DL-03 Garden Family
    { roomId: 'rm-dl-03', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-bbq',       isFeatured: true,  isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    { roomId: 'rm-dl-03', amenityId: 'am-hairdryer', isFeatured: false, isFree: true },
    // PQ-01 Ocean Breeze
    { roomId: 'rm-pq-01', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-seaview',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-balcony',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-kettle',    isFeatured: false, isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-hairdryer', isFeatured: false, isFree: true },
    { roomId: 'rm-pq-01', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    // PQ-02 Beachfront Premium
    { roomId: 'rm-pq-02', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-seaview',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-balcony',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-bathtub',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-breakfast', isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    { roomId: 'rm-pq-02', amenityId: 'am-parking',   isFeatured: false, isFree: true },
    // PQ-03 Pool Villa
    { roomId: 'rm-pq-03', amenityId: 'am-wifi',      isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-ac',        isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-pool',      isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-seaview',   isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-bbq',       isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-breakfast', isFeatured: true,  isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-tv',        isFeatured: false, isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-fridge',    isFeatured: false, isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-bathtub',   isFeatured: false, isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-safe',      isFeatured: false, isFree: true },
    { roomId: 'rm-pq-03', amenityId: 'am-parking',   isFeatured: false, isFree: true },
  ];

  for (const ra of roomAmenities) {
    await prisma.roomAmenity.upsert({
      where: { roomId_amenityId: { roomId: ra.roomId, amenityId: ra.amenityId } },
      update: {},
      create: ra as any,
    });
  }

  // ─── Vouchers ────────────────────────────────────────────────────────────────
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
  console.log('   3 branches | 9 rooms | 34 images | 82 amenity links | vouchers');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
