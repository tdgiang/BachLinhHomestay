# Test Report: Tuân thủ NĐ 248/2026/NĐ-CP (ComplaintsModule + nội dung công bố)

**Ngày:** 2026-09-18 11:45
**Nhánh:** `production` (HEAD `74d1f35`, thay đổi chưa commit)
**Người kiểm thử:** Claude (tự động)
**Trạng thái:** ⚠️ PASSED WITH WARNINGS

---

## Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| TypeScript | 0 lỗi trong file đã đụng (14 lỗi tồn tại sẵn ở file khác) |
| Unit test backend | 113/113 pass (service coverage 92,3% stmts) |
| Unit test frontend | 68/68 pass |
| Code review | 3 Critical + 9 Important + 7 Minor → **đã sửa 12, còn 4 hoãn** |
| E2E | 8/8 kịch bản pass (2 lỗi phát hiện trong lúc test, đã sửa và test lại) |
| Build | Backend + frontend đều compile sạch |
| **Tổng** | **PASSED WITH WARNINGS** — xem mục "Còn tồn tại" |

Lý do chưa phải PASSED hoàn toàn: backend không có hệ thống gửi email
(quyết định về phạm vi thuộc về người dùng), và các giới hạn số lượng công bố
theo Điều 9 chưa được code cưỡng chế.

---

## Phase 0: TypeScript

```
Backend : npx tsc --noEmit  → 1 lỗi, ở src/modules/users/application/users.service.spec.ts:29
Frontend: npx tsc --noEmit  → 13 lỗi, ở src/lib/mock/{bookings,rooms}.test.ts
```

Cả 14 lỗi đều nằm ở file **không thuộc thay đổi này** (`git status` xác nhận
không sửa đổi). Lọc riêng các file mới/đã sửa: **0 lỗi**.

---

## Phase 1: Unit test

### Backend (Jest)

```
npm test                              → 11 suites, 113 tests, 113 passed
npx jest --testPathPatterns=complaints →  1 suite,   16 tests,  16 passed
```

Coverage module `complaints`:

| File | % Stmts | % Lines |
|---|---|---|
| `application/complaints.service.ts` | 92,3 | 97,0 |
| `infrastructure/complaints.repository.ts` | 60,0 | 50,0 |
| `interface/complaints.controller.ts` | 0 | 0 |

Controller không có unit test riêng — giống module `reviews` hiện có. Bù lại
toàn bộ 6 endpoint được kiểm thử trực tiếp qua HTTP ở Phase 3.

### Frontend (Vitest)

```
pnpm test → 9 files, 68 tests, 68 passed
```

Bao gồm `src/__tests__/nd248-disclosure.test.ts` (23 test) kiểm tra nội dung
công bố khớp thực tế hệ thống.

**Kiểm chứng test không rỗng (mutation test):** cố ý đổi
`privacy.resolutionDays` ở backend từ 30 → 14 và thêm lại chuỗi "5+ chi nhánh"
vào `messages/vi.json`. Kết quả: **2 test fail đúng như mong đợi**, sau đó khôi
phục và xanh lại. Guard hoạt động thật.

---

## Phase 2: Code review

Đã dispatch subagent review toàn bộ working tree. Kết quả: **3 Critical, 9
Important, 7 Minor**. Từng mục đã được kiểm chứng độc lập trước khi sửa.

### Critical — đã sửa cả 3

**C1. Mã phiếu đoán được → endpoint public trở thành kênh rò rỉ dữ liệu**

Xác minh: hậu tố 4 chữ số = 10.000 mã/ngày, định dạng `KN-YYYYMMDD-XXXX` được
công bố ngay trên website, `GET /complaints/track/:code` là `@Public()` không
giới hạn riêng. Quét hết một ngày lộ tiêu đề phiếu + nội dung phản hồi của
nhân viên, trong đó có cả phiếu nhóm `privacy`.

Đã sửa: hậu tố 8 ký tự Crockford base32 qua `crypto.randomBytes`.

