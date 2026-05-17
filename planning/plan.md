# Kế hoạch build — Website Đặt Phòng Homestay

> Dựa trên PRD v1.0 (`docs/PRD.md`). Tech stack thực tế: **NestJS 11 + Prisma 7 + Next.js 16**.
> **Chiến lược: Frontend-first** — build toàn bộ UI với mock data trước, sau đó wire-up backend thật.

---

## Quyết định kiến trúc quan trọng

| Vấn đề              | Quyết định                                                         | Lý do                                                             |
| ------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Build order         | **Frontend trước, backend sau**                                    | Validate UX sớm, không bị block bởi API                           |
| Mock data           | File `src/lib/mock/` — shape khớp 100% với API response            | Dễ swap sang real API, không cần refactor component               |
| Admin app           | Tích hợp vào `src/frontend/` dưới route group `(admin)/`           | Boilerplate đã có pattern `cms/`; tránh quản lý 2 Next.js process |
| Prisma field naming | **camelCase** trong model, `@map("snake_case")` cho DB             | Nhất quán với boilerplate và TypeScript idioms                    |
| UUID generation     | `@default(uuid())` (Prisma-side)                                   | Prisma 7 + adapter-pg pattern hiện tại                            |
| Refresh token       | Lưu `refreshTokenHash` vào bảng `users` (bcrypt hash)              | PRD yêu cầu stateful refresh để có thể revoke                     |
| File storage        | MinIO (thêm vào docker-compose)                                    | PRD spec; S3-compatible, tự host                                  |
| Monorepo            | Không dùng Turborepo — giữ cấu trúc `src/backend` + `src/frontend` | Tránh refactor lớn boilerplate hiện tại                           |

---

## Phase 0 — Foundation & Setup ✅

**Mục tiêu:** Định nghĩa data shapes (Prisma schema + TypeScript types) làm nền cho mock data frontend. Infrastructure chưa cần chạy đầy đủ.

### 0.1 Infrastructure ✅

- [x] **`docker-compose.yml`** — Thêm service MinIO:
  ```yaml
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
  ```
  Thêm `minio_data` vào `volumes`. Đổi `POSTGRES_DB: homestay`, `POSTGRES_USER: homestay_user`.

### 0.2 Backend cleanup ✅

- [x] Xóa `src/backend/src/modules/products/` toàn bộ
- [x] Xóa `Post` model và `Product` model khỏi `prisma/schema.prisma`
- [x] Xóa `ProductsModule` khỏi `app.module.ts`
- [x] Cập nhật `src/backend/.env`:
  ```env
  DATABASE_URL=postgresql://homestay_user:@localhost:5432/homestay
  MINIO_ENDPOINT=localhost
  MINIO_PORT=9000
  MINIO_USE_SSL=false
  MINIO_ACCESS_KEY=minioadmin
  MINIO_SECRET_KEY=minioadmin
  MINIO_BUCKET=homestay-images
  VNPAY_TMN_CODE=
  VNPAY_HASH_SECRET=
  VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  VNPAY_RETURN_URL=http://localhost:3000/payment/callback
  VNPAY_IPN_URL=http://localhost:4000/api/v1/payments/vnpay/ipn
  ```

### 0.3 Prisma Schema — Viết lại hoàn toàn ✅

File: `src/backend/prisma/schema.prisma`

> ⚠️ Trong giai đoạn frontend-first: chỉ cần **viết schema** để có TypeScript types cho mock data. Chưa cần chạy migration — đợi đến Phase 5.

Giữ Prisma 7 conventions (adapter-pg, camelCase, `@default(uuid())`).

**Enums cần tạo:**

```
RoomStatus { active, maintenance, inactive }
BookingType { hourly, daily }
PaymentMethod { vnpay, cash }
PaymentStatus { pending, paid, failed, refunded }
BookingStatus { pending, confirmed, checked_in, completed, cancelled }
DiscountType { percentage, fixed_amount }
UserRole { customer, admin }
```

**Models cần tạo** (theo thứ tự dependency):

