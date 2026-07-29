# Thiết kế: Xử lý yêu cầu tuân thủ NĐ 248/2026/NĐ-CP

**Nguồn:** `docs/BaLi_YeuCau_KyThuat_ND248.md` — phản hồi chuyên viên Sở Công Thương (Phạm Văn Dương, 08/07/2026), hạn xử lý 30/09/2026.

## Bối cảnh

Website `bachlinh.com.vn` (Ba.Li Homestay) bị Online.gov.vn trả hồ sơ đăng ký TMĐT do thiếu thông tin chủ quản và các chính sách bắt buộc theo Luật TMĐT 2025 / NĐ 248/2026/NĐ-CP. Rà soát code phát hiện thêm: dữ liệu chi nhánh/phòng trên site là dữ liệu mẫu (Đà Nẵng, Hội An, Phú Quốc, Đà Lạt, Sài Gòn) không khớp Giấy ĐKDN thực (Hà Nội).

## Phạm vi

Thuần frontend (`src/frontend/`). Không đụng `src/backend/` (kể cả `prisma/seed.ts` — có seed data Đà Nẵng/Hội An nhưng nằm ngoài phạm vi đợt này). Nội dung mới chỉ tiếng Việt, theo đúng quy ước hiện tại của các trang `terms/privacy/payment-policy` (các trang này hiện không thực sự bilingual — `/en/...` vẫn hiện nội dung tiếng Việt hardcode).

## Quyết định dữ liệu thiếu

- **Chi nhánh/phòng thật (CR-02):** dùng 3 chi nhánh Hà Nội đã có sẵn trong `Footer.tsx` (Cầu Giấy, Đống Đa, Ba Đình) làm chuẩn — khớp GCN ĐKDN Hà Nội.
- **GCN đủ điều kiện ANTT (CR-03 mục VI):** chưa có số/ngày/nơi cấp — đăng placeholder rõ ràng `[Chờ bổ sung số/ngày/nơi cấp GCN đủ điều kiện ANTT]`, không block các mục còn lại.
- **Người đại diện pháp luật, ngày cấp GCN ĐKDN (CR-01):** dùng đúng dữ liệu đã cho trong văn bản nguồn (Nguyễn Lan Phương — Giám đốc; 04/05/2026).

## Kiến trúc thay đổi theo nhóm

### Nhóm A — Nội dung mới / bổ sung

| CR | File | Thay đổi |
|----|------|----------|
| CR-01 | `messages/vi.json` (namespace `footer`) | Thêm `legalRepresentative`, `legalRepresentativeTitle`, `businessRegDate`, `businessRegIssuer` |
| CR-01 | `src/components/marketing/Footer.tsx` | Hiển thị các trường mới ở khối công ty |
| CR-01 | `src/components/marketing/HomeBusinessInfo.tsx` (mới) | Block "THÔNG TIN DOANH NGHIỆP" — nguyên văn theo mục C/CR-01 |
| CR-01 | `src/app/[locale]/(marketing)/page.tsx` | Chèn `<HomeBusinessInfo />` sau `<HomeCtaSection />`, trước khi đóng div (đứng ngay trên Footer theo layout) |
| CR-03 | `src/app/[locale]/(marketing)/chinh-sach-nd248/page.tsx` (mới) | Trang chính sách, tái dùng pattern hero + TOC + `SECTIONS` từ `terms/page.tsx`; nội dung 6 mục I–VI nguyên văn theo CR-03 |
| CR-03 | `src/components/marketing/Footer.tsx` | Thêm link "Chính sách hoạt động theo NĐ 248" vào `navLinks`, trỏ `/chinh-sach-nd248` |
| CR-04 | `src/app/[locale]/(marketing)/privacy/page.tsx` | Thêm 3 phần tử vào `SECTIONS`: mục e, g, h (nguyên văn CR-04) |
| CR-05 | `src/app/[locale]/(marketing)/terms/page.tsx` | Mục "8. Giải quyết tranh chấp": sửa tòa án Đà Nẵng → Hà Nội; sửa căn cứ pháp lý; thêm mục con "Điều kiện và giới hạn cung cấp dịch vụ" (Điều 9) |
| CR-06 | `src/app/[locale]/(marketing)/terms/page.tsx` + `payment-policy/page.tsx` | Đồng bộ mốc hoàn tiền theo bảng chuẩn CR-06 (nội địa 3–5 ngày, quốc tế 7–15 ngày, ví 1–3 ngày) + thêm dòng "không tích điểm quy đổi tiền mặt" |