```
Keyspace:  10.000  →  1.099.511.627.776  (gấp ~110 triệu lần)
Thời gian kỳ vọng dò trúng 1 mã (100 phiếu/ngày, 20 req/phút): ~1.046 năm
```

Thêm `@Throttle({ limit: 20, ttl: 60_000 })` riêng cho route tra cứu.

**C2. Check-then-insert làm mất phiếu của khách**

Xác minh: `findFirst({code})` rồi mới `create()` — không nguyên tử. Hai request
đồng thời rút trúng cùng số đều qua được bước kiểm tra; request thua đụng unique
index, `PrismaClientExceptionFilter` trả 409 và giao diện hiển thị nguyên văn
"Cột trùng lặp: code". Nhánh dự phòng còn tệ hơn: `Date.now().toString().slice(-6)`
sinh **6** chữ số, vi phạm định dạng đã công bố và chính assertion trong test của
module (kiểm chứng bằng Node: `/^KN-\d{8}-\d{4}$/.test(...)` → `false`).

Đã sửa: bỏ bước kiểm tra trước, để unique index phân xử, bắt P2002 và sinh mã
mới, tối đa 5 lần. Bỏ hẳn nhánh dự phòng sai định dạng.

Phát sinh khi sửa: `String(error.meta?.target ?? '')` — ép chuỗi object cho ra
`"[object Object]"` khiến điều kiện luôn sai và phiếu vẫn mất. ESLint bắt được
(`no-base-to-string`). Đã tách thành `isDuplicateCodeError()` xử lý đúng cả
mảng, chuỗi và trường hợp không xác định.

**C3. Website hứa gửi email nhưng backend không có mailer**

Xác minh: `grep -rlE "nodemailer|MailerService|sendMail|EmailService" src/` →
**0 kết quả**. Trong khi đó trang Liên hệ hứa "thông báo kết quả bằng văn bản
qua email" và giao diện tra cứu bảo khách "Kiểm tra lại mã trong email xác nhận"
— một email không bao giờ được gửi.

Đã sửa **phần công bố sai**: viết lại Bước 02 và Bước 04 thành mô tả đúng quy
trình thực tế (nhân viên liên hệ qua điện thoại hoặc email, kết quả ghi vào
phiếu và khách xem bằng mã). Bỏ câu nhắc "email xác nhận".

Thêm test tự động: nếu backend vẫn chưa có mailer mà trang Liên hệ hứa gửi email
thì test fail.

**Chưa sửa (cần người dùng quyết định):** khách mất mã phiếu thì không có cách
khôi phục. Xem mục "Còn tồn tại".

### Important — đã sửa 6/9

| # | Vấn đề | Trạng thái |
|---|---|---|
| I1 | Hero vẫn quảng cáo "5+ chi nhánh", lưới tính năng "3 chi nhánh"; bản tiếng Anh còn "5+ **beachside** branches" (ở Hà Nội) | ✅ Sửa cả 4 chuỗi; guard cũ chỉ đọc `footer.tagline` nên bỏ lọt — đã mở rộng quét toàn bộ file ngôn ngữ |
| I2 | Điều 11 mô tả thuật toán xếp hạng mà `rooms.service.ts` không hề chạy (rating, số đơn, nhãn nổi bật đều không ảnh hưởng thứ tự) | ✅ Viết lại đúng cơ chế thật: lọc theo bộ lọc + sắp xếp theo thời điểm đăng / lựa chọn của khách. Thêm test đọc `rooms.service.ts` và fail nếu công bố lệch code |
| I3 | Bảng SLA theo nhóm mâu thuẫn với con số cứng 2/7 mà API trả về cùng trang | ✅ Tạo `complaint-sla.ts` (backend) + `COMPLAINT_SLA` (frontend); API trả SLA đúng nhóm; test đọc cả hai file và fail nếu lệch |
| I4 | Admin cắt ở 100 phiếu, hiển thị `items.length` thay vì `meta.total` → giấu đúng các phiếu quá hạn | ✅ Dùng `meta.total`, ghi rõ "đang hiển thị N mới nhất" |
| I5 | POST public không có giới hạn riêng (100/phút ≈ 144.000 phiếu rác/ngày) | ✅ `@Throttle({ limit: 5, ttl: 1 giờ })` |
| I6 | Phần ngày trong mã phiếu lấy theo giờ máy (UTC), lệch ngày tiếp nhận | ✅ Dùng `Intl.DateTimeFormat` với `Asia/Ho_Chi_Minh`; có test giả lập 17/09 23:30 UTC → mã phải là `KN-20260918-` |
| I7 | `legal.ts` tự nhận là nguồn duy nhất nhưng trang Liên hệ hardcode hotline, email, địa chỉ | ✅ Trang Liên hệ đọc từ `COMPANY` và `BRANCHES` |
| I8 | Giới hạn số lượng công bố theo Điều 9 nhưng code không cưỡng chế | ⏸️ Hoãn — xem "Còn tồn tại" |
| I9 | SLA về dữ liệu cá nhân có 4 giá trị mâu thuẫn rải trên `/privacy` | ⏸️ Hoãn — file có sẵn từ trước, xem "Còn tồn tại" |