1. `Branch` — `@@map("branches")` — `name`, `nameEn`, `address`, `city`, `latitude`, `longitude`, `phone`, `description`, `descriptionEn`, `isActive`
2. `Room` — `@@map("rooms")` — đầy đủ fields từ PRD, thêm `deletedAt DateTime?`
3. `RoomImage` — `@@map("room_images")` — `roomId`, `url`, `sortOrder`, `isCover`
4. `RoomAmenity` — `@@map("room_amenities")` — `name`, `nameEn`, `icon`, `isFeatured`, `isFree`, `price`
5. `TimeSlotSuggestion` — `@@map("time_slot_suggestions")` — `label`, `startTime`, `endTime`, `priceOverride`, `priceOriginal`, `dayOfWeek`
6. `CancellationPolicy` — `@@map("cancellation_policies")` — `daysBefore`, `refundPercentage`, `description`, `descriptionEn`
7. `User` — **cập nhật model hiện tại**: thêm `phone`, `fullName`, đổi `role` sang `UserRole`, thêm `refreshTokenHash`, xóa `firstName/lastName`
8. `Voucher` — `@@map("vouchers")` — theo PRD
9. `Booking` — `@@map("bookings")` — `bookingCode` unique, `userId` optional (guest)
10. `Payment` — `@@map("payments")` — `1:1` với `Booking`
11. `Review` — `@@map("reviews")` — `1:1` với `Booking`, `1:N` với `Room`

### 0.4 Frontend Types ✅

File: `src/frontend/src/types/index.ts` — export đầy đủ TypeScript types tương ứng với Prisma models (Room, Branch, Booking, v.v.). Đây là contract giữa frontend mock và backend API thật.

---

## Phase 1 — Frontend: Design System + Layout + Mock Data ✅

**Mục tiêu:** Setup toàn bộ nền tảng frontend. Sau phase này có thể code UI không cần backend.

### 1.1 Setup i18n ✅

**Package:** `next-intl`

```bash
cd src/frontend && pnpm add next-intl
```

Cấu trúc:

```
src/frontend/src/
├── messages/
│   ├── vi.json    ← tất cả string UI tiếng Việt
│   └── en.json    ← tiếng Anh
└── i18n/
    ├── routing.ts   ← defineRouting({ locales: ['vi', 'en'], defaultLocale: 'vi' })
    └── request.ts
```

Route structure: `src/app/[locale]/` — wrap tất cả routes trong locale segment.

### 1.2 Design Tokens — Ocean Blue Theme ✅

File: `src/frontend/src/app/globals.css`

```css
:root {
  --color-primary: #00b4d8;
  --color-primary-dark: #0077b6;
  --color-primary-light: #90e0ef;
  --color-hero-bg: #0d1b2a;
  --color-surface: #f5f8fa;
  --color-border: #dce8f0;
  --color-text-primary: #1a2a3a;
  --color-text-secondary: #8ea3b3;
  --color-success: #2ecc71;
  --color-danger: #e24b4a;
  --color-warning: #ff9500;
  --radius-card: 12px;
  --radius-pill: 24px;
  --radius-btn: 9px;
}
```

Thêm font Inter qua `next/font/google` vào `layout.tsx`.

### 1.3 Mock Data Layer ✅

File: `src/frontend/src/lib/mock/` — dữ liệu mẫu thực tế, shape khớp 100% với API response:

```
src/lib/mock/
├── branches.ts       ← 3 chi nhánh mẫu
├── rooms.ts          ← 6 phòng mẫu với images, amenities, timeSlots, policies
├── bookings.ts       ← bookings mẫu với các status khác nhau
├── vouchers.ts       ← 2-3 voucher mẫu
├── reviews.ts        ← reviews mẫu gắn với bookings
└── index.ts          ← re-export + helper functions
```

File: `src/frontend/src/lib/api-client.ts` — wrapper dùng `NEXT_PUBLIC_USE_MOCK=true/false`:

```typescript
// Nếu NEXT_PUBLIC_USE_MOCK=true → trả mock data (async, delay 200ms để simulate latency)
// Nếu NEXT_PUBLIC_USE_MOCK=false → gọi api.ts thật
export const apiClient = {
  getRooms: (query) =>
    isMock ? mockDelay(filterMockRooms(query)) : api.get("/rooms", query),
  getRoom: (id) =>
    isMock ? mockDelay(findMockRoom(id)) : api.get(`/rooms/${id}`),
  // ... tất cả endpoints
};
```

