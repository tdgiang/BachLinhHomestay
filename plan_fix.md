# Xử lý yêu cầu tuân thủ NĐ 248/2026/NĐ-CP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Website `bachlinh.com.vn` công khai đầy đủ thông tin chủ quản và các chính sách bắt buộc theo NĐ 248/2026/NĐ-CP, đồng thời loại bỏ dữ liệu mẫu sai địa điểm (Đà Nẵng/Hội An/Phú Quốc/Đà Lạt/Sài Gòn) không khớp Giấy ĐKDN thật (Hà Nội).

**Architecture:** Thuần chỉnh sửa nội dung/markup trong `src/frontend` — thêm 1 component mới, 1 trang mới, bổ sung nội dung vào 3 trang chính sách hiện có, và sửa dữ liệu mẫu (branches/rooms/bookings/about) + meta tags. Không đụng `src/backend`.

**Tech Stack:** Next.js 16 App Router, next-intl (namespace `footer` cho phần chrome song ngữ), Tailwind v4 (design token qua CSS variable, không có `tailwind.config.js`), lucide-react icons.

**Nguồn tham chiếu:**
- `docs/BaLi_YeuCau_KyThuat_ND248.md` — văn bản yêu cầu gốc (nguyên văn nội dung cần đăng)
- `docs/superpowers/specs/2026-07-29-nd248-compliance-design.md` — spec đã duyệt

## Global Constraints

- Phạm vi: chỉ `src/frontend/`. Không sửa `src/backend/` (kể cả `prisma/seed.ts`).
- Nội dung mới/sửa: chỉ tiếng Việt. KHÔNG dựng cơ chế bilingual mới cho nội dung chính sách (`terms/privacy/payment-policy/chinh-sach-nd248` hiện đang VN-only kể cả ở `/en/...` — giữ nguyên quy ước này).
- Ngoại lệ: các trường mới thêm vào `Footer.tsx` (người đại diện, ngày cấp GCN) PHẢI có key song song trong cả `messages/vi.json` và `messages/en.json` — vì Footer là phần chrome dùng `next-intl` thật, không phải nội dung chính sách tĩnh.
- Chi nhánh chuẩn dùng cho mọi nơi sửa dữ liệu mẫu: **Cầu Giấy** (Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô), **Đống Đa** (60 Ngõ 128 Nguyễn Đình Chiểu), **Ba Đình** (105 Ngõ 103 Vũ Trọng Phụng) — khớp `Footer.tsx` hiện tại.
- GCN đủ điều kiện ANTT (CR-03 mục VI): chưa có số liệu — dùng placeholder `[Chờ bổ sung số/ngày/nơi cấp Giấy chứng nhận đủ điều kiện an ninh, trật tự]`, không được tự bịa số liệu.
- Style: mọi section mới phải dùng design token có sẵn (`var(--color-primary)`, `var(--color-surface)`, `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`, `var(--color-border)`, `var(--font-heading)`) — không hardcode màu mới, theo đúng pattern trong `terms/page.tsx` / `privacy/page.tsx` / `payment-policy/page.tsx`.
- Package manager: `pnpm`. Không có test framework nào cover nội dung JSX tĩnh (`vitest` hiện chỉ test `schemas`/`api-client`) — bước "kiểm thử" của các task nội dung là **grep xác nhận + `pnpm build` + `pnpm lint`**, không phải unit test mới (tránh over-engineer một test harness không ai dùng).
- Tất cả lệnh chạy từ `/Users/admin/Desktop/BachLinhWeb/src/frontend`.

---

## Task 1: CR-01 — Footer: bổ sung người đại diện pháp luật + GCN ĐKDN

**Files:**
- Modify: `src/messages/vi.json` → `messages/vi.json` (namespace `footer`)
- Modify: `messages/en.json` (namespace `footer`)
- Modify: `src/components/marketing/Footer.tsx`

**Interfaces:** Không có — chỉ thêm string content vào i18n namespace `footer` đã tồn tại.

- [x] **Step 1: Thêm key mới vào `messages/vi.json`**

Trong object `"footer"`, sau key `"headOffice"`, thêm:

```json
    "legalRepLabel": "Người đại diện theo pháp luật",
    "legalRepName": "Nguyễn Lan Phương",
    "legalRepTitle": "Giám đốc",
    "bizRegLabel": "GCN ĐKDN",
    "bizRegDate": "Ngày cấp 04/05/2026 (đăng ký lần đầu)",
    "bizRegIssuer": "Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội",
```

- [x] **Step 2: Thêm key mới vào `messages/en.json`** (cùng namespace `footer`, sau `"headOffice"`)

```json
    "legalRepLabel": "Legal representative",
    "legalRepName": "Nguyễn Lan Phương",
    "legalRepTitle": "Giám đốc",
    "bizRegLabel": "Business registration",
    "bizRegDate": "Issued 04/05/2026 (first registration)",
    "bizRegIssuer": "Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội",
```

- [x] **Step 3: Thêm icon import trong `Footer.tsx`**

Trước (dòng 3):
```tsx
import { Phone, Mail, MapPin, Building2, Receipt } from "lucide-react";
```

Sau:
```tsx
import { Phone, Mail, MapPin, Building2, Receipt, UserRound, FileCheck } from "lucide-react";
```

- [x] **Step 4: Hiển thị 2 trường mới trong khối thông tin công ty**

Trước (khối kết thúc bằng `headOffice`, khoảng dòng 81-87):
```tsx
              <p className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("headOfficeLabel")}: {t("headOffice")}
                </span>
              </p>
            </div>
```

Sau:
```tsx
              <p className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("headOfficeLabel")}: {t("headOffice")}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <UserRound className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("legalRepLabel")}: {t("legalRepName")} — {t("legalRepTitle")}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <FileCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  {t("bizRegLabel")}: {t("bizRegDate")} — {t("bizRegIssuer")}
                </span>
              </p>
            </div>
```

- [x] **Step 5: Xác nhận build**

Run: `pnpm build` (trong `src/frontend`)
Expected: build thành công, không lỗi missing-message của next-intl (vì cả vi.json và en.json đều có key mới).

- [x] **Step 6: Commit**

```bash
git add src/frontend/messages/vi.json src/frontend/messages/en.json src/frontend/src/components/marketing/Footer.tsx
git commit -m "feat(footer): add legal representative and business registration details (CR-01)"
```

---

## Task 2: CR-01 — Block "Thông tin doanh nghiệp" trên trang chủ

**Files:**
- Create: `src/components/marketing/HomeBusinessInfo.tsx`
- Modify: `src/app/[locale]/(marketing)/page.tsx`

**Interfaces:**
- Produces: `HomeBusinessInfo` — React component, không nhận prop, tự chứa toàn bộ nội dung tĩnh.
- Consumes: design token CSS variables sẵn có trong `globals.css` (không import gì thêm ngoài `lucide-react`).

- [x] **Step 1: Tạo `src/components/marketing/HomeBusinessInfo.tsx`**