### Minor — đã sửa 4/7

- ✅ `resolvedAt` không bị xóa khi mở lại phiếu → nay gán `null`, có test.
- ✅ Admin nuốt mọi lỗi thành "Cập nhật thất bại" → nay hiện thông báo thật từ API.
- ✅ Badge "Quá hạn 7 ngày" dùng số cứng → nay lấy ngưỡng theo đúng nhóm vấn đề, hệ số 1,4 quy đổi ngày làm việc sang ngày lịch.
- ✅ Hàm `daysOpen` chú thích "ngày làm việc" nhưng chia theo ngày lịch → đổi tên `calendarDaysOpen`, tách `isOverdue`.
- ⏸️ `createComplaint`/`trackComplaint` không có nhánh `isMock`.
- ⏸️ Thiếu index `(deleted_at, status)` và `(deleted_at, created_at)`.
- ⏸️ Trang Liên hệ và admin hardcode tiếng Việt nên `/en/contact` vẫn ra tiếng Việt.

---

## Phase 3: E2E (Playwright MCP, Chromium)

Base URL `http://localhost:3000` · API `http://localhost:4000` · PostgreSQL + Redis qua Docker.

| # | Kịch bản | Kết quả | Ảnh |
|---|---|---|---|
| 1 | Trạng thái rỗng (admin, DB sạch) | ✅ PASS | `nd248-empty-state-2026-09-18.png` |
| 2 | Validation biểu mẫu | ✅ PASS *(sau khi sửa lỗi phát hiện)* | `nd248-validation-2026-09-18.png` |
| 3 | Happy path — gửi phiếu | ✅ PASS | `nd248-happy-path-2026-09-18.png` |
| 4 | Edge case — tra mã không tồn tại | ✅ PASS | — |
| 5 | Bảo mật — rò rỉ PII và phân quyền | ✅ PASS | — |
| 6 | Rate limit | ✅ PASS | — |
| 7 | Vòng đời đầy đủ — admin phản hồi, khách xem lại | ✅ PASS | `nd248-admin-queue-2026-09-18.png` |
| 8 | Bảng SLA khớp biên nhận | ✅ PASS | `nd248-sla-table-2026-09-18.png` |

### Lỗi phát hiện trong lúc E2E (không có trong code review)

**E1. Biểu mẫu chặn submit nhưng không hiện lỗi nào — người dùng bị kẹt im lặng**

Nhập dữ liệu sai toàn bộ rồi bấm Gửi: form không submit, cũng **không hiển thị
thông báo lỗi nào**. Accessibility tree xác nhận không có phần tử lỗi; con trỏ
nhảy vào ô Email.

Nguyên nhân: form thiếu `noValidate`. Input `type="email"` kích hoạt native
constraint validation của trình duyệt, chặn submit **trước khi** `handleSubmit`
của react-hook-form chạy, nên zod không bao giờ được gọi và toàn bộ thông báo
tiếng Việt không xuất hiện. Kiểm chứng: sửa riêng email thành hợp lệ, giữ các ô
khác sai → 4 thông báo zod hiện ra bình thường.