> **Quy tắc:** Tất cả components chỉ gọi `apiClient`, không bao giờ gọi `api` trực tiếp. Khi backend xong chỉ cần bật `NEXT_PUBLIC_USE_MOCK=false`.

### 1.4 Shared Layout Components ✅

**Navbar** (`src/components/marketing/Navbar.tsx`):

- Logo + links (Tìm phòng, Về chúng tôi)
- Language toggle `VI | EN` → `useRouter` của next-intl
- Auth: đăng nhập → avatar dropdown (Lịch sử đặt phòng, Đăng xuất); chưa đăng nhập → nút `Đăng nhập`
- Mobile: hamburger → sheet/drawer

**Footer** (`src/components/marketing/Footer.tsx`):

- Links, địa chỉ, hotline, social icons, copyright

**Shared UI:**

- `ImageCarousel.tsx` — full-width carousel với CSS scroll snap, counter `1/N`, swipe mobile
- `GoogleMapsEmbed.tsx` — `<iframe>` embed bản đồ
- `PriceDisplay.tsx` — giá với strike-through giá gốc, định dạng VNĐ
- `RatingStars.tsx` — hiển thị ⭐ rating

---

## Phase 2 — Frontend: Trang chủ + Rooms + Room Detail ✅

### 2.1 HomePage (`/`) ✅

File: `src/app/[locale]/(marketing)/page.tsx`

**HeroSection** (`src/components/marketing/HeroSection.tsx`):

- Nền `#0D1B2A`, eyebrow `🌊 Đặt phòng linh hoạt theo giờ & ngày` màu `#90E0EF`
- Tab `[Theo giờ]` / `[Theo ngày]` — pill button, active bg `#00B4D8`
- Search form (nền `rgba(255,255,255,0.06)`, border `rgba(144,224,239,0.2)`):
  - Dropdown chi nhánh (từ `apiClient.getBranches()`)
  - Date + time picker (shadcn `Calendar` + custom time select)
  - Số giờ stepper (tab giờ) hoặc ngày trả phòng (tab ngày)
- Nút `Tìm phòng trống` → `/rooms?branchId=...&type=...&checkIn=...`

**FilterChips** (scroll ngang, ẩn scrollbar):

```
[Tất cả] [Theo giờ] [Theo ngày] [Dưới 500k] [Ban công] [Bồn tắm] [Duplex] [Gác xép]
```

- Default: border `#DCE8F0`, bg white; Active: border `#00B4D8`, bg `#E6F4FB`

**RoomCard** (`src/components/marketing/RoomCard.tsx`):

- Ảnh tỷ lệ 1:1, `border-radius: 12px`, carousel dots, heart button
- Badge `Được khách yêu thích` nếu `isGuestFavorite`
- Badge loại thuê overlay góc dưới trái: `Theo giờ` (blue) / `Theo ngày` (green)
- ⭐ rating, tên phòng, giá với strike-through

**Featured Rooms**: `apiClient.getRooms({ isFeatured: true, limit: 6 })`

### 2.2 RoomsPage (`/rooms`) ✅

File: `src/app/[locale]/(marketing)/rooms/page.tsx`

- Đọc search params (`branchId`, `type`, `checkIn`, `checkOut`, `priceMax`, `page`)
- `apiClient.getRooms(query)` — SSR với Suspense
- 2-column grid mobile, 3-column desktop
- Filter sidebar (desktop) / bottom sheet (mobile): chi nhánh, loại, giá max, tiện nghi
- Pagination component

### 2.3 RoomDetailPage (`/rooms/[id]`) ✅

File: `src/app/[locale]/(marketing)/rooms/[id]/page.tsx` — Server Component

**Sections theo thứ tự PRD 5.3:**