```tsx
import { Building2, FileText, Phone, UserRound } from "lucide-react";

const FIELDS = [
  {
    icon: Building2,
    label: "Tên tổ chức",
    value: "Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh",
  },
  {
    icon: FileText,
    label: "Địa chỉ trụ sở chính",
    value: "Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, TP Hà Nội, Việt Nam",
  },
  {
    icon: UserRound,
    label: "Người đại diện theo pháp luật",
    value: "Nguyễn Lan Phương — Chức danh: Giám đốc",
  },
  {
    icon: FileText,
    label: "Mã số doanh nghiệp / Mã số thuế",
    value: "0111484606",
  },
  {
    icon: FileText,
    label: "Nơi cấp",
    value: "Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội",
  },
  {
    icon: FileText,
    label: "Ngày cấp",
    value: "04/05/2026 (đăng ký lần đầu)",
  },
];

export function HomeBusinessInfo() {
  return (
    <section
      className="py-16 md:py-20 px-4 sm:px-6"
      style={{ background: "white", borderTop: "1px solid var(--color-border)" }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl md:text-3xl font-bold mb-8 text-center"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}
        >
          Thông tin doanh nghiệp
        </h2>
        <div
          className="grid sm:grid-cols-2 gap-5 rounded-3xl p-6 md:p-8"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {FIELDS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(26,74,122,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 sm:col-span-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(26,74,122,0.08)" }}
            >
              <Phone className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                Hỗ trợ trực tuyến
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Hotline 0931 708 256 (24/7) · Email: admin@bachlinh.com.vn · Biểu mẫu &quot;Liên hệ&quot; trên website
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 2: Chèn component vào trang chủ**

File: `src/app/[locale]/(marketing)/page.tsx`

Trước:
```tsx
import { HomeCtaSection } from '@/components/marketing/HomeCtaSection';
```
Sau:
```tsx
import { HomeCtaSection } from '@/components/marketing/HomeCtaSection';
import { HomeBusinessInfo } from '@/components/marketing/HomeBusinessInfo';
```

Trước:
```tsx
      <HomeValueProps />
      <HomeHowItWorks />
      <HomeCtaSection />
    </div>
  );
}
```
Sau:
```tsx
      <HomeValueProps />
      <HomeHowItWorks />
      <HomeCtaSection />
      <HomeBusinessInfo />
    </div>
  );
}
```

- [x] **Step 3: Xác nhận build**

Run: `pnpm build`
Expected: build thành công, route `/` (cả `/vi` và `/en`) build không lỗi.

- [x] **Step 4: Commit**

```bash
git add src/frontend/src/components/marketing/HomeBusinessInfo.tsx src/frontend/src/app/\[locale\]/\(marketing\)/page.tsx
git commit -m "feat(home): add business information block before footer (CR-01)"
```

---

## Task 3: CR-02 — Chuẩn hóa `MOCK_BRANCHES` về 3 chi nhánh Hà Nội thật

**Files:**
- Modify: `src/lib/mock/branches.ts`

**Interfaces:**
- Produces: `MOCK_BRANCHES: Branch[]` — giữ nguyên 3 phần tử, giữ nguyên `id` (`branch-da-nang-001`, `branch-da-nang-002`, `branch-hoi-an-001`) để không phá tham chiếu ở `rooms.ts`/`bookings.ts`. Chỉ đổi `name/nameEn/address/city/latitude/longitude/phone/description/descriptionEn`.

- [x] **Step 1: Viết lại toàn bộ `MOCK_BRANCHES`**

Thay toàn bộ nội dung `src/lib/mock/branches.ts` bằng:

```ts
import type { Branch } from '@/types';

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'branch-da-nang-001',
    name: 'Ba.Li — Cầu Giấy',
    nameEn: 'Ba.Li — Cau Giay',
    address: 'Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô',
    city: 'Hà Nội',
    latitude: 21.0384,
    longitude: 105.7899,
    phone: '0931 708 256',
    description: 'Chi nhánh Cầu Giấy, gần các trường đại học lớn và trung tâm thương mại, thuận tiện di chuyển nội thành.',
    descriptionEn: 'Cau Giay branch, close to major universities and shopping centers, convenient for getting around the city.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'branch-da-nang-002',
    name: 'Ba.Li — Đống Đa',
    nameEn: 'Ba.Li — Dong Da',
    address: '60 Ngõ 128 Nguyễn Đình Chiểu',
    city: 'Hà Nội',
    latitude: 21.0136,
    longitude: 105.825,
    phone: '0931 708 256',
    description: 'Chi nhánh Đống Đa, không gian yên tĩnh trong ngõ nhỏ, gần các tuyến phố ẩm thực sầm uất.',
    descriptionEn: 'Dong Da branch, quiet space in a small alley, near bustling food streets.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'branch-hoi-an-001',
    name: 'Ba.Li — Ba Đình',
    nameEn: 'Ba.Li — Ba Dinh',
    address: '105 Ngõ 103 Vũ Trọng Phụng',
    city: 'Hà Nội',
    latitude: 21.0022,
    longitude: 105.8069,
    phone: '0931 708 256',
    description: 'Chi nhánh Ba Đình, vị trí trung tâm, thuận tiện kết nối tới các điểm tham quan và khu vực làm việc.',
    descriptionEn: 'Ba Dinh branch, central location, convenient access to sightseeing spots and business areas.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
```

- [x] **Step 2: Xác nhận không còn địa danh sai trong file này**

Run: `grep -nE "Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn" src/lib/mock/branches.ts`
Expected: không có kết quả (exit code 1 / empty output).

- [x] **Step 3: Commit**

```bash
git add src/frontend/src/lib/mock/branches.ts
git commit -m "fix(mock): replace sample branch data with real Ha Noi branches (CR-02)"
```

---

## Task 4: CR-02 — Sửa nội dung phòng ở `mock/rooms.ts` khớp chi nhánh Hà Nội

**Files:**
- Modify: `src/lib/mock/rooms.ts`

**Interfaces:**
- Consumes: `MOCK_BRANCHES` từ Task 3 (`branch: MOCK_BRANCHES[0/1/2]` — không đổi, vẫn trỏ đúng theo index).
- Không đổi `id`, `branchId`, giá, tiện nghi, ảnh — chỉ sửa text có địa danh sai hoặc claim "view biển" không còn đúng (chi nhánh Hà Nội không có biển).

- [x] **Step 1: Sửa mô tả `room-001`** (dòng 10-11) — bỏ tên phố Đà Nẵng

Trước:
```ts
    description: 'Phòng Deluxe rộng 30m², view phố Bạch Đằng, nội thất hiện đại, đầy đủ tiện nghi cao cấp. Không gian thoáng đãng, ánh sáng tự nhiên chan hòa.',
    descriptionEn: '30sqm Deluxe room with Bach Dang street view and modern furnishings. Bright and airy space with natural lighting.',
```
Sau:
```ts
    description: 'Phòng Deluxe rộng 30m², view phố, nội thất hiện đại, đầy đủ tiện nghi cao cấp. Không gian thoáng đãng, ánh sáng tự nhiên chan hòa.',
    descriptionEn: '30sqm Deluxe room with street view and modern furnishings. Bright and airy space with natural lighting.',
```

- [x] **Step 2: Sửa `room-003`** — bỏ claim "view biển Mỹ Khê" (chi nhánh Đống Đa không có biển)

Trước (dòng 102-105):
```ts
    name: 'Phòng Superior View Biển',
    nameEn: 'Sea View Superior Room',
    description: 'Phòng Superior với ban công view biển Mỹ Khê tuyệt đẹp. Thức dậy mỗi sáng với làn gió biển trong lành và tầm nhìn ra đại dương bao la.',
    descriptionEn: 'Superior room with stunning My Khe beach view balcony. Wake up every morning to fresh sea breeze and ocean views.',
```
Sau:
```ts
    name: 'Phòng Superior Ban Công',
    nameEn: 'Superior Balcony Room',
    description: 'Phòng Superior với ban công thoáng, nội thất cao cấp. Không gian yên tĩnh, phù hợp nghỉ dưỡng dài ngày.',
    descriptionEn: 'Superior room with an airy private balcony and premium furnishings. A quiet space ideal for extended stays.',