Ảnh hưởng tuân thủ: Điều 7a yêu cầu kênh tiếp nhận trực tuyến hoạt động được.
Một biểu mẫu từ chối im lặng là kênh hỏng trên thực tế.

Đã sửa: thêm `noValidate`. Test lại: 5/5 thông báo hiện đúng tiếng Việt, gồm cả
"Email không hợp lệ".

**E2. Lỗi throttle hiện nguyên văn tiếng Anh cho khách**

Khi vượt giới hạn, giao diện hiển thị `ThrottlerException: Too Many Requests`.
Đã sửa: thêm `describeSubmitError()` ánh xạ 429 sang câu tiếng Việt kèm hướng
dẫn gọi hotline.

### Chi tiết vài kịch bản

**Kịch bản 5 — bảo mật**

```
Tra cứu công khai trả về: category, code, createdAt, resolvedAt,
                          respondedAt, response, status, subject
PII bị lộ: KHÔNG  (không có email, phone, fullName, content, id)

GET    /complaints        chưa đăng nhập → 401
GET    /complaints/:id    chưa đăng nhập → 401
PATCH  /complaints/:id    chưa đăng nhập → 401
DELETE /complaints/:id    chưa đăng nhập → 401
GET    /complaints        token role=customer → 403
```

**Kịch bản 6 — rate limit**

```
Trước khi sửa: 120 POST liên tiếp → 84× 201, 36× 429  (giới hạn chung 100/phút)
Sau khi sửa  :   7 POST liên tiếp → 5× 201,  2× 429  (giới hạn riêng 5/giờ)
```

**Kịch bản 7 — vòng đời đầy đủ**

Gửi phiếu nhóm `privacy` trên trình duyệt → nhận `KN-20260918-HBCTG6C1`, biên
nhận ghi **72 giờ / 30 ngày** đúng bằng bảng công bố phía trên cùng trang →
admin viết phản hồi, chuyển "Đã giải quyết" → khách tra cứu lại thấy phản hồi,
`resolvedAt` có giá trị, **vẫn không lộ PII** → chuyển ngược về "Đang xử lý" →
`resolvedAt` trở về `null`.

**Kịch bản 8 — bảng SLA**

Bảng hiển thị 6 dòng sinh từ `COMPLAINT_SLA`: booking 24h/02 ngày làm việc,
payment 24h/05, refund 48h/07, service 48h/07, privacy 72h/30 ngày, other 48h/07.
Biên nhận API trả đúng con số của nhóm khách chọn.

---

## Còn tồn tại (cần người dùng quyết định)

**1. Không có hệ thống gửi email — khách mất mã phiếu là mất luôn phiếu** *(từ C3)*

Mã phiếu chỉ hiện một lần trên màn hình. Không có cách tra lại bằng email hay
số điện thoại. Khách gửi trên điện thoại rồi đóng tab sẽ không bao giờ theo dõi
được, và phản hồi của nhân viên không tới được ai.

Nội dung công bố đã sửa cho khớp thực tế, nên **không còn công bố sai**, nhưng
đây vẫn là điểm yếu của kênh Điều 7 trong tình huống thông thường.

Hai hướng: (a) dựng mailer — cần thông tin SMTP hoặc API key dịch vụ gửi mail;
(b) thêm tra cứu bằng email + số điện thoại. Cả hai đều vượt phạm vi đã thống
nhất nên chưa làm.

**2. Giới hạn số lượng theo Điều 9 — ĐÃ CƯỠNG CHẾ** *(I8, bổ sung 2026-09-18)*

Xem mục "Bổ sung: cưỡng chế Điều 9d" ở cuối báo cáo.

**3. SLA về dữ liệu cá nhân mâu thuẫn trong `/privacy`** *(I9)*

Trang `/privacy` (có sẵn từ trước) nêu 4 mốc khác nhau cho cùng một loại yêu
cầu: "07 ngày làm việc", "02–07 ngày làm việc", "7–14 ngày làm việc", "3 ngày
làm việc… lên đến 14 ngày làm việc". Bảng mới ở trang Liên hệ ghi 72 giờ/30 ngày.