1. `ImageCarousel` — full-width, counter `1/N`, swipe mobile
2. **Room title + specs** — tên, sức chứa, tầng
3. **HostInfo** — avatar chữ cái màu primary, badge Superhost, tháng kinh nghiệm
4. **Highlights** — 3 icon: self check-in / đặt theo giờ / thời gian check-in/out
5. **AmenitiesGrid** — 6 tiện nghi đầu + nút `Hiển thị thêm (N)` → modal
6. **Description** — mô tả theo locale, `Đọc thêm` nếu > 3 dòng
7. `GoogleMapsEmbed` — embed tọa độ chi nhánh
8. **PoliciesSection** — nội quy, chính sách hủy từ `CancellationPolicy[]`
9. **ReviewsSection** — `apiClient.getReviews(roomId)`, pagination (`use client`)
10. **TimeSlotsSection** — `apiClient.getTimeSlots(roomId, date)`, nút `Đặt ngay` cho mỗi slot
11. **StickyBookingBar** — `position: fixed` bottom, giá + `[Đặt phòng]`

**SEO:**

```typescript
export async function generateMetadata({ params }) {
  const room = await apiClient.getRoom(params.id);
  return {
    title: `${room.name} | Homestay`,
    description: room.description,
    openGraph: { images: [room.images[0]?.url] },
  };
}
```

---

## Phase 3 — Frontend: Booking Flow + Auth ✅

### 3.1 BookingPage (`/booking/[roomId]`) ✅

File: `src/app/[locale]/(marketing)/booking/[roomId]/page.tsx` — Client Component

`react-hook-form` + `zod` schema. Hai tab:

- **Theo giờ**: date + time picker + num_hours stepper + num_guests stepper
- **Theo ngày**: check-in + check-out date + num_guests stepper

**Pricing calculator** (realtime, client-side):

```typescript
const calcPrice = (room, { type, numHours, numNights, numGuests }) => {
  const base =
    type === "hourly"
      ? room.pricePerHour * numHours
      : room.pricePerDay * numNights;
  const extra = Math.max(0, numGuests - 1) * (room.extraPersonPrice ?? 0);
  return { base, extra, discount, total: base + extra - discount };
};
```

**VoucherInput**: debounced 500ms → `apiClient.validateVoucher({ code, bookingAmount })`, hiển thị số tiền giảm ngay

**Order summary box:**

```
Giá phòng:     490.000₫
Giảm giá:      -49.000₫
Phụ phí:       +100.000₫
─────────────────────────
Tổng cộng:     541.000₫
```

Submit → `apiClient.createBooking(dto)` → redirect `/booking/[id]/confirm`

### 3.2 ConfirmPage (`/booking/[id]/confirm`) ✅

- Summary đơn readonly
- Chọn thanh toán: `[VNPay]` / `[Tiền mặt]`
- VNPay: `apiClient.createVnpayPayment(bookingId)` → `window.location = paymentUrl`
- Cash: cập nhật status → redirect `/booking/[id]/success`

### 3.3 PaymentCallbackPage (`/payment/callback`) ✅

- Đọc search params từ VNPay redirect
- `vnp_ResponseCode === '00'` → redirect `/booking/[id]/success`
- Khác → hiển thị error + link thử lại

### 3.4 SuccessPage (`/booking/[id]/success`) ✅

- Hiển thị `bookingCode` to và nổi bật
- Chi tiết đặt phòng
- Nếu guest: gợi ý đăng ký tài khoản

### 3.5 TrackBookingPage (`/track`) ✅

- Input mã `HMS-XXXX` + nút `Tra cứu`
- `apiClient.getBookingByCode(code)` → hiển thị trạng thái, phòng, thời gian

### 3.6 MyBookingsPage + BookingDetailPage ✅

- `GET /bookings/my` → list lịch sử (auth required, redirect `/login` nếu chưa đăng nhập)
- Detail: có nút `Hủy đặt phòng` nếu status còn `pending/confirmed`

### 3.7 Auth Pages

`src/app/[locale]/(auth)/login/page.tsx`:

- Login bằng email hoặc số điện thoại
- zod validation

`src/app/[locale]/(auth)/register/page.tsx`:

- `fullName`, `email` hoặc `phone`, `password`, `confirmPassword`

---

## Phase 4 — Frontend: Admin Dashboard

### 4.1 Layout + Auth Guard

File: `src/app/[locale]/(admin)/layout.tsx`

- Check `session.user.role !== 'admin'` → redirect `/`
- Sidebar: Dashboard, Chi nhánh, Phòng, Booking, Voucher, Báo cáo, Đánh giá
- Topbar: breadcrumb + avatar + logout

Route structure:

```
src/app/[locale]/(admin)/
├── dashboard/page.tsx
├── branches/page.tsx
├── branches/[id]/rooms/page.tsx
├── rooms/[id]/page.tsx
├── bookings/page.tsx
├── bookings/[id]/page.tsx
├── vouchers/page.tsx
├── reports/page.tsx
└── reviews/page.tsx
```

### 4.2 Dashboard (`/dashboard`)

**4 Metric Cards** — dùng mock data từ `apiClient.getReportSummary()`:
| Card | Data |
|---|---|
| Doanh thu hôm nay | tổng `totalAmount` các booking confirmed hôm nay vs hôm qua |
| Booking hôm nay | count bookings hôm nay vs hôm qua |
| Đang được thuê | count `checked_in` (live) |
| Tỷ lệ lấp đầy | bookedRooms / totalRooms × 100% vs tuần trước |

**Revenue Chart** (`recharts` BarChart): 12 tháng từ `apiClient.getRevenueYearly()`

**Recent Bookings table**: 10 booking mới nhất

```bash
pnpm add recharts
```

### 4.3 Bookings Management (`/bookings`)

**DataTable** (mở rộng `src/components/cms/DataTable.tsx`):

- Columns: Mã booking | Khách | Phòng | Chi nhánh | Check-in | Check-out | Tổng | TT thanh toán | TT booking | Actions
- Filter bar: chi nhánh, phòng, status, payment method, date range
- Row actions: Xác nhận / Check-in / Check-out / Hủy (dialog) / Export CSV

### 4.4 Room Management (`/rooms/[id]`)

Form nhiều sections (tabs hoặc accordion):

1. **Thông tin cơ bản** — tên VI/EN, mô tả VI/EN, chi nhánh, số phòng, tầng, sức chứa
2. **Giá** — giá/giờ, giá gốc, giá/ngày, giá gốc, thêm giờ, thêm người, giờ tối thiểu
3. **Cài đặt** — allow hourly, giờ check-in/out, status, featured, guest_favorite
4. **Ảnh** — drag-and-drop `react-dropzone`, tối đa 10 ảnh, reorder DnD, đánh dấu bìa
5. **Tiện nghi** — thêm/xóa, icon picker (lucide-react), isFeatured, isFree, price
6. **Khung giờ** — form thêm TimeSlotSuggestion (label, startTime, endTime, priceOverride, dayOfWeek)
7. **Chính sách hủy** — table CancellationPolicy (daysBefore, refundPercentage)

```bash
pnpm add react-dropzone @dnd-kit/core @dnd-kit/sortable
```

### 4.5 Vouchers Management (`/vouchers`)

CRUD với form: code, discountType, discountValue, maxDiscount, minBookingAmount, usageLimit, validFrom, validUntil

### 4.6 Reports (`/reports`)

- Tab: Theo ngày | Theo tháng | Theo năm
- Filter: Tất cả chi nhánh / chọn chi nhánh
- BarChart (recharts): doanh thu theo thời gian
- Summary cards: tổng booking, tổng doanh thu, so sánh kỳ trước
- Detail table: sortable

---

## Phase 5 — Backend: Auth + Branches + Rooms

> Bắt đầu phase này khi frontend đã hoàn chỉnh với mock data. Chạy migration lần đầu ở đây.
>
> ```bash
> cd src/backend && npx prisma migrate dev --name init_homestay_schema
> ```

### 5.1 AuthModule — Cập nhật

- [ ] **DTO**: Thêm `phone` vào `RegisterDto`, `LoginDto` (login bằng email hoặc phone)
- [ ] **`auth.service.ts`**:
  - `register()`: hash password, lưu `fullName`, `phone`
  - `login()`: tìm user bằng email hoặc phone, verify password
  - `logout()`: xóa `refreshTokenHash` trong DB
  - `refresh()`: verify + so sánh với `refreshTokenHash` → rotate token + lưu hash mới
- [ ] **`auth.controller.ts`**: Thêm `POST /auth/logout`, `GET /auth/me`
- [ ] **`jwt.strategy.ts`**: `validate()` check `isActive`

### 5.2 BranchesModule — Tạo mới