```

Trước (dòng 133, tên tiện nghi):
```ts
      { id: 'am-003-1', roomId: 'room-003', amenityId: 'am-003-1', isFeatured: true, isFree: true, price: null, createdAt: '2026-01-01T00:00:00.000Z', amenity: { id: 'am-003-1', name: 'Ban công view biển', nameEn: 'Sea view balcony', icon: 'sun', category: 'basic' as const, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' } },
```
Sau:
```ts
      { id: 'am-003-1', roomId: 'room-003', amenityId: 'am-003-1', isFeatured: true, isFree: true, price: null, createdAt: '2026-01-01T00:00:00.000Z', amenity: { id: 'am-003-1', name: 'Ban công riêng', nameEn: 'Private balcony', icon: 'sun', category: 'basic' as const, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' } },
```

Trước (dòng 140, time slot label):
```ts
      { id: 'ts-003-2', roomId: 'room-003', label: 'Buổi tối view biển', startTime: '19:00', endTime: '23:00', priceOverride: 800000, priceOriginal: 1000000, dayOfWeek: null, isActive: true },
```
Sau:
```ts
      { id: 'ts-003-2', roomId: 'room-003', label: 'Buổi tối thư giãn', startTime: '19:00', endTime: '23:00', priceOverride: 800000, priceOriginal: 1000000, dayOfWeek: null, isActive: true },
```

- [x] **Step 3: Sửa `room-005`** — bỏ tên "Hội An" (dòng 188-191)

Trước:
```ts
    name: 'Phòng Garden View Hội An',
    nameEn: 'Hoi An Garden View Room',
    description: 'Phòng hướng vườn yên tĩnh, phong cách truyền thống Hội An. Không gian thư giãn, gần gũi thiên nhiên.',
    descriptionEn: 'Quiet garden-facing room with traditional Hoi An style. Relaxing space close to nature.',
```
Sau:
```ts
    name: 'Phòng Garden View',
    nameEn: 'Garden View Room',
    description: 'Phòng hướng vườn yên tĩnh, phong cách truyền thống Việt Nam. Không gian thư giãn, gần gũi thiên nhiên.',
    descriptionEn: 'Quiet garden-facing room with traditional Vietnamese style. Relaxing space close to nature.',
```

- [x] **Step 4: Sửa `room-006`** — bỏ "phố cổ Hội An" (dòng 227-228)

Trước:
```ts
    description: 'Suite cao cấp 50m² với bồn tắm freestanding và ban công riêng. Trải nghiệm nghỉ dưỡng sang trọng giữa lòng phố cổ Hội An.',
    descriptionEn: '50sqm premium suite with freestanding bathtub and private balcony. Luxurious retreat in the heart of Hoi An Ancient Town.',
```
Sau:
```ts
    description: 'Suite cao cấp 50m² với bồn tắm freestanding và ban công riêng. Trải nghiệm nghỉ dưỡng sang trọng giữa lòng Thủ đô Hà Nội.',
    descriptionEn: '50sqm premium suite with freestanding bathtub and private balcony. A luxurious retreat in the heart of Hanoi.',
```

- [x] **Step 5: Xác nhận không còn địa danh sai**

Run: `grep -nE "Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn|Bach Dang|My Khe|Hoi An" src/lib/mock/rooms.ts`
Expected: không có kết quả.

- [x] **Step 6: Commit**

```bash
git add src/frontend/src/lib/mock/rooms.ts
git commit -m "fix(mock): scrub mismatched location copy from room data (CR-02)"
```

---

## Task 5: CR-02 — Đồng bộ `mock/bookings.ts` (dữ liệu `room.branch` lồng trong booking)

**Files:**
- Modify: `src/lib/mock/bookings.ts`

**Interfaces:** Không có export mới — chỉ đồng bộ 3 object `room.branch` lồng trong `MOCK_BOOKINGS` để khớp Task 3/4 (các object này KHÔNG tham chiếu `MOCK_BRANCHES`, mà hardcode riêng).

- [x] **Step 1: Sửa `booking-001` (dòng 33-38)**

Trước:
```ts
    room: {
      id: 'room-003',
      name: 'Phòng Superior View Biển',
      roomNumber: '301',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      branch: { id: 'branch-da-nang-002', name: 'Ba.Li — Mỹ Khê', address: '58 Võ Nguyên Giáp', city: 'Đà Nẵng' },
      images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', isCover: true }],
    },
```
Sau:
```ts
    room: {
      id: 'room-003',
      name: 'Phòng Superior Ban Công',
      roomNumber: '301',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      branch: { id: 'branch-da-nang-002', name: 'Ba.Li — Đống Đa', address: '60 Ngõ 128 Nguyễn Đình Chiểu', city: 'Hà Nội' },
      images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', isCover: true }],
    },
```

- [x] **Step 2: Sửa `booking-002` (dòng 71-77)**

Trước:
```ts
    room: {
      id: 'room-001',
      name: 'Phòng Deluxe Hướng Phố',
      roomNumber: '101',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      branch: { id: 'branch-da-nang-001', name: 'Ba.Li — Đà Nẵng Trung Tâm', address: '12 Bạch Đằng', city: 'Đà Nẵng' },
      images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', isCover: true }],
    },
```
Sau:
```ts
    room: {
      id: 'room-001',
      name: 'Phòng Deluxe Hướng Phố',
      roomNumber: '101',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      branch: { id: 'branch-da-nang-001', name: 'Ba.Li — Cầu Giấy', address: 'Số 66, Ngõ 61 Phạm Tuấn Tài', city: 'Hà Nội' },
      images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', isCover: true }],
    },
```

- [x] **Step 3: Sửa `booking-003` (dòng 109-115)**

Trước:
```ts
    room: {
      id: 'room-006',
      name: 'Phòng Suite Bồn Tắm',
      roomNumber: '201',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      branch: { id: 'branch-hoi-an-001', name: 'Ba.Li — Hội An', address: '45 Cửa Đại', city: 'Hội An' },
      images: [{ url: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800', isCover: true }],
    },
```
Sau:
```ts
    room: {
      id: 'room-006',
      name: 'Phòng Suite Bồn Tắm',
      roomNumber: '201',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      branch: { id: 'branch-hoi-an-001', name: 'Ba.Li — Ba Đình', address: '105 Ngõ 103 Vũ Trọng Phụng', city: 'Hà Nội' },
      images: [{ url: 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800', isCover: true }],
    },
```

- [x] **Step 4: Xác nhận không còn địa danh sai**

Run: `grep -nE "Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn" src/lib/mock/bookings.ts`
Expected: không có kết quả.

- [x] **Step 5: Commit**

```bash
git add src/frontend/src/lib/mock/bookings.ts
git commit -m "fix(mock): sync nested booking.room.branch data with real branches (CR-02)"
```

---

## Task 6: CR-02 — Trang `about/page.tsx`: thay số liệu/chi nhánh mẫu

**Files:**
- Modify: `src/app/[locale]/(marketing)/about/page.tsx`

**Interfaces:** Không có — chỉ sửa nội dung tĩnh trong file.

- [x] **Step 1: Sửa `STATS`** (dòng 24-29)

Trước:
```tsx
const STATS = [
  { value: "20+", label: "Phòng nghỉ", sub: "khắp miền Trung" },
  { value: "3", label: "Thành phố", sub: "Đà Nẵng · Đà Lạt · Phú Quốc" },
  { value: "4.9", label: "Điểm đánh giá", sub: "trung bình từ khách hàng" },
  { value: "5K+", label: "Lượt khách", sub: "đã lưu trú thành công" },
];
```
Sau:
```tsx
const STATS = [
  { value: "20+", label: "Phòng nghỉ", sub: "khắp Hà Nội" },
  { value: "3", label: "Chi nhánh", sub: "Cầu Giấy · Đống Đa · Ba Đình" },
  { value: "4.9", label: "Điểm đánh giá", sub: "trung bình từ khách hàng" },
  { value: "5K+", label: "Lượt khách", sub: "đã lưu trú thành công" },
];
```

- [x] **Step 2: Sửa câu cuối trong `VALUES`** (dòng 48-51)

Trước:
```tsx
  {
    icon: Award,
    title: "Chất lượng nhất quán",
    desc: "Từ Đà Nẵng đến Phú Quốc, mỗi phòng đều đạt tiêu chuẩn kiểm định nghiêm ngặt trước khi đón khách.",
  },
```
Sau:
```tsx
  {
    icon: Award,
    title: "Chất lượng nhất quán",
    desc: "Tại tất cả chi nhánh Hà Nội, mỗi phòng đều đạt tiêu chuẩn kiểm định nghiêm ngặt trước khi đón khách.",
  },
```

- [x] **Step 3: Viết lại `BRANCHES`** (dòng 54-79)

Trước:
```tsx
const BRANCHES = [
  {
    city: "TP. Hồ Chí Minh",
    name: "Sài Gòn Central",
    address: "28 Bùi Viện, Quận 1",
    desc: "Giữa trung tâm phố Tây sôi động, cách Bến Thành 10 phút đi bộ.",
    rooms: 3,
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  },
  {
    city: "Đà Lạt",
    name: "Đà Lạt Highland",
    address: "15 Huỳnh Thúc Kháng, P. 9",
    desc: "Đồi thông yên bình, view thung lũng, không khí mát lành quanh năm.",
    rooms: 3,
    img: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80",
  },
  {
    city: "Phú Quốc",
    name: "Phú Quốc Beachside",
    address: "68 Trần Hưng Đạo, Dương Tơ",
    desc: "Sát biển Dương Tơ trong xanh, hồ bơi vô cực nhìn ra đại dương.",
    rooms: 3,
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
];
```
Sau:
```tsx
const BRANCHES = [
  {
    city: "Hà Nội",
    name: "Cầu Giấy",
    address: "Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô",
    desc: "Gần các trường đại học lớn và trung tâm thương mại Cầu Giấy, thuận tiện di chuyển nội thành.",
    rooms: 2,
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  },
  {
    city: "Hà Nội",
    name: "Đống Đa",
    address: "60 Ngõ 128 Nguyễn Đình Chiểu",
    desc: "Không gian yên tĩnh trong ngõ nhỏ, gần các tuyến phố ẩm thực sầm uất.",
    rooms: 2,
    img: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=600&q=80",
  },
  {
    city: "Hà Nội",
    name: "Ba Đình",
    address: "105 Ngõ 103 Vũ Trọng Phụng",
    desc: "Vị trí trung tâm, thuận tiện kết nối tới các điểm tham quan và khu vực làm việc.",
    rooms: 2,
    img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
  },
];
```

- [x] **Step 4: Sửa alt text ảnh collage trong hero** (dòng 186-189)

Trước:
```tsx
            <img
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80"
              alt="Phòng nghỉ Đà Lạt"
```
Sau:
```tsx
            <img
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80"
              alt="Phòng nghỉ Ba.Li"
```

- [x] **Step 5: Sửa câu mô tả trong hero** (dòng 148-151)

Trước:
```tsx
              Từ cà phê sáng nhìn ra biển Phú Quốc đến chiều tà trong lành giữa
              đồi thông Đà Lạt — Ba.Li mang đến không gian nghỉ dưỡng đúng
              nghĩa, mọi lúc bạn cần.
```
Sau:
```tsx
              Từ tách cà phê sáng giữa lòng phố cổ đến buổi tối yên tĩnh sau
              một ngày dài — Ba.Li mang đến không gian nghỉ dưỡng đúng nghĩa,
              mọi lúc bạn cần.
```

- [x] **Step 6: Sửa đoạn kể chuyện** (dòng 316-321)

Trước:
```tsx
              <p>
                Chúng tôi bắt đầu với một căn phòng nhỏ ở Đà Nẵng, nơi hướng
                thẳng ra biển Mỹ Khê. Từ sự đón nhận nồng nhiệt của khách lưu
                trú, Ba.Li dần mở rộng sang Đà Lạt và Phú Quốc — mang theo cùng
                một triết lý:{" "}
                <em>chất lượng không thỏa hiệp, giá cả không bất ngờ</em>.
              </p>
```
Sau:
```tsx
              <p>
                Chúng tôi bắt đầu với một căn phòng nhỏ tại Cầu Giấy, Hà Nội.
                Từ sự đón nhận nồng nhiệt của khách lưu trú, Ba.Li dần mở rộng
                sang Đống Đa và Ba Đình — mang theo cùng một triết lý:{" "}
                <em>chất lượng không thỏa hiệp, giá cả không bất ngờ</em>.
              </p>
```

- [x] **Step 7: Sửa câu "20 phòng tại 3 thành phố"** (dòng 323-327)

Trước:
```tsx
              <p>
                Ngày nay, với hơn 20 phòng tại 3 thành phố, chúng tôi phục vụ
                hàng nghìn lượt khách mỗi năm — từ những cặp đôi tìm góc riêng
                tư, gia đình tìm kỳ nghỉ ý nghĩa, đến những bạn trẻ cần không
                gian yên tĩnh làm việc xa nhà.
              </p>
```
Sau:
```tsx
              <p>
                Ngày nay, với hơn 20 phòng tại 3 chi nhánh Hà Nội, chúng tôi
                phục vụ hàng nghìn lượt khách mỗi năm — từ những cặp đôi tìm
                góc riêng tư, gia đình tìm kỳ nghỉ ý nghĩa, đến những bạn trẻ
                cần không gian yên tĩnh làm việc xa nhà.
              </p>
```

- [x] **Step 8: Sửa tiêu đề section chi nhánh** (dòng 417-425)

Trước:
```tsx
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                3 thành phố, 1 tiêu chuẩn
              </h2>
```
Sau:
```tsx
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                3 chi nhánh, 1 tiêu chuẩn
              </h2>
```

- [x] **Step 9: Sửa câu CTA cuối trang** (dòng 617-619)

Trước:
```tsx
          <p
            className="text-base md:text-lg mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Hơn 20 phòng tại 3 thành phố biển đảo đẹp nhất Việt Nam. Đặt ngay,
            nhận ưu đãi sớm.
          </p>
```
Sau:
```tsx
          <p
            className="text-base md:text-lg mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Hơn 20 phòng tại 3 chi nhánh khắp Hà Nội. Đặt ngay, nhận ưu đãi
            sớm.
          </p>
```

- [x] **Step 10: Xác nhận không còn địa danh sai**

Run: `grep -nE "Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn" "src/app/[locale]/(marketing)/about/page.tsx"`
Expected: không có kết quả.

- [x] **Step 11: Commit**

```bash
git add "src/frontend/src/app/[locale]/(marketing)/about/page.tsx"
git commit -m "fix(about): replace sample city/branch content with real Ha Noi data (CR-02)"
```

---

## Task 7: CR-07 — Sửa thẻ meta (SEO) sai địa bàn

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:** Không có — chỉ sửa `metadata.keywords`.

- [x] **Step 1: Sửa `keywords`**

Trước (dòng 33-40):
```tsx
  keywords: [
    "homestay",
    "đặt phòng",
    "Đà Nẵng",
    "Hội An",
    "theo giờ",
    "theo ngày",
  ],
```
Sau:
```tsx
  keywords: [
    "homestay",
    "đặt phòng",
    "Hà Nội",
    "Cầu Giấy",
    "theo giờ",
    "theo ngày",
  ],
```

- [x] **Step 2: Xác nhận**

Run: `grep -n "Đà Nẵng\|Hội An" src/app/layout.tsx`
Expected: không có kết quả.

- [x] **Step 3: Commit**

```bash
git add src/frontend/src/app/layout.tsx
git commit -m "fix(seo): correct meta keywords to Ha Noi (CR-07)"
```

---

## Task 8: CR-03 — Trang mới "Chính sách hoạt động theo NĐ 248"

**Files:**
- Create: `src/app/[locale]/(marketing)/chinh-sach-nd248/page.tsx`
- Modify: `src/components/marketing/Footer.tsx`

**Interfaces:**
- Produces: route `/vi/chinh-sach-nd248` và `/en/chinh-sach-nd248` (route group không có localized pathname riêng — xem `src/i18n/routing.ts`, chỉ có `locales: ['vi','en']`, không custom `pathnames`).

- [x] **Step 1: Tạo `src/app/[locale]/(marketing)/chinh-sach-nd248/page.tsx`**

```tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Scale,
  MessageSquare,
  Receipt,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  Phone,
  Mail,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chính sách hoạt động theo NĐ 248 | Ba.Li Homestay",
  description:
    "Chính sách hoạt động của Ba.Li Homestay theo Nghị định 248/2026/NĐ-CP — quyền và nghĩa vụ các bên, khiếu nại, giá, phương thức cung cấp dịch vụ, chấm dứt dịch vụ và hoàn tiền.",
};

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = [
  {
    id: "rights-obligations",
    icon: Scale,
    title: "I. Quyền và nghĩa vụ của các bên (Điều 6)",
    content: [
      {
        subtitle: "Ba.Li Homestay có trách nhiệm",
        items: [
          "Ban hành và công khai điều kiện hoạt động, điều kiện giao dịch.",
          "Công khai tiêu chuẩn dịch vụ và quy trình đặt phòng.",
          "Thu phí theo chính sách giá đã công khai.",
          "Thông tin đầy đủ về khuyến mại trước khi khách đặt phòng.",
          "Bảo đảm vận hành an toàn, ổn định.",
          "Quy định các trường hợp tạm ngừng, hạn chế tài khoản.",
          "Bảo đảm an toàn thông tin cá nhân của khách hàng.",
          "Tiếp nhận và giải quyết phản ánh, khiếu nại.",
          "Giám sát, ngăn chặn hành vi vi phạm và phối hợp cung cấp thông tin cho cơ quan nhà nước có thẩm quyền.",
        ],
      },
      {
        subtitle: "Khách hàng có quyền và nghĩa vụ",
        items: [
          "Được cung cấp thông tin đầy đủ, chính xác về dịch vụ.",
          "Được bảo vệ quyền lợi người tiêu dùng và dữ liệu cá nhân.",
          "Được lựa chọn phòng và phương thức thanh toán.",
          "Được giải quyết phản ánh, khiếu nại.",
          "Có nghĩa vụ cung cấp thông tin chính xác, thanh toán đầy đủ đúng hạn.",
          "Tuân thủ pháp luật và điều kiện giao dịch của nền tảng.",
        ],
      },
    ],
  },
  {
    id: "complaints",
    icon: MessageSquare,
    title: "II. Tiếp nhận và giải quyết phản ánh, khiếu nại (Điều 7)",
    content: [
      {
        subtitle: "Kênh tiếp nhận",
        items: [
          "Email admin@bachlinh.com.vn và biểu mẫu \"Liên hệ\" (trực tuyến).",
          "Hotline 0931 708 256.",
          "Trực tiếp tại quầy lễ tân.",
        ],
      },
      {
        subtitle: "Quy trình xử lý",
        items: [
          "Bước 1: Khách gửi phản ánh kèm mã đặt phòng.",
          "Bước 2: Ba.Li tiếp nhận, phản hồi ban đầu.",
          "Bước 3: Xác minh và đề xuất phương án.",
          "Bước 4: Thực hiện và thông báo kết quả.",
        ],
      },
      {
        subtitle: "Thời hạn và biện pháp hỗ trợ",
        items: [
          "Phản hồi ban đầu trong 02 ngày làm việc.",
          "Giải quyết trong tối đa 07 ngày làm việc (vụ việc phức tạp sẽ thông báo trước cho khách).",
          "Nếu không đạt thỏa thuận, hai bên có thể hòa giải qua tổ chức bảo vệ quyền lợi người tiêu dùng, hoặc giải quyết tại Tòa án nhân dân có thẩm quyền tại TP Hà Nội.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    icon: Receipt,
    title: "III. Chính sách về giá (Điều 8)",
    content: [
      {
        subtitle: "Nguyên tắc niêm yết giá",
        items: [
          "Giá niêm yết bằng VNĐ và đã bao gồm thuế GTGT theo quy định hiện hành.",
          "Không phát sinh phụ phí ẩn ngoài các khoản đã hiển thị trước khi khách xác nhận đặt phòng.",
          "Giá có thể thay đổi theo thời điểm (mùa lễ, cuối tuần) nhưng được khóa tại thời điểm đặt phòng thành công.",
          "Trường hợp thay đổi biểu phí dịch vụ, Ba.Li Homestay công khai trên nền tảng ít nhất 20 ngày trước thời điểm áp dụng.",
        ],
      },
    ],
  },
  {
    id: "service-delivery",
    icon: KeyRound,
    title: "IV. Phương thức cung cấp dịch vụ (Điều 15 — đặt trước, sử dụng sau)",
    content: [
      {
        subtitle: "Quy trình đặt và nhận phòng",
        items: [
          "Đặt phòng được xác nhận sau khi thanh toán thành công qua VNPay; email xác nhận kèm mã đặt phòng gửi trong vòng 5 phút.",
          "Khách xuất trình mã đặt phòng và giấy tờ tùy thân khi nhận phòng tại chi nhánh đã chọn.",
          "Thời hạn sử dụng: đặt theo giờ tối thiểu 2 giờ/lượt; đặt theo ngày nhận phòng từ 14:00, trả phòng trước 12:00.",
          "Điều kiện đổi/hủy: liên hệ hotline trước giờ nhận phòng, hỗ trợ tùy tình trạng phòng trống.",
        ],
      },
      {
        subtitle: "Chi phí phát sinh và hạn chế sử dụng",
        items: [
          "Phụ thu khách vượt số lượng đăng ký, phí vệ sinh/hư hỏng, phạt hút thuốc nơi cấm 500.000 VNĐ.",
          "Không dùng cơ sở vào mục đích trái pháp luật.",
          "Giữ trật tự sau 22:00.",
          "Không mang thú cưng khi chưa được chấp thuận.",
        ],
      },
    ],
  },
  {
    id: "termination",
    icon: RefreshCw,
    title: "V. Chấm dứt dịch vụ và hoàn tiền (Điều 16)",
    content: [
      {
        subtitle: "Các trường hợp chấm dứt",
        items: [
          "Khách chủ động hủy.",
          "Ba.Li chấm dứt khi khách vi phạm nghiêm trọng.",
          "Sự kiện bất khả kháng.",
        ],
      },
      {
        subtitle: "Thời điểm chấm dứt hiệu lực và quy trình",
        items: [
          "Khi khách là bên chấm dứt: hợp đồng chấm dứt hiệu lực tại thời điểm Ba.Li Homestay nhận được thông báo hủy hợp lệ qua tài khoản, hotline hoặc email.",
          "Khách gửi yêu cầu hủy qua mục \"Lịch sử đặt phòng\" hoặc hotline/email; Ba.Li xác nhận và phản hồi trong 02 ngày làm việc.",
        ],
      },
      {
        subtitle: "Điều kiện và cách thức hoàn tiền",
        items: [
          "Hủy trước 48 giờ: hoàn 100%.",
          "Hủy trong 24–48 giờ: hoàn 50%.",
          "Hủy dưới 24 giờ hoặc không đến (no-show): không hoàn tiền.",
          "Đặt theo giờ hủy trước 2 giờ: hoàn 100%.",
          "Ba.Li chủ động hủy: hoàn 100% kèm voucher.",
          "Tiền hoàn về đúng phương thức thanh toán ban đầu, theo mốc thời gian tại trang Chính sách thanh toán.",
        ],
      },
    ],
  },
  {
    id: "conditional-industry",
    icon: ShieldAlert,
    title: "VI. Ngành nghề kinh doanh có điều kiện",
    content: [
      {
        subtitle: "An ninh, trật tự",
        items: [
          "Kinh doanh dịch vụ lưu trú thuộc ngành nghề đầu tư kinh doanh có điều kiện về an ninh, trật tự.",
          "[Chờ bổ sung số/ngày/nơi cấp Giấy chứng nhận đủ điều kiện an ninh, trật tự]",
        ],
      },
    ],
  },
];

export default async function Nd248PolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{
          background:
            "linear-gradient(135deg, #0F2D50 0%, #1A4A7A 50%, #2E6FAA 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
            style={{ border: "1px solid white" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            Chính sách
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chính sách hoạt động
            <br />
            <span style={{ color: "rgba(147,205,255,1)" }}>
              theo Nghị định 248/2026/NĐ-CP
            </span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Công khai quyền và nghĩa vụ các bên, phương thức khiếu nại, chính
            sách giá, phương thức cung cấp dịch vụ và chính sách chấm dứt dịch
            vụ, hoàn tiền của Ba.Li Homestay.
          </p>

          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Cập nhật lần cuối: 29 tháng 7 năm 2026
          </p>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS ────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mục lục
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {SECTIONS.map(({ id, icon: Icon, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-[--color-surface]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--color-primary)" }}
                />
                {title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-14">
          {SECTIONS.map(({ id, icon: Icon, title, content }) => (
            <div key={id} id={id} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(26,74,122,0.10), rgba(46,111,170,0.05))",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <h2
                  className="text-xl md:text-2xl font-bold pt-1.5"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {title}
                </h2>
              </div>

              <div className="ml-[60px] space-y-6">
                {content.map((block) => (
                  <div key={block.subtitle}>
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {block.subtitle}
                    </p>
                    <ul className="space-y-2.5">
                      {block.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: "var(--color-primary-light)",
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div
                className="mt-14 h-px"
                style={{ background: "var(--color-border)" }}
              />
            </div>
          ))}

          {/* Contact block */}
          <div
            id="contact"
            className="scroll-mt-24 rounded-3xl p-8 md:p-10"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(26,74,122,0.10), rgba(46,111,170,0.05))",
                }}
              >
                <Phone
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <h2
                className="text-xl md:text-2xl font-bold pt-1.5"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Liên hệ & hỗ trợ
              </h2>
            </div>

            <div className="ml-[60px] grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:admin@bachlinh.com.vn"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(26,74,122,0.08)" }}
                >
                  <Mail
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Email hỗ trợ
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    admin@bachlinh.com.vn
                  </p>
                </div>
              </a>

              <a
                href="tel:0931708256"
                className="flex items-center gap-3 p-4 rounded-2xl bg-white transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(26,74,122,0.08)" }}
                >
                  <Phone
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium mb-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Hotline 24/7
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    0931 708 256
                  </p>
                </div>
              </a>
            </div>

            <div className="ml-[60px] mt-5 flex flex-wrap gap-3">
              <Link href="/terms">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Điều khoản sử dụng
                </Button>
              </Link>
              <Link href="/payment-policy">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Chính sách thanh toán
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [x] **Step 2: Thêm link vào Footer**

File: `src/components/marketing/Footer.tsx`

Trước:
```tsx
  const navLinks = [
    { label: tNav("findRoom"), href: "/rooms" },
    { label: tNav("about"), href: "/about" },
    { label: tNav("contact"), href: "/contact" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách thanh toán", href: "/payment-policy" },
  ];
```
Sau:
```tsx
  const navLinks = [
    { label: tNav("findRoom"), href: "/rooms" },
    { label: tNav("about"), href: "/about" },
    { label: tNav("contact"), href: "/contact" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách thanh toán", href: "/payment-policy" },
    { label: "Chính sách hoạt động theo NĐ 248", href: "/chinh-sach-nd248" },
  ];
```

- [x] **Step 3: Xác nhận build + route**

Run: `pnpm build`
Expected: build liệt kê route mới `/vi/chinh-sach-nd248` (và `/en/chinh-sach-nd248`), không lỗi TypeScript/ESLint (icon `KeyRound`/`ShieldAlert`/`MessageSquare`/`Scale`/`Receipt` đều tồn tại trong `lucide-react`, đã xác minh trong `node_modules/lucide-react/dist/lucide-react.d.ts`).

- [x] **Step 4: Commit**

```bash
git add "src/frontend/src/app/[locale]/(marketing)/chinh-sach-nd248" src/frontend/src/components/marketing/Footer.tsx
git commit -m "feat(policy): add ND 248 operating policy page (CR-03)"
```

---

## Task 9: CR-04 — Bổ sung mục e, g, h vào trang Chính sách bảo mật

**Files:**
- Modify: `src/app/[locale]/(marketing)/privacy/page.tsx`

**Interfaces:** Không cần import mới — `UserCheck`, `Trash2`, `Bell` đã có sẵn trong import list của file này.

- [x] **Step 1: Chèn 3 section mới vào `SECTIONS`, ngay sau section `id: "rights"` và trước section `id: "cookies"`**

Trước (dòng 143-149):
```tsx
          "Nhận bản sao dữ liệu của bạn theo định dạng có thể đọc được",
        ],
      },
    ],
  },
  {
    id: "cookies",
```
Sau:
```tsx
          "Nhận bản sao dữ liệu của bạn theo định dạng có thể đọc được",
        ],
      },
    ],
  },
  {
    id: "edit-data",
    icon: UserCheck,
    title: "5b. Quyền xem, chỉnh sửa dữ liệu (mục e)",
    content: [
      {
        subtitle: "Cách thực hiện",
        items: [
          "Khách hàng có thể tự xem và chỉnh sửa thông tin trong mục \"Tài khoản\" trên website, hoặc gửi yêu cầu tới admin@bachlinh.com.vn.",
          "Yêu cầu được xử lý trong vòng 07 ngày làm việc.",
        ],
      },
    ],
  },
  {
    id: "delete-restrict",
    icon: Trash2,
    title: "5c. Quyền yêu cầu xóa, hủy hoặc hạn chế xử lý dữ liệu (mục g)",
    content: [
      {
        subtitle: "Cách thực hiện",
        items: [
          "Khách hàng có quyền yêu cầu xóa, hủy hoặc hạn chế xử lý dữ liệu cá nhân đã cung cấp bằng cách gửi yêu cầu qua hotline 0931 708 256 hoặc email admin@bachlinh.com.vn.",
          "Ba.Li Homestay xác minh và phản hồi trong vòng 07 ngày làm việc; một số dữ liệu bắt buộc lưu theo pháp luật kế toán, thuế sẽ được giữ đến hết thời hạn luật định.",
        ],
      },
    ],
  },
  {
    id: "security-complaint",
    icon: Bell,
    title: "5d. Tiếp nhận và giải quyết khiếu nại về bảo mật (mục h)",
    content: [
      {
        subtitle: "Kênh tiếp nhận",
        items: [
          "Mọi khiếu nại liên quan đến bảo mật thông tin được tiếp nhận qua hotline 0931 708 256 hoặc email admin@bachlinh.com.vn.",
          "Phản hồi ban đầu trong 02 ngày làm việc và giải quyết dứt điểm trong tối đa 07 ngày làm việc.",
        ],
      },
    ],
  },
  {
    id: "cookies",
```

- [x] **Step 2: Xác nhận build**

Run: `pnpm build`
Expected: `/vi/privacy` build không lỗi; mục lục (TOC) tự động hiện thêm 3 mục mới vì TOC render từ `SECTIONS`.

- [x] **Step 3: Commit**

```bash
git add "src/frontend/src/app/[locale]/(marketing)/privacy/page.tsx"
git commit -m "feat(privacy): add data access/deletion/complaint sections e, g, h (CR-04)"
```

---

## Task 10: CR-05 — Trang Điều khoản sử dụng: 3 chỗ cần sửa

**Files:**
- Modify: `src/app/[locale]/(marketing)/terms/page.tsx`

**Interfaces:** Thêm import icon `MapPin` (đã dùng phổ biến trong repo, ví dụ `Footer.tsx`).

- [x] **Step 1: Sửa nơi giải quyết tranh chấp** (dòng 214-222)

Trước:
```tsx
      {
        subtitle: "Quy trình khiếu nại",
        items: [
          "Bước 1: Liên hệ trực tiếp qua hotline hoặc email trong vòng 7 ngày kể từ khi phát sinh tranh chấp.",
          "Bước 2: Chúng tôi phản hồi và xử lý trong vòng 5 ngày làm việc.",
          "Bước 3: Nếu không đạt thỏa thuận, hai bên có thể yêu cầu hòa giải qua Hội bảo vệ người tiêu dùng.",
          "Bước 4: Trường hợp cuối cùng, tranh chấp được giải quyết tại Tòa án nhân dân có thẩm quyền tại Đà Nẵng.",
        ],
      },
```
Sau:
```tsx
      {
        subtitle: "Quy trình khiếu nại",
        items: [
          "Bước 1: Liên hệ trực tiếp qua hotline hoặc email trong vòng 7 ngày kể từ khi phát sinh tranh chấp.",
          "Bước 2: Chúng tôi phản hồi và xử lý trong vòng 5 ngày làm việc.",
          "Bước 3: Nếu không đạt thỏa thuận, hai bên có thể yêu cầu hòa giải qua Hội bảo vệ người tiêu dùng.",
          "Bước 4: Trường hợp cuối cùng, tranh chấp được giải quyết tại Tòa án nhân dân có thẩm quyền tại TP Hà Nội theo quy định pháp luật Việt Nam.",
        ],
      },
```

- [x] **Step 2: Sửa căn cứ pháp lý** (dòng 224-230)

Trước:
```tsx
      {
        subtitle: "Luật áp dụng",
        items: [
          "Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam.",
          "Luật Bảo vệ quyền lợi người tiêu dùng số 59/2010/QH12 và các văn bản hướng dẫn thi hành.",
          "Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân áp dụng song song với chính sách riêng tư của chúng tôi.",
        ],
      },
```
Sau:
```tsx
      {
        subtitle: "Luật áp dụng",
        items: [
          "Các điều khoản được điều chỉnh theo pháp luật Việt Nam, bao gồm Luật Thương mại điện tử 2025, Nghị định 248/2026/NĐ-CP, Luật Bảo vệ quyền lợi người tiêu dùng và các quy định về bảo vệ dữ liệu cá nhân hiện hành.",
        ],
      },
```

- [x] **Step 3: Thêm import icon `MapPin`**

Trước (dòng 4-17):
```tsx
import {
  FileText,
  UserCheck,
  CreditCard,
  CalendarX,
  Star,
  AlertTriangle,
  Scale,
  RefreshCw,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
```
Sau:
```tsx
import {
  FileText,
  UserCheck,
  CreditCard,
  CalendarX,
  Star,
  AlertTriangle,
  Scale,
  RefreshCw,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";
```

- [x] **Step 4: Thêm section mới "Điều kiện và giới hạn cung cấp dịch vụ" (Điều 9) vào cuối `SECTIONS`, và đổi số mục "Liên hệ & hỗ trợ" từ 10 → 11**

Trước (dòng 234-249, cuối mảng `SECTIONS`):
```tsx
  {
    id: "updates",
    icon: RefreshCw,
    title: "9. Cập nhật điều khoản",
    content: [
      {
        subtitle: "Thông báo thay đổi",
        items: [
          "Mọi thay đổi trọng yếu về điều khoản sẽ được thông báo qua email đăng ký ít nhất 7 ngày trước khi có hiệu lực.",
          "Thay đổi nhỏ (chính tả, cách diễn đạt không ảnh hưởng đến quyền lợi) có thể được áp dụng ngay.",
          "Lịch sử các phiên bản điều khoản được lưu trữ và cung cấp theo yêu cầu.",
        ],
      },
    ],
  },
];
```
Sau:
```tsx
  {
    id: "updates",
    icon: RefreshCw,
    title: "9. Cập nhật điều khoản",
    content: [
      {
        subtitle: "Thông báo thay đổi",
        items: [
          "Mọi thay đổi trọng yếu về điều khoản sẽ được thông báo qua email đăng ký ít nhất 7 ngày trước khi có hiệu lực.",
          "Thay đổi nhỏ (chính tả, cách diễn đạt không ảnh hưởng đến quyền lợi) có thể được áp dụng ngay.",
          "Lịch sử các phiên bản điều khoản được lưu trữ và cung cấp theo yêu cầu.",
        ],
      },
    ],
  },
  {
    id: "conditions",
    icon: MapPin,
    title: "10. Điều kiện và giới hạn cung cấp dịch vụ (Điều 9)",
    content: [
      {
        subtitle: "Giới hạn thời gian",
        items: [
          "Đặt theo giờ tối thiểu 2 giờ/lượt.",
          "Đặt theo ngày nhận phòng từ 14:00, trả phòng trước 12:00.",
        ],
      },
      {
        subtitle: "Phạm vi địa lý và đối tượng",
        items: [
          "Dịch vụ được cung cấp tại các chi nhánh của Ba.Li Homestay trên địa bàn TP Hà Nội.",
          "Khách đặt phòng phải đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.",
        ],
      },
      {
        subtitle: "Tính khả dụng",
        items: [
          "Dịch vụ có thể tạm ngừng hoặc gián đoạn vì lý do kỹ thuật, bảo trì hoặc sự kiện bất khả kháng.",
          "Ba.Li Homestay sẽ thông báo và cùng khách thỏa thuận phương án phù hợp.",
        ],
      },
    ],
  },
];
```

Trước (dòng 513-516, tiêu đề khối liên hệ ngoài `SECTIONS`):
```tsx
              >
                10. Liên hệ & hỗ trợ
              </h2>
```
Sau:
```tsx
              >
                11. Liên hệ & hỗ trợ
              </h2>
```

- [x] **Step 5: Xác nhận build + không còn "Đà Nẵng" trong file**

Run: `pnpm build`
Run: `grep -n "Đà Nẵng\|59/2010/QH12\|13/2023/NĐ-CP" "src/app/[locale]/(marketing)/terms/page.tsx"`
Expected: build pass; grep trả về rỗng.

- [x] **Step 6: Commit**

```bash
git add "src/frontend/src/app/[locale]/(marketing)/terms/page.tsx"
git commit -m "fix(terms): correct dispute venue, legal basis, add Dieu 9 service conditions (CR-05)"
```

---

## Task 11: CR-06 — Đồng bộ mốc hoàn tiền giữa Điều khoản & Chính sách thanh toán

**Files:**
- Modify: `src/app/[locale]/(marketing)/terms/page.tsx`
- Modify: `src/app/[locale]/(marketing)/payment-policy/page.tsx`

**Interfaces:** Không có — chỉ chuẩn hóa nội dung bullet list.

- [x] **Step 1: `terms/page.tsx` — chuẩn hóa "Quy trình hoàn tiền"** (mục 4, dòng 121-129)

Trước:
```tsx
      {
        subtitle: "Quy trình hoàn tiền",
        items: [
          "Hoàn tiền được xử lý trong vòng 3–7 ngày làm việc kể từ khi yêu cầu được chấp nhận.",
          "Tiền hoàn trả về đúng phương thức thanh toán ban đầu.",
          "Phí giao dịch ngân hàng (nếu có) do bên ngân hàng thu, Ba.Li Homestay không chịu trách nhiệm.",
          "Trường hợp hủy do sự cố kỹ thuật từ phía Ba.Li Homestay: hoàn 100% và được ưu đãi đặt phòng lần sau.",
        ],
      },
```
Sau:
```tsx
      {
        subtitle: "Quy trình hoàn tiền",
        items: [
          "Thẻ ngân hàng nội địa: 3–5 ngày làm việc.",
          "Thẻ quốc tế Visa/Mastercard: 7–15 ngày làm việc (tùy ngân hàng phát hành).",
          "Ví MoMo, ZaloPay: 1–3 ngày làm việc.",
          "Tiền hoàn trả về đúng phương thức thanh toán ban đầu. Phí giao dịch ngân hàng (nếu có) do ngân hàng thu.",
          "Ba.Li Homestay hiện không áp dụng cơ chế tích điểm/điểm thưởng quy đổi thành tiền mặt.",
          "Trường hợp hủy do sự cố kỹ thuật từ phía Ba.Li Homestay: hoàn 100% và được ưu đãi đặt phòng lần sau.",
        ],
      },
```

- [x] **Step 2: `payment-policy/page.tsx` — thêm dòng không tích điểm vào "Thời gian hoàn tiền"** (mục 5, dòng 155-163)

Trước:
```tsx
      {
        subtitle: "Thời gian hoàn tiền",
        items: [
          "Thẻ ngân hàng nội địa: 3–5 ngày làm việc kể từ khi yêu cầu được xử lý.",
          "Thẻ quốc tế Visa/Mastercard: 7–15 ngày làm việc (tùy ngân hàng phát hành).",
          "Ví MoMo, ZaloPay: 1–3 ngày làm việc.",
          "Phí giao dịch ngân hàng phát sinh từ phía ngân hàng (nếu có) không thuộc trách nhiệm của Ba.Li Homestay.",
        ],
      },
```
Sau:
```tsx
      {
        subtitle: "Thời gian hoàn tiền",
        items: [
          "Thẻ ngân hàng nội địa: 3–5 ngày làm việc kể từ khi yêu cầu được xử lý.",
          "Thẻ quốc tế Visa/Mastercard: 7–15 ngày làm việc (tùy ngân hàng phát hành).",
          "Ví MoMo, ZaloPay: 1–3 ngày làm việc.",
          "Phí giao dịch ngân hàng phát sinh từ phía ngân hàng (nếu có) không thuộc trách nhiệm của Ba.Li Homestay.",
          "Ba.Li Homestay hiện không áp dụng cơ chế tích điểm/điểm thưởng quy đổi thành tiền mặt.",
        ],
      },
```

- [x] **Step 3: Xác nhận 2 trang khớp mốc thời gian**

Run: `grep -n "3–5 ngày\|7–15 ngày\|1–3 ngày" "src/app/[locale]/(marketing)/terms/page.tsx" "src/app/[locale]/(marketing)/payment-policy/page.tsx"`
Expected: cả 2 file đều xuất hiện đủ 3 mốc, giá trị giống nhau.

- [x] **Step 4: Xác nhận build**

Run: `pnpm build`

- [x] **Step 5: Commit**

```bash
git add "src/frontend/src/app/[locale]/(marketing)/terms/page.tsx" "src/frontend/src/app/[locale]/(marketing)/payment-policy/page.tsx"
git commit -m "fix(policy): unify refund timeline and disclose no points program (CR-06)"
```

---

## Task 12: Nhóm C — Rà soát chéo toàn repo + nghiệm thu cuối

**Files:** Không tạo/sửa file mới trừ khi grep ở Step 1 phát hiện sót (nếu có, xử lý tại chỗ theo đúng logic Task 3-7).

- [x] **Step 1: Grep toàn `src/frontend/src` tìm địa danh sai còn sót**

Run:
```bash
grep -rnE "Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn|Da Nang|Hoi An|Phu Quoc|Da Lat" src/frontend/src --include="*.ts" --include="*.tsx" --include="*.json"
```
Expected: không có kết quả. Nếu còn sót (ví dụ trong `messages/en.json` hoặc component chưa khảo sát), sửa tại chỗ theo đúng cách tiếp cận Task 3-7 (thay bằng Hà Nội/Cầu Giấy/Đống Đa/Ba Đình tùy ngữ cảnh) rồi lặp lại grep tới khi sạch.

- [x] **Step 2: Lint**

Run: `pnpm lint` (trong `src/frontend`)
Expected: không lỗi mới phát sinh từ các file đã sửa trong Task 1-11.

- [x] **Step 3: Build**

Run: `pnpm build`
Expected: build thành công toàn bộ, liệt kê đủ các route: `/`, `/about`, `/rooms`, `/terms`, `/privacy`, `/payment-policy`, `/chinh-sach-nd248` (cả `vi` và `en`).

- [x] **Step 4: Kiểm tra tay qua dev server**

Run: `pnpm dev` (port 3000), sau đó mở trình duyệt kiểm:
- `/vi` — có block "Thông tin doanh nghiệp" phía trên footer, đủ 6 trường + hỗ trợ trực tuyến.
- Footer (mọi trang) — có tên công ty, MST, trụ sở, người đại diện, ngày/nơi cấp GCN, đủ 3 chi nhánh Hà Nội, link "Chính sách hoạt động theo NĐ 248".
- `/vi/chinh-sach-nd248` — render đủ mục I–VI, mục VI có placeholder ANTT.
- `/vi/privacy` — mục lục có thêm 3 mục 5b/5c/5d.
- `/vi/terms` — mục 8 ghi Tòa án Hà Nội, mục "Luật áp dụng" đã cập nhật, có mục 10 "Điều kiện và giới hạn cung cấp dịch vụ", khối liên hệ đổi số 11.
- `/vi/payment-policy` và `/vi/terms` — mốc hoàn tiền khớp nhau, có dòng không tích điểm.
- `/vi/about`, `/vi/rooms` — không còn nhắc Đà Nẵng/Hội An/Phú Quốc/Đà Lạt/Sài Gòn.
- View source `<head>` của `/` — `keywords` không còn "Đà Nẵng"/"Hội An".

Dừng lại và báo cáo cho reviewer nếu bất kỳ mục nào ở trên không đạt — không tự ý "sửa nhanh" ngoài phạm vi plan.

- [x] **Step 5: Commit (nếu Step 1 có sửa phát sinh)**

```bash
git add -A
git commit -m "fix: final sweep for remaining sample location references (Nhom C)"
```

Nếu Step 1 không phát hiện gì, bỏ qua bước commit này — không tạo commit rỗng.

---

## Self-Review Checklist (đã chạy khi viết plan)

- **Spec coverage:** CR-01 (Task 1-2), CR-02 (Task 3-6), CR-03 (Task 8), CR-04 (Task 9), CR-05 (Task 10), CR-06 (Task 11), CR-07 (Task 7), Nhóm C (Task 12) — đủ 7 CR + rà soát chéo theo spec.
- **Placeholder scan:** Chỉ 1 placeholder cố ý (`[Chờ bổ sung số/ngày/nơi cấp GCN ANTT]` — Task 8), đúng như quyết định trong spec, không phải TBD bỏ sót.
- **Type/reference consistency:** `MOCK_BRANCHES[0/1/2]` giữ nguyên index mapping xuyên suốt Task 3-4; `id` chi nhánh (`branch-da-nang-001/002`, `branch-hoi-an-001`) giữ nguyên xuyên suốt Task 3-5 để không phá tham chiếu; icon import đã xác minh tồn tại trong `lucide-react` trước khi đưa vào Task 8/10.