Thay đổi này không tạo ra mâu thuẫn đó, nhưng `POLICY_INDEX` nay đưa `/privacy`
lên làm nội dung công bố chính thức cho Điều 5, đặt cạnh con số mới. Nên rà lại
toàn trang `/privacy` và thống nhất một mốc.

**4. Các mục Minor còn lại**

Thiếu nhánh mock, thiếu index composite, trang `/en/contact` vẫn ra tiếng Việt.
Không cản trở hồ sơ đăng ký.

---

## Kiến nghị

1. Quyết định hướng xử lý mục 1 và 2 ở trên — cả hai đều ảnh hưởng tới điều
   Sở Công Thương có thể kiểm chứng trực tiếp.
2. Rà lại `/privacy`, thống nhất một mốc thời hạn duy nhất cho yêu cầu dữ liệu
   cá nhân.
3. Chạy `npx prisma migrate deploy` trên DB production **trước** khi deploy code.
4. Lưu ý: `npm run lint` ở backend là `eslint --fix` và sẽ format lại 51 file
   không liên quan. Trong lần chạy này đã khôi phục chúng để giữ diff sạch. Nên
   chạy `npx eslint <path> --no-fix` khi chỉ muốn kiểm tra.
5. Cân nhắc `app.set('trust proxy', …)` trước khi lên production: sau nginx/Docker,
   `req.ip` là IP của proxy nên mọi khách dùng chung một bucket throttle.

---

## Artifacts

- Ảnh chụp: `test-artifacts/nd248-*.png` (5 tệp)
- Báo cáo này: `test-reports/nd248-compliance-2026-09-18.md`


---

# Bổ sung: cưỡng chế giới hạn số lượng (Điều 9d)

**Thời điểm:** 2026-09-18, sau báo cáo chính.

## Khai thác đã xác minh trước khi sửa

Gọi thẳng API với dữ liệu hợp lệ về mặt DTO:

| Hành vi | Kết quả trước khi sửa |
|---|---|
| Giữ phòng 12 giờ nhưng khai `numHours: 3` | **Tạo được** — giữ 12 giờ, trả tiền 3 giờ |
| `numGuests: 99` cho phòng sức chứa 4 | **Tạo được** — chỉ bị tính phụ thu, không bị chặn |
| Đặt 365 đêm liên tục | **Tạo được** |
| Đặt theo giờ 13 giờ | **Tạo được** |
| Đơn thứ 4, 5… của cùng một khách | **Tạo được** |

Mục thứ nhất là lỗ hổng doanh thu, không chỉ là vấn đề tuân thủ: `numHours`
quyết định số tiền còn `checkIn`/`checkOut` quyết định thời gian khóa phòng, và
hai giá trị này chưa bao giờ được đối chiếu.

## Đã sửa

`src/backend/src/modules/bookings/application/booking-limits.ts` (mới) giữ các
con số công bố; `bookings.service.ts` cưỡng chế qua
`assertWithinPublishedLimits()` gọi trước khi tính tiền:

| Giới hạn | Giá trị | Ghi chú |
|---|---|---|
| Đối chiếu `numHours` ↔ khoảng thời gian | sai lệch ≤ 1 giờ | Chặn bán hụt giờ |
| Giờ tối thiểu | 2 | Sàn cứng; phòng khai cao hơn thì lấy giá trị cao hơn |
| Giờ tối đa | 12 | |
| Đêm tối đa | 30 | |
| Số khách | ≤ sức chứa phòng | Trước đây không kiểm tra |
| Đơn hiệu lực / khách | 3 | Đếm theo `userId`, khách vãng lai theo số điện thoại |
| `checkOut` > `checkIn` | bắt buộc | Trước đây không kiểm tra |

## Hai chỗ nội dung công bố phải sửa theo