```
src/backend/src/modules/branches/
├── branches.module.ts
├── application/branches.service.ts
├── infrastructure/branches.repository.ts
└── interface/
    ├── branches.controller.ts
    └── dto/
        ├── create-branch.dto.ts
        ├── update-branch.dto.ts
        └── branch-query.dto.ts
```

Endpoints: `GET /branches` (public), `GET /branches/:id` (public), `POST/PATCH/DELETE` (Admin)
Cache: `branch_<id>`, `branches_list_<query>`

### 5.3 RoomsModule — Tạo mới

```
src/backend/src/modules/rooms/
├── rooms.module.ts
├── application/rooms.service.ts
├── infrastructure/rooms.repository.ts
└── interface/
    ├── rooms.controller.ts
    └── dto/
        ├── create-room.dto.ts
        ├── update-room.dto.ts
        ├── room-query.dto.ts        ← branchId, type, checkIn, checkOut, priceMax, amenities
        ├── room-image.dto.ts
        └── reorder-images.dto.ts
```

**Availability check** (`GET /rooms/:id/availability`):

```typescript
const conflicts = await bookingRepo.findMany({
  where: {
    roomId: id,
    bookingStatus: { notIn: ["cancelled"] },
    OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
  },
});
return { available: conflicts.length === 0, conflicts };
```

**Time slots** (`GET /rooms/:id/time-slots?date=`): Lấy `TimeSlotSuggestion` theo `dayOfWeek`, kiểm tra xung đột booking.

**Image upload** (`POST /rooms/:id/images`): multer → Sharp resize → WebP → upload MinIO (`@aws-sdk/client-s3`)

### 5.4 ImageModule — Tạo mới

```
src/backend/src/modules/image/
├── image.module.ts
└── application/image.service.ts   ← upload(), delete(), generatePublicUrl()
```

**Packages:**

```bash
cd src/backend
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage sharp multer @types/multer
```

### 5.5 Prisma Seed

File: `src/backend/prisma/seed.ts`:

- 1 admin user
- 2-3 branch mẫu
- 5-6 phòng mẫu với ảnh placeholder, amenities, time slots

---

## Phase 6 — Backend: Bookings + Payments + Vouchers

### 6.1 BookingsModule

```
src/backend/src/modules/bookings/
├── bookings.module.ts
├── application/bookings.service.ts
├── infrastructure/bookings.repository.ts
└── interface/
    ├── bookings.controller.ts
    └── dto/
        ├── create-booking.dto.ts
        ├── booking-query.dto.ts
        ├── cancel-booking.dto.ts
        └── update-status.dto.ts
```

**`create()` logic:**

1. Verify room `status === 'active'`
2. Kiểm tra availability (không overlap)
3. Tính `baseAmount`, `extraAmount`, `discountAmount`
4. `bookingCode = "HMS-" + Date.now().toString(36).toUpperCase()`
5. Nếu có `voucherCode`: validate + increment `usedCount`
6. Prisma transaction: tạo `Booking` + `Payment` cùng lúc

**Packages:**

```bash
npm install nanoid fast-csv @types/fast-csv
```

### 6.2 PaymentsModule

```
src/backend/src/modules/payments/
├── payments.module.ts
├── application/payments.service.ts
├── application/vnpay.service.ts
└── interface/
    ├── payments.controller.ts
    └── dto/create-vnpay-payment.dto.ts
```

**`vnpay.service.ts` — tạo URL:**

```typescript
createPaymentUrl(booking: Booking): string {
  const params = {
    vnp_Version: '2.1.0', vnp_Command: 'pay',
    vnp_TmnCode: this.config.get('VNPAY_TMN_CODE'),
    vnp_Amount: (booking.totalAmount * 100).toString(),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: booking.bookingCode,
    vnp_OrderInfo: `Dat phong ${booking.bookingCode}`,
    vnp_ReturnUrl: this.config.get('VNPAY_RETURN_URL'),
    vnp_IpnUrl: this.config.get('VNPAY_IPN_URL'),
    vnp_CreateDate: format(new Date(), 'yyyyMMddHHmmss'),
  };
  // Sort + HMAC-SHA512 + append vnp_SecureHash
  // Return VNPAY_URL + '?' + signedQueryString
}
```

Endpoints:

