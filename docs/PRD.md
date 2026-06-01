# PRODUCT REQUIREMENTS DOCUMENT

## Website Đặt Phòng Chuỗi Homestay

**Theme:** Ba.Li | **Version:** 1.0 | **Ngày:** 16/05/2026 | **Tác giả:** BA — Claude Sonnet 4.6

---

| Hạng mục      | Chi tiết                          |
| ------------- | --------------------------------- |
| Tên sản phẩm  | Website Đặt Phòng Chuỗi Homestay  |
| Phiên bản PRD | 1.0                               |
| Ngày tạo      | 16/05/2026                        |
| Trạng thái    | Draft — Sẵn sàng để dev           |
| Tech Stack    | Next.js 14 + NestJS + PostgreSQL  |
| Deploy        | VPS Ubuntu (Nginx + PM2 + Docker) |
| Domain chính  | bachlinh.com.vn                   |
| Domain admin  | admin.bachlinh.com.vn             |

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc & Tech Stack](#2-kiến-trúc--tech-stack)
3. [Database Schema](#3-database-schema-postgresql)
4. [API Endpoints](#4-api-endpoints-nestjs)
5. [Frontend — Website khách hàng](#5-frontend--website-khách-hàng-nextjs-14)
6. [Admin Dashboard](#6-admin-dashboard-adminyourdomainvn)
7. [Yêu cầu phi chức năng](#7-yêu-cầu-phi-chức-năng)
8. [Tích hợp VNPay](#8-tích-hợp-vnpay)
9. [Deployment — VPS Ubuntu](#9-deployment--vps-ubuntu)
10. [Biến môi trường](#10-biến-môi-trường-env)
11. [Lộ trình phát triển](#11-lộ-trình-phát-triển)
12. [Phụ lục — Checklist cho Claude CLI](#12-phụ-lục--checklist-cho-claude-cli)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu

Xây dựng website đặt phòng trực tuyến cho chuỗi homestay với hơn 20 phòng tại hơn 5 chi nhánh, cho phép khách hàng đặt phòng **theo giờ** (tùy chọn số giờ) hoặc **theo ngày**, tích hợp thanh toán VNPay và Google Maps, giao diện song ngữ Việt–Anh theo phong cách gorio.vn với màu chủ đạo **Ba.Li**.

### 1.2 Phạm vi

| Module             | Mô tả                                                  | Ưu tiên |
| ------------------ | ------------------------------------------------------ | ------- |
| Website khách hàng | Trang tìm phòng, chi tiết phòng, đặt phòng, thanh toán | P0      |
| Admin Dashboard    | Quản lý phòng, booking, voucher, báo cáo               | P0      |
| REST API (NestJS)  | Backend xử lý nghiệp vụ, kết nối DB                    | P0      |
| Auth System        | JWT cho khách có tài khoản + guest flow                | P0      |
| VNPay Integration  | Thanh toán online qua cổng VNPay                       | P0      |
| Google Maps        | Hiển thị vị trí từng chi nhánh                         | P1      |
| Voucher System     | Tạo, quản lý và áp dụng mã giảm giá                    | P1      |
| Revenue Reports    | Dashboard báo cáo doanh thu theo ngày/tháng/năm        | P1      |

### 1.3 Định nghĩa thuật ngữ

| Thuật ngữ             | Định nghĩa                                    |
| --------------------- | --------------------------------------------- |
| Branch / Chi nhánh    | Một cơ sở homestay tại một địa điểm cụ thể    |
| Room / Phòng          | Đơn vị cho thuê thuộc một chi nhánh           |
| Booking               | Giao dịch đặt phòng của khách hàng            |
| Guest booking         | Đặt phòng không cần tài khoản                 |
| Time slot / Khung giờ | Khoảng thời gian thuê theo giờ được gợi ý     |
| Voucher               | Mã giảm giá áp dụng khi đặt phòng             |
| Superhost             | Host có đánh giá cao, hiển thị badge đặc biệt |

---

## 2. KIẾN TRÚC & TECH STACK

### 2.1 Tổng quan

| Layer            | Technology            | Version | Ghi chú                    |
| ---------------- | --------------------- | ------- | -------------------------- |
| Frontend         | Next.js (App Router)  | 14.x    | SSR + SSG, SEO tốt         |
| UI Library       | Tailwind CSS          | 3.x     | Utility-first CSS          |
| Component        | shadcn/ui             | Latest  | Accessible components      |
| Backend          | NestJS                | 10.x    | TypeScript, modular        |
| ORM              | Prisma                | 5.x     | Type-safe DB access        |
| Database         | PostgreSQL            | 15.x    | ACID, enterprise-grade     |
| Auth             | JWT + Passport.js     | —       | Access + Refresh token     |
| Cache            | Redis                 | 7.x     | Session, rate limiting     |
| File Storage     | MinIO / S3-compatible | —       | Lưu ảnh phòng              |
| Payment          | VNPay SDK             | Latest  | QR + thẻ nội địa + quốc tế |
| Maps             | Google Maps JS API    | Weekly  | Embed bản đồ chi nhánh     |
| Process Manager  | PM2                   | Latest  | Quản lý Node process       |
| Reverse Proxy    | Nginx                 | 1.24+   | SSL termination, routing   |
| Containerization | Docker + Compose      | 24.x    | Dev & prod environment     |
| CI/CD            | GitHub Actions        | —       | Auto deploy lên VPS        |

### 2.2 Cấu trúc project (Monorepo)

```
homestay-app/
├── apps/
│   ├── web/          # Next.js 14 — Website khách hàng (port 3000)
│   ├── admin/        # Next.js 14 — Admin dashboard (port 3001)
│   └── api/          # NestJS — REST API (port 4000)
├── packages/
│   ├── ui/           # Shared components (shadcn/ui)
│   ├── types/        # Shared TypeScript types & DTOs
│   └── utils/        # Shared utilities & helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
│   └── nginx.conf
└── .github/
    └── workflows/
        └── deploy.yml
```

### 2.3 Nginx routing

| Domain                  | Proxy đến    | Ghi chú                      |
| ----------------------- | ------------ | ---------------------------- |
| `bachlinh.com.vn`       | `web:3000`   | Website khách hàng (Next.js) |
| `admin.bachlinh.com.vn` | `admin:3001` | Admin dashboard (Next.js)    |
| `api.bachlinh.com.vn`   | `api:4000`   | NestJS REST API              |
| `cdn.bachlinh.com.vn`   | `minio:9000` | Static files / ảnh phòng     |

---

## 3. DATABASE SCHEMA (PostgreSQL)

### 3.1 Entity Relationship

```
Branch (1) ──── (N) Room
Room   (1) ──── (N) Booking
Room   (1) ──── (N) RoomImage
Room   (1) ──── (N) RoomAmenity
Room   (1) ──── (N) TimeSlotSuggestion
Room   (1) ──── (N) CancellationPolicy
User   (1) ──── (N) Booking
User   (1) ──── (N) Review
Booking (1) ─── (1) Payment
Booking (1) ─── (1) Review
Voucher (1) ─── (N) Booking
```

### 3.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────

enum RoomStatus {
  active
  maintenance
  inactive
}

enum BookingType {
  hourly
  daily
}

enum PaymentMethod {
  vnpay
  cash
}

enum PaymentStatus {
  pending
  paid
  failed
  refunded
}

enum BookingStatus {
  pending
  confirmed
  checked_in
  completed
  cancelled
}

enum DiscountType {
  percentage
  fixed_amount
}

enum UserRole {
  customer
  admin
}

// ─── MODELS ──────────────────────────────────────────

model Branch {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name           String   @db.VarChar(255)
  name_en        String?  @db.VarChar(255)
  address        String
  city           String   @db.VarChar(100)
  latitude       Decimal? @db.Decimal(10, 8)
  longitude      Decimal? @db.Decimal(11, 8)
  phone          String?  @db.VarChar(20)
  description    String?
  description_en String?
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now()) @db.Timestamptz
  updated_at     DateTime @updatedAt @db.Timestamptz

  rooms Room[]

  @@map("branches")
}

model Room {
  id                    String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  branch_id             String     @db.Uuid
  name                  String     @db.VarChar(255)
  name_en               String?    @db.VarChar(255)
  description           String?
  description_en        String?
  room_number           String     @db.VarChar(20)
  floor                 Int?
  capacity              Int        @default(2)
  price_per_hour        Decimal    @db.Decimal(12, 2)
  price_per_hour_original Decimal? @db.Decimal(12, 2)
  price_per_day         Decimal    @db.Decimal(12, 2)
  price_per_day_original Decimal?  @db.Decimal(12, 2)
  min_hours             Int        @default(2)
  extra_hour_price      Decimal?   @db.Decimal(12, 2)
  extra_person_price    Decimal?   @db.Decimal(12, 2)
  check_in_time         String     @default("14:00") @db.VarChar(5)
  check_out_time        String     @default("11:00") @db.VarChar(5)
  allow_hourly          Boolean    @default(true)
  status                RoomStatus @default(active)
  is_featured           Boolean    @default(false)
  is_guest_favorite     Boolean    @default(false)
  rating_avg            Decimal    @default(0) @db.Decimal(3, 2)
  rating_count          Int        @default(0)
  created_at            DateTime   @default(now()) @db.Timestamptz
  updated_at            DateTime   @updatedAt @db.Timestamptz

  branch              Branch                @relation(fields: [branch_id], references: [id])
  images              RoomImage[]
  amenities           RoomAmenity[]
  time_slot_suggestions TimeSlotSuggestion[]
  cancellation_policies CancellationPolicy[]
  bookings            Booking[]
  reviews             Review[]

  @@map("rooms")
}

model RoomImage {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  room_id    String   @db.Uuid
  url        String
  sort_order Int      @default(0)
  is_cover   Boolean  @default(false)
  created_at DateTime @default(now()) @db.Timestamptz

  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@map("room_images")
}

model RoomAmenity {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  room_id     String   @db.Uuid
  name        String   @db.VarChar(100)
  name_en     String?  @db.VarChar(100)
  icon        String?  @db.VarChar(50)
  is_featured Boolean  @default(false)
  is_free     Boolean  @default(true)
  price       Decimal? @db.Decimal(12, 2)
  created_at  DateTime @default(now()) @db.Timestamptz

  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@map("room_amenities")
}

model TimeSlotSuggestion {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  room_id        String   @db.Uuid
  label          String   @db.VarChar(100)
  start_time     String   @db.VarChar(5)
  end_time       String   @db.VarChar(5)
  price_override Decimal? @db.Decimal(12, 2)
  price_original Decimal? @db.Decimal(12, 2)
  day_of_week    Int?     // 0=Sun, 1=Mon ... 6=Sat, null = mọi ngày
  is_active      Boolean  @default(true)

  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@map("time_slot_suggestions")
}

model CancellationPolicy {
  id                 String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  room_id            String  @db.Uuid
  days_before        Int
  refund_percentage  Int
  description        String?
  description_en     String?

  room Room @relation(fields: [room_id], references: [id], onDelete: Cascade)

  @@map("cancellation_policies")
}

model User {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email               String?  @unique @db.VarChar(255)
  phone               String?  @unique @db.VarChar(20)
  password_hash       String?
  full_name           String   @db.VarChar(255)
  role                UserRole @default(customer)
  is_verified         Boolean  @default(false)
  refresh_token_hash  String?
  created_at          DateTime @default(now()) @db.Timestamptz
  updated_at          DateTime @updatedAt @db.Timestamptz

  bookings Booking[]
  reviews  Review[]

  @@map("users")
}

model Voucher {
  id                  String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code                String       @unique @db.VarChar(50)
  description         String?
  discount_type       DiscountType
  discount_value      Decimal      @db.Decimal(12, 2)
  max_discount_amount Decimal?     @db.Decimal(12, 2)
  min_booking_amount  Decimal      @default(0) @db.Decimal(12, 2)
  usage_limit         Int?
  used_count          Int          @default(0)
  valid_from          DateTime     @db.Timestamptz
  valid_until         DateTime     @db.Timestamptz
  is_active           Boolean      @default(true)
  created_at          DateTime     @default(now()) @db.Timestamptz

  bookings Booking[]

  @@map("vouchers")
}

model Booking {
  id             String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_code   String        @unique @db.VarChar(20)
  room_id        String        @db.Uuid
  user_id        String?       @db.Uuid
  booking_type   BookingType
  check_in       DateTime      @db.Timestamptz
  check_out      DateTime      @db.Timestamptz
  num_hours      Int?
  num_guests     Int           @default(1)
  guest_name     String        @db.VarChar(255)
  guest_phone    String        @db.VarChar(20)
  guest_email    String?       @db.VarChar(255)
  guest_note     String?
  base_amount    Decimal       @db.Decimal(12, 2)
  discount_amount Decimal      @default(0) @db.Decimal(12, 2)
  extra_amount   Decimal       @default(0) @db.Decimal(12, 2)
  total_amount   Decimal       @db.Decimal(12, 2)
  voucher_id     String?       @db.Uuid
  voucher_code   String?       @db.VarChar(50)
  payment_method PaymentMethod
  payment_status PaymentStatus @default(pending)
  booking_status BookingStatus @default(pending)
  cancel_reason  String?
  refund_amount  Decimal?      @db.Decimal(12, 2)
  admin_note     String?
  created_at     DateTime      @default(now()) @db.Timestamptz
  updated_at     DateTime      @updatedAt @db.Timestamptz

  room    Room     @relation(fields: [room_id], references: [id])
  user    User?    @relation(fields: [user_id], references: [id])
  voucher Voucher? @relation(fields: [voucher_id], references: [id])
  payment Payment?
  review  Review?

  @@map("bookings")
}

model Payment {
  id               String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_id       String        @unique @db.Uuid
  gateway          PaymentMethod
  gateway_txn_id   String?       @db.VarChar(255)
  gateway_response Json?
  amount           Decimal       @db.Decimal(12, 2)
  status           PaymentStatus @default(pending)
  paid_at          DateTime?     @db.Timestamptz
  created_at       DateTime      @default(now()) @db.Timestamptz
  updated_at       DateTime      @updatedAt @db.Timestamptz

  booking Booking @relation(fields: [booking_id], references: [id])

  @@map("payments")
}

model Review {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_id String   @unique @db.Uuid
  user_id    String   @db.Uuid
  room_id    String   @db.Uuid
  rating     Int      // 1-5
  comment    String?
  is_visible Boolean  @default(true)
  created_at DateTime @default(now()) @db.Timestamptz

  booking Booking @relation(fields: [booking_id], references: [id])
  user    User    @relation(fields: [user_id], references: [id])
  room    Room    @relation(fields: [room_id], references: [id])

  @@map("reviews")
}
```

---

## 4. API ENDPOINTS (NestJS)

> **Base URL:** `https://api.bachlinh.com.vn/api`
> **Auth:** `Bearer <access_token>` trong header `Authorization`

### 4.1 Authentication — `/auth`

| Method | Endpoint         | Auth   | Mô tả                                               |
| ------ | ---------------- | ------ | --------------------------------------------------- |
| POST   | `/auth/register` | Public | Đăng ký tài khoản (email/phone + password)          |
| POST   | `/auth/login`    | Public | Đăng nhập → trả về `access_token` + `refresh_token` |
| POST   | `/auth/refresh`  | Public | Làm mới `access_token` bằng `refresh_token`         |
| POST   | `/auth/logout`   | Bearer | Thu hồi refresh_token                               |
| GET    | `/auth/me`       | Bearer | Lấy thông tin user hiện tại                         |

### 4.2 Branches — `/branches`

| Method | Endpoint        | Auth   | Mô tả                                           |
| ------ | --------------- | ------ | ----------------------------------------------- |
| GET    | `/branches`     | Public | Danh sách chi nhánh. Query: `city`, `is_active` |
| GET    | `/branches/:id` | Public | Chi tiết chi nhánh + Google Maps embed URL      |
| POST   | `/branches`     | Admin  | Tạo chi nhánh mới                               |
| PATCH  | `/branches/:id` | Admin  | Cập nhật chi nhánh                              |
| DELETE | `/branches/:id` | Admin  | Xóa chi nhánh (soft delete `is_active=false`)   |

### 4.3 Rooms — `/rooms`

| Method | Endpoint                                | Auth   | Mô tả                                                                                                                           |
| ------ | --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/rooms`                                | Public | Danh sách phòng. Query: `branch_id`, `type` (hourly\|daily), `check_in`, `check_out`, `amenities`, `price_max`, `page`, `limit` |
| GET    | `/rooms/:id`                            | Public | Chi tiết phòng + amenities + images + time_slots + policies + reviews                                                           |
| GET    | `/rooms/:id/availability`               | Public | Kiểm tra phòng trống theo date range                                                                                            |
| GET    | `/rooms/:id/time-slots?date=2026-05-16` | Public | Gợi ý khung giờ theo ngày cụ thể                                                                                                |
| POST   | `/rooms`                                | Admin  | Tạo phòng mới                                                                                                                   |
| PATCH  | `/rooms/:id`                            | Admin  | Cập nhật thông tin phòng                                                                                                        |
| DELETE | `/rooms/:id`                            | Admin  | Xóa phòng (soft delete)                                                                                                         |
| POST   | `/rooms/:id/images`                     | Admin  | Upload ảnh phòng (multipart/form-data)                                                                                          |
| PATCH  | `/rooms/:id/images/reorder`             | Admin  | Sắp xếp lại thứ tự ảnh                                                                                                          |
| DELETE | `/rooms/:id/images/:imgId`              | Admin  | Xóa ảnh phòng                                                                                                                   |

### 4.4 Bookings — `/bookings`

| Method | Endpoint               | Auth          | Mô tả                                                                                                                         |
| ------ | ---------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/bookings`            | Public        | Tạo booking mới                                                                                                               |
| GET    | `/bookings/code/:code` | Public        | Tra cứu booking bằng `booking_code`                                                                                           |
| GET    | `/bookings/:id`        | Public        | Chi tiết booking                                                                                                              |
| POST   | `/bookings/:id/cancel` | Bearer/Public | Yêu cầu hủy booking                                                                                                           |
| GET    | `/bookings/my`         | Bearer        | Lịch sử booking của user đăng nhập                                                                                            |
| GET    | `/bookings`            | Admin         | Danh sách tất cả booking. Filter: `status`, `room_id`, `branch_id`, `payment_method`, `date_from`, `date_to`, `page`, `limit` |
| PATCH  | `/bookings/:id/status` | Admin         | Cập nhật `booking_status`                                                                                                     |
| PATCH  | `/bookings/:id/refund` | Admin         | Xử lý hoàn tiền thủ công                                                                                                      |
| GET    | `/bookings/export/csv` | Admin         | Export CSV theo bộ lọc hiện tại                                                                                               |

**Body POST `/bookings`:**

```json
{
  "room_id": "uuid",
  "booking_type": "hourly | daily",
  "check_in": "2026-05-16T14:00:00+07:00",
  "check_out": "2026-05-16T17:00:00+07:00",
  "num_hours": 3,
  "num_guests": 2,
  "guest_name": "Nguyễn Văn A",
  "guest_phone": "0901234567",
  "guest_email": "a@email.com",
  "guest_note": "Ghi chú...",
  "voucher_code": "SUMMER30",
  "payment_method": "vnpay | cash"
}
```

### 4.5 Payments — `/payments`

| Method | Endpoint                   | Auth         | Mô tả                                              |
| ------ | -------------------------- | ------------ | -------------------------------------------------- |
| POST   | `/payments/vnpay/create`   | Public       | Tạo URL thanh toán VNPay từ `booking_id`           |
| GET    | `/payments/vnpay/callback` | Public       | VNPay redirect sau thanh toán — verify & update DB |
| POST   | `/payments/vnpay/ipn`      | Public       | VNPay IPN webhook (xác nhận bất đồng bộ)           |
| GET    | `/payments/:bookingId`     | Bearer/Admin | Lấy thông tin payment của booking                  |

### 4.6 Vouchers — `/vouchers`

| Method | Endpoint             | Auth   | Mô tả                                   |
| ------ | -------------------- | ------ | --------------------------------------- |
| POST   | `/vouchers/validate` | Public | Kiểm tra mã voucher + tính số tiền giảm |
| GET    | `/vouchers`          | Admin  | Danh sách vouchers                      |
| POST   | `/vouchers`          | Admin  | Tạo voucher mới                         |
| PATCH  | `/vouchers/:id`      | Admin  | Cập nhật voucher                        |
| DELETE | `/vouchers/:id`      | Admin  | Xóa voucher                             |

**Body POST `/vouchers/validate`:**

```json
{
  "code": "SUMMER30",
  "booking_amount": 490000
}
```

### 4.7 Reports — `/reports` _(Admin only)_

| Method | Endpoint                                     | Mô tả                                         |
| ------ | -------------------------------------------- | --------------------------------------------- |
| GET    | `/reports/revenue/daily?date=2026-05-16`     | Doanh thu ngày cụ thể                         |
| GET    | `/reports/revenue/monthly?year=2026&month=5` | Doanh thu tháng                               |
| GET    | `/reports/revenue/yearly?year=2026`          | Doanh thu năm (chart 12 tháng)                |
| GET    | `/reports/revenue/by-branch?from=...&to=...` | Doanh thu phân chia theo chi nhánh            |
| GET    | `/reports/bookings/summary`                  | Tổng hợp: tổng, pending, completed, cancelled |
| GET    | `/reports/rooms/occupancy?from=...&to=...`   | Tỷ lệ lấp đầy theo phòng                      |

### 4.8 Reviews — `/reviews`

| Method | Endpoint                                | Auth   | Mô tả                                           |
| ------ | --------------------------------------- | ------ | ----------------------------------------------- |
| GET    | `/reviews/room/:roomId?page=1&limit=10` | Public | Danh sách reviews của phòng                     |
| POST   | `/reviews`                              | Bearer | Gửi đánh giá (cần `booking_status = completed`) |
| DELETE | `/reviews/:id`                          | Admin  | Xóa review vi phạm                              |

---

## 5. FRONTEND — WEBSITE KHÁCH HÀNG (Next.js 14)

### 5.1 Cấu trúc routes

| Route                   | Page Component        | Mô tả                                                         |
| ----------------------- | --------------------- | ------------------------------------------------------------- |
| `/`                     | `HomePage`            | Hero search + phòng nổi bật + khung giờ gợi ý                 |
| `/rooms`                | `RoomsPage`           | Danh sách phòng với filter chips + 2-column grid              |
| `/rooms/[id]`           | `RoomDetailPage`      | Chi tiết phòng: ảnh, amenities, policies, reviews, time slots |
| `/booking/[roomId]`     | `BookingPage`         | Form đặt phòng (giờ/ngày, thông tin, voucher)                 |
| `/booking/[id]/confirm` | `ConfirmPage`         | Tóm tắt đơn + chọn phương thức thanh toán                     |
| `/booking/[id]/success` | `SuccessPage`         | Thành công — hiển thị mã booking                              |
| `/payment/callback`     | `PaymentCallbackPage` | VNPay redirect — verify & redirect                            |
| `/track?code=HMS-xxx`   | `TrackBookingPage`    | Tra cứu booking bằng mã (public)                              |
| `/my-bookings`          | `MyBookingsPage`      | Lịch sử đặt phòng (auth required)                             |
| `/my-bookings/[id]`     | `BookingDetailPage`   | Chi tiết booking của user                                     |
| `/auth/login`           | `LoginPage`           | Đăng nhập                                                     |
| `/auth/register`        | `RegisterPage`        | Đăng ký tài khoản                                             |

### 5.2 Trang chủ (`/`)

#### Hero Section

- **Nền:** `#0D1B2A` (ocean dark navy), full width
- **Eyebrow:** `🌊 Đặt phòng linh hoạt theo giờ & ngày` — màu `#90E0EF`
- **Tiêu đề:** Font 28–32px, bold, trắng, 2 dòng
- **Tab chuyển đổi:** `[Theo giờ]` `[Theo ngày]` — pill button, active bg `#00B4D8`
- **Search box** (nền `rgba(255,255,255,0.06)`, border `rgba(144,224,239,0.2)`):
  - Trường 1: Chi nhánh (dropdown danh sách branch)
  - Trường 2: Ngày & Giờ nhận phòng (date + time picker)
  - Trường 3: Số giờ thuê (stepper, nếu tab "theo giờ") / Ngày trả phòng (nếu tab "theo ngày")
- **Nút:** `Tìm phòng trống` — full width, bg `#00B4D8`, border-radius 10px

#### Filter chips (ngang, scroll ẩn scrollbar)

```
[Tất cả] [Theo giờ] [Theo ngày] [Dưới 500k] [Ban công] [Bồn tắm] [Duplex] [Gác xép] [🔧]
```

- Chip default: border `#DCE8F0`, bg white, text `#556677`
- Chip active: border `#00B4D8`, bg `#E6F4FB`, text `#0077B6`

#### Room listing — 2-column grid

- Ảnh tỷ lệ `1:1`, `border-radius: 12px`, carousel dots phía dưới
- Heart button góc trên phải (yêu thích — auth required)
- Badge `Được khách yêu thích` nếu `is_guest_favorite = true`
- Badge loại thuê: `Theo giờ` (blue) / `Theo ngày` (green) — overlay góc dưới trái
- Địa chỉ ngắn + ⭐ `rating_avg (rating_count)`
- Tên phòng, max 2 dòng, `font-weight: 500`
- Giá: **490.000₫** ~~590.000₫~~

### 5.3 Trang chi tiết phòng (`/rooms/[id]`)

| Section                  | Nội dung chi tiết                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Hero image**           | Full-width carousel tối đa 10 ảnh, counter `1/N` góc dưới phải, back button góc trên trái                |
| **Room title**           | Tên phòng, specs: `1 bedroom · 1 bed · 1 bathroom · 1 kitchen`                                           |
| **Host info**            | Avatar chữ cái màu `#00B4D8`, tên host, badge Superhost, số tháng kinh nghiệm                            |
| **3 Highlights**         | Self check-in icon / Cho phép đặt theo giờ icon / Standard time frame (14:00 – 11:00)                    |
| **Amenities**            | Grid 2 cột, hiển thị 6 tiện ích chính, nút `Hiển thị thêm (N)`                                           |
| **Featured amenities**   | Ảnh thực tế + tên tiện ích + `Miễn phí` / `Có phí`                                                       |
| **Description**          | Mô tả phòng (VI/EN theo ngôn ngữ hiện tại), nút `Đọc thêm` nếu dài                                       |
| **Vị trí**               | Google Maps embed (`<iframe>`) + tên quận/huyện                                                          |
| **Nội quy & chính sách** | Gửi xe máy / Gửi ô tô / Giá theo giờ / Lưu ý trải nghiệm (✓/✗) / Nội quy / Chính sách hủy                |
| **Reviews**              | Tab: `Đánh giá` \| `Hồ sơ Host`. Card: avatar chữ cái + tên + ngày + ⭐⭐⭐⭐⭐ + text + `hiển thị thêm` |
| **Gợi ý khung giờ**      | 2–3 time slots cho ngày hiện tại: ⏱ `14:00 – 17:00` · ~~490.000₫~~ **390.000₫** · `[Đặt ngay]`           |
| **Sticky bottom bar**    | ~~590.000₫~~ **490.000₫** · `từ 16/05 – 17/05` · `[Thay đổi]` · `[Đặt phòng]`                            |

### 5.4 Form đặt phòng (`/booking/[roomId]`)

#### Theo giờ

- Chọn ngày (date picker, không cho chọn ngày quá khứ)
- Chọn giờ vào (time picker, bước 30 phút)
- Chọn số giờ (stepper: `min_hours` → 12h)
- Chọn số khách (stepper: 1 → `capacity`)
- **Tính giá:** `base = price_per_hour × num_hours + (extra_person_price × max(0, num_guests - capacity_base))`

#### Theo ngày

- Chọn ngày nhận phòng (date picker)
- Chọn ngày trả phòng (tối thiểu ngày hôm sau)
- Chọn số khách
- **Tính giá:** `base = price_per_day × num_nights`

#### Thông tin khách hàng

- Họ và tên `*`
- Số điện thoại `*`
- Email (tùy chọn)
- Ghi chú cho host (tùy chọn)

#### Voucher

- Input nhập mã + nút `Áp dụng`
- Gọi `POST /vouchers/validate` — hiển thị số tiền giảm ngay (realtime)
- Lỗi inline nếu mã không hợp lệ / hết hạn

#### Tóm tắt đơn

```
Giá phòng:     490.000₫
Giảm giá:      -49.000₫  (voucher SUMMER10)
Phụ phí:       +100.000₫ (thêm 1 người)
─────────────────────────
Tổng cộng:     541.000₫
```

### 5.5 Trang xác nhận & thanh toán (`/booking/[id]/confirm`)

| Phương thức  | Flow                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **VNPay**    | `POST /payments/vnpay/create` → redirect VNPay → callback `/payment/callback` → `/booking/[id]/success` |
| **Tiền mặt** | `POST /bookings` với `payment_method=cash` → `booking_status=pending` → hiển thị mã booking             |

### 5.6 Design Tokens — Ba.Li Theme

```css
/* ─── Colors ─── */
--color-primary: #00b4d8; /* Buttons, active states, icons accent */
--color-primary-dark: #0077b6; /* Hover states, headings, links */
--color-primary-light: #90e0ef; /* Muted text trên nền tối, badges */
--color-hero-bg: #0d1b2a; /* Hero section background */
--color-hero-card: rgba(255, 255, 255, 0.06); /* Search form */
--color-card-bg: #ffffff; /* Room cards, detail sections */
--color-surface: #f5f8fa; /* Page background, alternating rows */
--color-border: #dce8f0; /* Borders, dividers */
--color-text-primary: #1a2a3a; /* Body text chính */
--color-text-secondary: #8ea3b3; /* Muted text, địa chỉ, ngày tháng */
--color-success: #2ecc71; /* Available badge, ✓ icon */
--color-danger: #e24b4a; /* ✗ icon, error states */
--color-warning: #ff9500; /* Star rating */

/* ─── Typography ─── */
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-size-xs: 11px;
--font-size-sm: 13px;
--font-size-base: 15px;
--font-size-lg: 17px;
--font-size-xl: 20px;
--font-size-2xl: 24px;

/* ─── Spacing & Radius ─── */
--radius-card: 12px;
--radius-pill: 24px;
--radius-btn: 9px;
--radius-badge: 6px;
```

### 5.7 i18n — Song ngữ

- **Package:** `next-intl`
- **Languages:** `vi` (default), `en`
- **Toggle:** nút `VI | EN` trên navbar
- **Scope:** tất cả label UI, placeholder, thông báo lỗi, email template
- **Content phòng:** dùng `name` / `name_en`, `description` / `description_en` từ DB

---

## 6. ADMIN DASHBOARD (`admin.bachlinh.com.vn`)

### 6.1 Routes

| Route                  | Trang                | Chức năng                                                      |
| ---------------------- | -------------------- | -------------------------------------------------------------- |
| `/`                    | Dashboard            | Metric cards + revenue chart + recent bookings                 |
| `/branches`            | Danh sách chi nhánh  | CRUD chi nhánh                                                 |
| `/branches/[id]/rooms` | Phòng theo chi nhánh | Danh sách phòng, thêm mới                                      |
| `/rooms/[id]`          | Chi tiết phòng admin | Chỉnh sửa phòng, upload ảnh, cấu hình giá/tiện nghi/time slots |
| `/bookings`            | Quản lý booking      | Danh sách, filter, xác nhận, hủy, hoàn tiền                    |
| `/bookings/[id]`       | Chi tiết booking     | Xem đầy đủ, đổi trạng thái, ghi chú admin                      |
| `/vouchers`            | Quản lý voucher      | CRUD voucher, xem thống kê dùng                                |
| `/reports`             | Báo cáo doanh thu    | Chart ngày/tháng/năm + filter chi nhánh                        |
| `/reviews`             | Quản lý đánh giá     | Xem, xóa review vi phạm                                        |
| `/settings`            | Cài đặt              | Thông tin admin, đổi mật khẩu                                  |

### 6.2 Dashboard — Metric cards

| Card                 | Data                                                      | So sánh       |
| -------------------- | --------------------------------------------------------- | ------------- |
| Doanh thu hôm nay    | `SUM(total_amount) WHERE date=today AND status=confirmed` | vs hôm qua    |
| Booking hôm nay      | `COUNT bookings WHERE date=today`                         | vs hôm qua    |
| Phòng đang được thuê | `COUNT bookings WHERE status=checked_in`                  | Live          |
| Tỷ lệ lấp đầy        | `booked_rooms / total_rooms × 100%`                       | vs tuần trước |

### 6.3 Quản lý booking

**Filter bar:** chi nhánh | phòng | trạng thái | phương thức thanh toán | khoảng ngày

**Bảng columns:**

```
Mã booking | Khách hàng | Phòng | Chi nhánh | Check-in | Check-out | Tổng tiền | TT thanh toán | TT booking | Hành động
```

**Hành động từng row:**

- `Xác nhận` (pending → confirmed)
- `Check-in` (confirmed → checked_in)
- `Check-out` (checked_in → completed)
- `Hủy` + nhập lý do
- `Xử lý hoàn tiền` + nhập số tiền
- `Ghi chú admin`
- Export CSV

### 6.4 Quản lý phòng

**Form tạo/sửa phòng:**

- Thông tin cơ bản: tên VI/EN, mô tả VI/EN, chi nhánh, số phòng, tầng, sức chứa
- Giá: giá/giờ, giá gốc/giờ, giá/ngày, giá gốc/ngày, số giờ tối thiểu, giá thêm giờ, giá thêm người
- Cài đặt: cho phép đặt theo giờ, giờ check-in/out, trạng thái, is_featured, is_guest_favorite
- Upload ảnh: drag-and-drop, tối đa 10 ảnh, reorder, đánh dấu ảnh bìa
- Tiện nghi: thêm/xóa tiện nghi, icon picker, đánh dấu nổi bật, miễn phí/có phí
- Gợi ý khung giờ: thêm/xóa time slots với giá override
- Chính sách hủy: cấu hình theo số ngày và % hoàn tiền

### 6.5 Báo cáo doanh thu

- **Tab:** Theo ngày | Theo tháng | Theo năm
- **Chart:** Bar chart (recharts), hiển thị doanh thu
- **Filter:** Tất cả chi nhánh / Chọn chi nhánh cụ thể
- **Số liệu bổ sung:** Tổng booking, Tổng doanh thu, So sánh kỳ trước
- **Table:** Chi tiết từng ngày/tháng bên dưới chart

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| Hạng mục             | Yêu cầu                                                                        | Ghi chú                               |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| **Hiệu năng**        | LCP < 2.5s, FCP < 1.8s                                                         | Next.js SSG + image optimization      |
| **SEO**              | SSR cho `/rooms/[id]`, sitemap.xml, robots.txt, Open Graph tags                | `next-seo` package                    |
| **Mobile**           | Responsive 360px–1440px, touch target ≥ 44px                                   | Tailwind responsive breakpoints       |
| **Ngôn ngữ**         | Song ngữ VI/EN, switch toggle trên navbar                                      | `next-intl`                           |
| **JWT Auth**         | Access token 15 phút, Refresh token 30 ngày (rotate), HttpOnly cookie          | Passport.js + NestJS Guards           |
| **Rate limiting**    | 100 req/min/IP cho public endpoints, 20 req/min cho auth endpoints             | `@nestjs/throttler` + Redis           |
| **Security**         | Helmet.js, CORS whitelist, SQL injection protection (Prisma), XSS sanitization |                                       |
| **HTTPS**            | Let's Encrypt SSL, auto-renew                                                  | Certbot + Nginx                       |
| **Backup DB**        | Daily pg_dump, giữ 30 ngày, upload lên MinIO/S3                                | Cron job                              |
| **Uptime**           | Target 99.5%                                                                   | PM2 cluster mode, Nginx keepalive     |
| **Image**            | Max 10MB/ảnh, JPEG/PNG/WebP, auto-resize → WebP, lưu MinIO                     | Sharp                                 |
| **Payment security** | HTTPS bắt buộc, không lưu thông tin thẻ, verify chữ ký VNPay                   |                                       |
| **Logging**          | Request logs, error logs, payment logs riêng biệt                              | Winston + `winston-daily-rotate-file` |
| **Health check**     | `GET /api/health` trả về 200 OK                                                | PM2 + Nginx upstream check            |

---

## 8. TÍCH HỢP VNPAY

### 8.1 Flow thanh toán

```
Khách chọn VNPay
      ↓
POST /payments/vnpay/create { booking_id }
      ↓
Backend tạo VNPay URL:
  - vnp_Amount = total_amount × 100 (VNPay tính đơn vị VND × 100)
  - vnp_OrderInfo = "Dat phong [booking_code]"
  - vnp_TxnRef = booking_code
  - vnp_ReturnUrl = https://bachlinh.com.vn/payment/callback
  - vnp_IpnUrl = https://api.bachlinh.com.vn/api/payments/vnpay/ipn
  - vnp_SecureHash = HMAC-SHA512(queryString, VNPAY_HASH_SECRET)
      ↓
Backend trả về { paymentUrl }
      ↓
Frontend redirect → paymentUrl (VNPay)
      ↓
Khách thanh toán trên VNPay
      ↓
VNPay redirect → GET /payment/callback?vnp_ResponseCode=00&vnp_SecureHash=...
      ↓
Backend verify vnp_SecureHash
      ↓
Nếu hợp lệ:
  - payment_status = 'paid'
  - booking_status = 'confirmed'
  - Lưu gateway_txn_id, gateway_response
      ↓
VNPay cũng gọi IPN (POST /payments/vnpay/ipn) — xử lý tương tự
      ↓
Frontend hiển thị /booking/[id]/success
```

### 8.2 Biến môi trường VNPay

| Biến                | Mô tả                                                |
| ------------------- | ---------------------------------------------------- |
| `VNPAY_TMN_CODE`    | Mã TMN code từ VNPay merchant portal                 |
| `VNPAY_HASH_SECRET` | Secret key để tạo và verify chữ ký HMAC-SHA512       |
| `VNPAY_URL`         | `https://pay.vnpay.vn/vpcpay.html` (production)      |
| `VNPAY_RETURN_URL`  | `https://bachlinh.com.vn/payment/callback`           |
| `VNPAY_IPN_URL`     | `https://api.bachlinh.com.vn/api/payments/vnpay/ipn` |

> **Lưu ý:** Test với sandbox URL `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` trước khi go-live.

### 8.3 vnp_ResponseCode quan trọng

| Code | Ý nghĩa                                    |
| ---- | ------------------------------------------ |
| `00` | Giao dịch thành công                       |
| `07` | Trừ tiền thành công, giao dịch bị nghi ngờ |
| `09` | Thẻ/tài khoản chưa đăng ký dịch vụ         |
| `24` | Khách hàng hủy giao dịch                   |
| `51` | Tài khoản không đủ số dư                   |
| `65` | Vượt hạn mức giao dịch ngày                |

---

## 9. DEPLOYMENT — VPS UBUNTU

### 9.1 Cấu hình VPS tối thiểu

| Thành phần | Tối thiểu        | Khuyến nghị      |
| ---------- | ---------------- | ---------------- |
| CPU        | 2 vCPU           | 4 vCPU           |
| RAM        | 4 GB             | 8 GB             |
| Storage    | 40 GB SSD        | 80 GB SSD        |
| OS         | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Bandwidth  | 500 GB/tháng     | Unmetered        |

### 9.2 Docker Compose services

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: homestay
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    env_file: .env.prod
    depends_on: [postgres, redis, minio]
    restart: unless-stopped

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    env_file: .env.web.prod
    restart: unless-stopped

  admin:
    build:
      context: ./apps/admin
      dockerfile: Dockerfile.prod
    env_file: .env.admin.prod
    restart: unless-stopped

  nginx:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - certbot_data:/var/www/certbot
    depends_on: [web, admin, api]
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
  certbot_data:
```

### 9.3 Nginx config

```nginx
# nginx/nginx.conf (rút gọn)
upstream web_app   { server web:3000; }
upstream admin_app { server admin:3001; }
upstream api_app   { server api:4000; }

server {
    listen 443 ssl;
    server_name bachlinh.com.vn;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    location / { proxy_pass http://web_app; }
}

server {
    listen 443 ssl;
    server_name admin.bachlinh.com.vn;
    # ... ssl config
    location / { proxy_pass http://admin_app; }
}

server {
    listen 443 ssl;
    server_name api.bachlinh.com.vn;
    # ... ssl config
    location / { proxy_pass http://api_app; }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### 9.4 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/homestay-app
            git pull origin main
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d
            docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
            docker system prune -f
```

---

## 10. BIẾN MÔI TRƯỜNG (.env)

### 10.1 API — NestJS (`apps/api/.env`)

```env
# App
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://homestay_user:strongpassword@postgres:5432/homestay

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_ACCESS_SECRET=generate-with-openssl-rand-hex-32
JWT_REFRESH_SECRET=generate-with-openssl-rand-hex-32-different
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=strongminiopassword
MINIO_BUCKET=homestay-images

# VNPay
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://bachlinh.com.vn/payment/callback
VNPAY_IPN_URL=https://api.bachlinh.com.vn/api/payments/vnpay/ipn

# CORS
CORS_ORIGINS=https://bachlinh.com.vn,https://admin.bachlinh.com.vn
```

### 10.2 Web Frontend (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=https://api.bachlinh.com.vn/api
NEXT_PUBLIC_SITE_URL=https://bachlinh.com.vn
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...your-key
NEXT_PUBLIC_VNPAY_ENV=production
```

### 10.3 Admin Frontend (`apps/admin/.env`)

```env
NEXT_PUBLIC_API_URL=https://api.bachlinh.com.vn/api
NEXT_PUBLIC_SITE_URL=https://admin.bachlinh.com.vn
```

---

## 11. LỘ TRÌNH PHÁT TRIỂN

| Sprint                  | Thời gian  | Deliverables                                                                       |
| ----------------------- | ---------- | ---------------------------------------------------------------------------------- |
| **Sprint 0** — Setup    | Tuần 1     | Monorepo, Docker Compose, Prisma schema + migrations, Nginx config, CI/CD pipeline |
| **Sprint 1** — Core API | Tuần 2–3   | Auth module, Branches CRUD, Rooms CRUD, Image upload (MinIO), Availability check   |
| **Sprint 2** — Booking  | Tuần 4–5   | Booking API, VNPay integration (sandbox), Cash payment, Voucher validation         |
| **Sprint 3** — Frontend | Tuần 6–8   | HomePage, RoomsPage, RoomDetailPage (full), BookingFlow, SuccessPage               |
| **Sprint 4** — Admin    | Tuần 9–10  | Dashboard metrics, Quản lý booking, Quản lý phòng/chi nhánh, Upload ảnh            |
| **Sprint 5** — Features | Tuần 11–12 | Voucher UI, Reviews, Báo cáo doanh thu, Google Maps embed, i18n VI/EN              |
| **Sprint 6** — Launch   | Tuần 13–14 | SEO optimization, Performance audit, Security review, UAT, Deploy production       |

---

## 12. PHỤ LỤC — CHECKLIST CHO CLAUDE CLI

### Thứ tự coding được khuyến nghị

1. **Prisma schema** (Section 3) — tất cả models, enums, relations
2. **NestJS modules** theo thứ tự:
   - `AuthModule` → `BranchModule` → `RoomModule` → `BookingModule` → `PaymentModule` → `VoucherModule` → `ReportModule` → `ReviewModule`
3. **Next.js web** theo thứ tự:
   - Layout + Navbar + Footer → `HomePage` → `RoomsPage` → `RoomDetailPage` → `BookingPage` → `ConfirmPage` → `SuccessPage` → `TrackBookingPage` → `MyBookingsPage` → Auth pages
4. **Next.js admin** theo thứ tự:
   - Admin layout + Auth guard → `DashboardPage` → `BranchesPage` → `RoomsPage` → `BookingsPage` → `VouchersPage` → `ReportsPage`
5. **VNPay integration** (Section 8) — test sandbox trước
6. **Google Maps** embed component
7. **i18n** với `next-intl` — VI/EN
8. **Deploy** lên VPS (Section 9)

### Prompt mẫu để bắt đầu với Claude CLI

```
Tôi có một PRD chi tiết cho website đặt phòng homestay.
Tech stack: Next.js 14 (App Router) + NestJS 10 + PostgreSQL 15 + Prisma 5.

Hãy bắt đầu với Sprint 0:
1. Tạo cấu trúc monorepo với Turborepo
2. Setup Docker Compose với các services: postgres, redis, minio, api, web, admin, nginx
3. Viết đầy đủ Prisma schema theo spec sau: [paste Section 3]
4. Tạo initial migration

Sau khi xong Sprint 0, báo tôi để chuyển sang Sprint 1 (Auth + Branches + Rooms API).
```

### Checklist trước khi go-live

- [ ] Đổi tất cả secret keys và passwords từ giá trị mặc định
- [ ] Cấu hình SSL certificate (Certbot)
- [ ] Test VNPay với production credentials
- [ ] Cấu hình Google Maps API key với domain restriction
- [ ] Setup backup tự động cho PostgreSQL
- [ ] Cấu hình UFW firewall (chỉ mở 22, 80, 443)
- [ ] Test tất cả flow trên mobile (iOS + Android)
- [ ] Kiểm tra i18n hoàn chỉnh VI/EN
- [ ] Chạy Lighthouse audit (target: Performance > 85, SEO > 95)
- [ ] Review toàn bộ CORS origins
- [ ] Test VNPay IPN callback
- [ ] Verify rate limiting hoạt động

---

_— Hết tài liệu PRD v1.0 — Tác giả: Claude Sonnet 4.6 — 16/05/2026 —_