**"Tối đa 03 phòng mỗi giao dịch"** — API đặt một phòng mỗi request, không có
khái niệm giao dịch nhiều phòng, nên câu này không cưỡng chế được như đã viết.
Điều 9d cho phép giới hạn "cho mỗi giao dịch **hoặc cho mỗi khách hàng**", nên
đã đổi thành "mỗi khách hàng giữ tối đa 03 đơn đặt phòng đang hiệu lực" — cưỡng
chế được và đã cưỡng chế.

**"Tối đa 05 đơn chờ thanh toán"** — đã **bỏ khỏi cả code lẫn nội dung công bố**.
Đơn chờ thanh toán là tập con của đơn hiệu lực, mà trần đơn hiệu lực là 3, nên
ngưỡng 5 không bao giờ chạm tới. Công bố một giới hạn không bao giờ kích hoạt
chỉ gây hiểu nhầm.

## Kiểm chứng

Unit test backend: 20 test cho module bookings (thêm 10 test mới), tổng
**123/123 pass**. Frontend **73/73 pass**.

Guard chống lệch mới ở `nd248-disclosure.test.ts`: đọc `booking-limits.ts` của
backend, so từng con số với `BOOKING_LIMITS` của frontend, kiểm tra
`bookings.service.ts` thực sự tham chiếu từng hằng số, và đối chiếu với chữ
hiển thị trên trang Điều khoản.

Mutation test: đổi `maxNights` 30→60 ở backend → guard fail; vô hiệu hóa kiểm
tra sức chứa → guard fail; khôi phục → xanh lại.

Gọi API thật sau khi sửa:

```
giữ 12h khai 3h      CHẶN: Số giờ đặt (3) không khớp khoảng thời gian đã chọn (12.0 giờ)
99 khách / phòng 4   CHẶN: Phòng này chứa tối đa 4 khách, bạn đã chọn 99 khách
365 đêm              CHẶN: Mỗi lượt đặt tối đa 30 đêm liên tục, bạn đã chọn 365 đêm
13 giờ               CHẶN: Đặt theo giờ tối đa 12 giờ mỗi lượt
2 giờ (phòng cần 3)  CHẶN: Phòng này yêu cầu đặt tối thiểu 3 giờ
đơn thứ 4 cùng SĐT   CHẶN: Bạn đang có 3 đơn đặt phòng hiệu lực
3 giờ khớp khung     QUA  -> HMS-MU6LQN7Y
```

Lint: `booking-limits.ts` sạch; `bookings.service.ts` giữ nguyên 30 vấn đề như
baseline trước khi sửa (đã đo bằng `git stash` để so sánh) — thay đổi này không
thêm vấn đề nào.

## Phát hiện mới trong lúc test: dữ liệu seed mâu thuẫn công bố Điều 9b

`src/backend/prisma/seed.ts` tạo **3 chi nhánh ở TP. Hồ Chí Minh, Đà Lạt và
Phú Quốc** ("Ba.Li Homestay — Phú Quốc Beachside", "68 Trần Hưng Đạo, Dương Tơ,
Phú Quốc") cùng 9 phòng mang tên theo các địa phương đó. API đang chạy trả về
đúng dữ liệu này.

Trang `/terms` nay công bố: *"Dịch vụ chỉ được cung cấp trực tiếp tại cơ sở lưu
trú của Ba.Li Homestay: Số 66, Ngõ 61 Phạm Tuấn Tài… Nền tảng không cung cấp
dịch vụ ngoài địa điểm này."*

Guard `no-mismatched-locations.test.ts` tồn tại chính để chặn việc này nhưng chỉ
quét `src/` và `messages/` của frontend, không thấy `prisma/seed.ts` của backend
— nên vẫn xanh.

Đây là dữ liệu demo cho môi trường phát triển, không phải nội dung công bố, nên
**chưa sửa** — viết lại seed đụng 3 chi nhánh và 9 phòng, thuộc quyết định của
bạn. Hai hướng: sửa seed về một chi nhánh Cầu Giấy và mở rộng guard sang thư mục
backend, hoặc giữ nguyên nếu chắc chắn seed không bao giờ chạy trên production.