- `POST /payments/vnpay/create` (@Public) → `{ paymentUrl }`
- `GET /payments/vnpay/callback` (@Public) → verify chữ ký → update DB → redirect frontend
- `POST /payments/vnpay/ipn` (@Public) → xử lý IPN → trả `{ RspCode: '00', Message: 'Confirm Success' }`

**Packages:**

```bash
npm install date-fns
```

### 6.3 VouchersModule

```
src/backend/src/modules/vouchers/
├── vouchers.module.ts
├── application/vouchers.service.ts
├── infrastructure/vouchers.repository.ts
└── interface/
    ├── vouchers.controller.ts
    └── dto/
        ├── create-voucher.dto.ts
        ├── update-voucher.dto.ts
        └── validate-voucher.dto.ts   ← { code, bookingAmount }
```

**`validate()` logic:**

1. Tìm voucher, check `isActive`, `validFrom ≤ now ≤ validUntil`, `usedCount < usageLimit`
2. Check `bookingAmount ≥ minBookingAmount`
3. Tính discount: `percentage` (cap tại `maxDiscountAmount`) hoặc `fixed_amount`
4. Trả `{ valid: true, discountAmount, finalAmount }`

---

## Phase 7 — Backend: Reviews + Reports

### 7.1 ReviewsModule

```
src/backend/src/modules/reviews/
├── reviews.module.ts
├── application/reviews.service.ts
├── infrastructure/reviews.repository.ts
└── interface/
    ├── reviews.controller.ts
    └── dto/
        ├── create-review.dto.ts   ← { bookingId, rating: 1-5, comment }
        └── review-query.dto.ts
```

**`create()` guard:** Kiểm tra `booking.userId === currentUser.id` và `bookingStatus === 'completed'`. Sau khi tạo: update `Room.ratingAvg` và `Room.ratingCount` trong cùng Prisma transaction.

### 7.2 ReportsModule (Admin only)

```
src/backend/src/modules/reports/
├── reports.module.ts
├── application/reports.service.ts
└── interface/reports.controller.ts
```

Dùng `prisma.$queryRaw` cho aggregation queries:

```typescript
// Doanh thu theo ngày
prisma.$queryRaw`
  SELECT DATE(created_at) as date,
         SUM(total_amount) as revenue,
         COUNT(*) as booking_count
  FROM bookings
  WHERE booking_status = 'confirmed'
    AND DATE(created_at) = ${date}
  GROUP BY DATE(created_at)
`;
```

Endpoints (tất cả `@Roles(Role.ADMIN)`):

- `GET /reports/revenue/daily?date=`
- `GET /reports/revenue/monthly?year=&month=`
- `GET /reports/revenue/yearly?year=`
- `GET /reports/revenue/by-branch?from=&to=`
- `GET /reports/bookings/summary`
- `GET /reports/rooms/occupancy?from=&to=`

---

## Phase 8 — Wire-up: Kết nối Frontend với Backend thật

**Mục tiêu:** Thay thế mock data bằng API calls thật. Không cần refactor component nào.

### 8.1 Checklist wire-up

- [ ] Đặt `NEXT_PUBLIC_USE_MOCK=false` trong `src/frontend/.env`
- [ ] Test từng `apiClient.*` method với backend thật, fix shape mismatch nếu có
- [ ] Cập nhật NextAuth `src/lib/auth.ts`: đảm bảo `signIn()` gọi đúng endpoint `/auth/login`
- [ ] Image URLs: đảm bảo `next/image` `domains` trong `next.config.ts` cho phép MinIO domain
- [ ] VNPay callback: test end-to-end với VNPay sandbox
- [ ] Admin role guard: kiểm tra `session.user.role` được set đúng từ backend

### 8.2 API shape verification

Với mỗi endpoint, so sánh response thật vs mock:

```typescript
// Dùng Zod để parse và phát hiện mismatch
import { RoomSchema } from "@/types/schemas";
const room = RoomSchema.parse(await api.get(`/rooms/${id}`));
```

Tạo `src/types/schemas.ts` với Zod schemas tương ứng với Prisma models.

### 8.3 Error handling

Thay `mockDelay()` → xử lý `ApiError` thật:

- 401 → redirect `/login`
- 404 → Next.js `notFound()`
- 500 → boundary `error.tsx`

---