### Nhóm B — Sửa dữ liệu sai địa điểm

| CR | File | Thay đổi |
|----|------|----------|
| CR-02 | `src/lib/mock/branches.ts` | Thay 3 branch Đà Nẵng/Hội An bằng 3 branch Hà Nội (Cầu Giấy, Đống Đa, Ba Đình) — giữ shape `Branch` type, cập nhật `id/name/address/city/description/latitude/longitude` |
| CR-02 | `src/lib/mock/rooms.ts` | Re-point toàn bộ `branchId`/`branch` của các room object về 3 branch mới; scrub text mô tả gắn địa danh sai (vd "view phố Bạch Đằng", "gần biển Mỹ Khê") thành mô tả trung tính phù hợp Hà Nội. Giữ nguyên số lượng phòng, giá, tiện nghi, ảnh |
| CR-02 | `src/app/[locale]/(marketing)/about/page.tsx` | Thay `STATS` (bỏ "3 Thành phố · Đà Nẵng · Đà Lạt · Phú Quốc"), `VALUES` (bỏ câu nhắc Đà Nẵng/Phú Quốc), `BRANCHES` array thành 3 chi nhánh Hà Nội thật; sửa các đoạn văn kể chuyện nhắc "Đà Nẵng", "Đà Lạt", "Phú Quốc" |
| CR-07 | `src/app/layout.tsx` | `metadata.keywords`: bỏ "Đà Nẵng", "Hội An", thay bằng từ khóa Hà Nội (vd "Hà Nội", "Cầu Giấy", "homestay Hà Nội") |

### Nhóm C — Rà soát chéo

Sau khi Nhóm B hoàn tất: grep toàn `src/frontend/src` (trừ `node_modules`, `.next`) tìm `Đà Nẵng|Hội An|Phú Quốc|Đà Lạt|Sài Gòn|Da Nang|Hoi An|Phu Quoc|Da Lat`. Xử lý các chỗ còn sót (nếu có, vd trong `messages/en.json`, component khác chưa phát hiện lúc khảo sát).

## Không làm trong đợt này

- Backend (`src/backend/prisma/seed.ts`, DB thật) — vẫn seed Đà Nẵng/Hội An, cần xử lý ở đợt sau, không nằm trong cam kết hạn 30/09 (giao diện web là điều chuyên viên yêu cầu).
- Bản tiếng Anh cho nội dung mới — giữ nguyên hiện trạng VN-only của các trang chính sách.
- Không tự ý điền số liệu GCN ANTT — để placeholder chờ doanh nghiệp cung cấp.

## Kiểm thử / Nghiệm thu

- `pnpm build` và `pnpm lint` tại `src/frontend/` không lỗi.
- Chạy dev server, tay kiểm: trang chủ hiện block CR-01 đúng vị trí; `/vi/chinh-sach-nd248` render đủ 6 mục; `/vi/privacy` có thêm mục e/g/h; `/vi/terms` đúng tòa án Hà Nội + căn cứ pháp lý mới + mục Điều 9; `/vi/payment-policy` và `/vi/terms` khớp mốc hoàn tiền; `/vi/about` và `/vi/rooms` không còn địa danh sai; view-source `<head>` không còn "Đà Nẵng/Hội An" trong keywords.
- Grep xác nhận (Nhóm C) trả về rỗng ngoài các chỗ được cố ý giữ lại (nếu có, ví dụ trong chính file yêu cầu `docs/`).