## Phase 9 — SEO + Performance + Deploy

### 9.1 SEO

- `generateMetadata` cho mỗi route động
- `src/app/sitemap.ts` — danh sách URLs (homepage, /rooms, /rooms/[id])
- `src/app/robots.ts` — allow all, sitemap URL
- Open Graph: ảnh phòng cho `/rooms/[id]`
- JSON-LD Structured Data: `@type: LodgingBusiness` cho `RoomDetailPage`

### 9.2 Performance

- Tất cả ảnh phòng: `next/image` với `sizes` prop
- `RoomsPage`, `RoomDetailPage`: `Suspense` + skeleton loading
- ISR cho `RoomDetailPage`: `revalidate: 3600` (1 giờ)

### 9.3 Docker Production

**`docker-compose.prod.yml`** tại root — services: postgres, redis, minio, api, web, nginx

**Dockerfiles:**

- `src/backend/Dockerfile.prod`: multi-stage, `node:20-alpine`
- `src/frontend/Dockerfile.prod`: multi-stage, `output: 'standalone'` trong `next.config.ts`

**Nginx** (`nginx/nginx.conf`):

```nginx
# yourdomain.vn       → web:3000
# admin.yourdomain.vn → web:3000  (same Next.js app, admin route group)
# api.yourdomain.vn   → api:4000
# cdn.yourdomain.vn   → minio:9000
```

### 9.4 GitHub Actions

File: `.github/workflows/deploy.yml`

- Trigger: push `main`
- Steps: checkout → setup Node 20 → install → build → SSH deploy
- SSH: pull → docker compose build → up -d → prisma migrate deploy → prune

### 9.5 Go-live Checklist (từ PRD Section 12)

- [ ] Đổi tất cả secret keys và passwords
- [ ] Cấu hình SSL (Certbot Let's Encrypt)
- [ ] Test VNPay với production credentials
- [ ] Google Maps API key: thêm domain restriction
- [ ] Setup pg_dump cron job (daily, lưu MinIO)
- [ ] UFW firewall (chỉ mở 22, 80, 443)
- [ ] Test trên mobile (iOS + Android)
- [ ] i18n hoàn chỉnh VI/EN
- [ ] Lighthouse audit: Performance > 85, SEO > 95
- [ ] CORS origins chỉ domain production
- [ ] Test VNPay IPN callback end-to-end
- [ ] Rate limiting: 100 req/min public, 20 req/min auth
- [ ] `GET /api/health` trả 200

---

## Thứ tự thực thi

```
Phase 0 — Foundation: schema + types + cleanup         (1-2 ngày)
  ↓
Phase 1 — FE: Design system + mock data layer          (1-2 ngày)
  ↓
Phase 2 — FE: Trang chủ + Rooms + Room Detail          (4-5 ngày)
  ↓
Phase 3 — FE: Booking Flow + Auth pages                (3-4 ngày)
  ↓
Phase 4 — FE: Admin Dashboard                          (3-4 ngày)
  ↓                                    ← UI hoàn chỉnh, có thể demo
Phase 5 — BE: Auth + Branches + Rooms                  (4-5 ngày)
  ↓
Phase 6 — BE: Bookings + Payments + Vouchers           (3-4 ngày)
  ↓
Phase 7 — BE: Reviews + Reports                        (2 ngày)
  ↓
Phase 8 — Wire-up: kết nối FE → BE thật               (1-2 ngày)
  ↓
Phase 9 — SEO + Performance + Deploy                   (2-3 ngày)
```

**Phụ thuộc nghiêm ngặt:**

- Phase 0 phải xong trước tất cả (data types là nền tảng của mock)
- Phase 1 (mock layer) phải xong trước Phase 2-4
- Phase 5-7 (backend) có thể chạy song song với Phase 2-4 nếu có 2 người
- Phase 8 (wire-up) yêu cầu cả Phase 1-4 và Phase 5-7 hoàn chỉnh

---

## Packages cần cài thêm

### Backend (`src/backend/`)

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage sharp multer @types/multer nanoid fast-csv @types/fast-csv date-fns
```

### Frontend (`src/frontend/`)

```bash
pnpm add next-intl recharts react-dropzone @dnd-kit/core @dnd-kit/sortable zod
```
