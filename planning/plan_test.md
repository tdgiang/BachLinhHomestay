# Kế hoạch Test — Ocean Blue Homestay

> Tài liệu này mô tả test cases cho **từng chức năng** của hệ thống.  
> Base URL backend: `http://localhost:4000/api/v1` | Frontend: `http://localhost:3000`  
> Tài khoản test: `admin@homestay.vn` / `Admin@123`

---

## Mục lục

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Users (Người dùng)](#2-users)
3. [Branches (Chi nhánh)](#3-branches)
4. [Rooms (Phòng)](#4-rooms)
5. [Bookings (Đặt phòng)](#5-bookings)
6. [Payments / VNPay](#6-payments--vnpay)
7. [Vouchers](#7-vouchers)
8. [Reviews (Đánh giá)](#8-reviews)
9. [Reports (Báo cáo)](#9-reports)
10. [Frontend — Trang Marketing](#10-frontend--trang-marketing)
11. [Frontend — Admin Dashboard](#11-frontend--admin-dashboard)
12. [SEO & Performance](#12-seo--performance)
13. [Non-functional](#13-non-functional)

---

## 1. Authentication & Authorization

### 1.1 Đăng ký (Register)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.1.1 | Đăng ký thành công bằng email | `email`, `password` hợp lệ | 201, trả user (không có password) | ⬜ |
| 1.1.2 | Đăng ký bằng phone (không có email) | `phone`, `password` | 201, user được tạo | ⬜ |
| 1.1.3 | Đăng ký với fullName | `email`, `password`, `fullName` | 201, `fullName` được lưu đúng | ⬜ |
| 1.1.4 | Email đã tồn tại | email trùng | 409 ConflictException | ⬜ |
| 1.1.5 | SĐT đã tồn tại | phone trùng | 409 ConflictException | ⬜ |
| 1.1.6 | Password < 6 ký tự | `password: "123"` | 400 ValidationException | ⬜ |
| 1.1.7 | Không có email lẫn phone | chỉ có password | 400 ValidationException | ⬜ |
| 1.1.8 | Email không hợp lệ | `email: "notanemail"` | 400 ValidationException | ⬜ |

### 1.2 Đăng nhập (Login)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.2.1 | Đăng nhập bằng email thành công | `email`, `password` đúng | 200, `{ user, accessToken, refreshToken }` | ⬜ |
| 1.2.2 | Đăng nhập bằng phone thành công | `phone`, `password` đúng | 200, trả tokens | ⬜ |
| 1.2.3 | Sai password | password sai | 401 UnauthorizedException | ⬜ |
| 1.2.4 | Email không tồn tại | email không có | 401 UnauthorizedException | ⬜ |
| 1.2.5 | Tài khoản bị vô hiệu hóa | `isActive: false` | 401 "Tài khoản đã bị vô hiệu hóa" | ⬜ |
| 1.2.6 | Không có email lẫn phone | chỉ password | 401 UnauthorizedException | ⬜ |
| 1.2.7 | Response không chứa password/refreshTokenHash | - | password và refreshTokenHash bị loại khỏi response | ⬜ |
| 1.2.8 | accessToken có thể dùng để gọi API protected | login → dùng token | 200 trên endpoint cần auth | ⬜ |

### 1.3 Đăng xuất (Logout)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.3.1 | Logout thành công | Bearer token hợp lệ | 200, `{ success: true }` | ⬜ |
| 1.3.2 | refreshTokenHash bị xóa sau logout | logout → thử refresh | 401 "Refresh token đã bị thu hồi" | ⬜ |
| 1.3.3 | Logout không có token | no Authorization header | 401 Unauthorized | ⬜ |

### 1.4 Refresh Token

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.4.1 | Refresh thành công | refreshToken hợp lệ | 200, `{ accessToken, refreshToken }` mới | ⬜ |
| 1.4.2 | Token rotate — refreshToken cũ bị revoke | dùng refreshToken cũ sau khi refresh | 401 "Refresh token đã bị thu hồi" | ⬜ |
| 1.4.3 | refreshToken sai định dạng | "invalid-token" | 401 UnauthorizedException | ⬜ |
| 1.4.4 | Dùng accessToken thay vì refreshToken | gửi accessToken vào refresh | 401 "Token không hợp lệ" | ⬜ |
| 1.4.5 | Token hết hạn | token quá hạn | 401 "Refresh token không hợp lệ hoặc đã hết hạn" | ⬜ |

### 1.5 Thông tin tôi (GET /auth/me)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.5.1 | Lấy thông tin user hiện tại | Bearer token hợp lệ | 200, user object | ⬜ |
| 1.5.2 | Không có token | no header | 401 Unauthorized | ⬜ |

### 1.6 Route Guards

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1.6.1 | Endpoint admin chỉ chấp nhận role=admin | dùng token customer | 403 Forbidden | ⬜ |
| 1.6.2 | @Public endpoint không cần token | không có header | 200 OK | ⬜ |
| 1.6.3 | Token giả mạo | `Authorization: Bearer fake` | 401 Unauthorized | ⬜ |

---

## 2. Users

### 2.1 Tạo user (POST /users) — Admin only

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 2.1.1 | Admin tạo user thành công | email, password hợp lệ | 201, user không có password | ⬜ |
| 2.1.2 | Customer không thể tạo user | token role=customer | 403 Forbidden | ⬜ |
| 2.1.3 | Email trùng | email đã có | 409 Conflict | ⬜ |
| 2.1.4 | Response header Location | - | `Location: /api/v1/users/{id}` | ⬜ |

### 2.2 Danh sách users (GET /users) — Admin only

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 2.2.1 | Lấy danh sách có phân trang | `page=1&limit=5` | 200, `{ items, meta }` | ⬜ |
| 2.2.2 | Tìm kiếm theo fullName | `search=Admin` | items chứa user có tên Admin | ⬜ |
| 2.2.3 | Tìm kiếm theo email | `search=admin@` | kết quả phù hợp | ⬜ |
| 2.2.4 | Lọc theo isActive | `isActive=false` | chỉ user inactive | ⬜ |
| 2.2.5 | Sắp xếp theo createdAt desc | `sortBy=createdAt&sortOrder=desc` | user mới nhất trước | ⬜ |
| 2.2.6 | Cache hit | gọi 2 lần cùng query | lần 2 nhanh hơn (từ Redis) | ⬜ |

### 2.3 Chi tiết user (GET /users/:id)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 2.3.1 | Lấy user tồn tại | id hợp lệ | 200, user object | ⬜ |
| 2.3.2 | User không tồn tại | id không có | 404 NotFoundException | ⬜ |
| 2.3.3 | User đã soft-deleted | deletedAt ≠ null | 404 NotFoundException | ⬜ |

### 2.4 Cập nhật user (PATCH /users/:id)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 2.4.1 | Đổi fullName | `{ fullName: "Mới" }` | 200, fullName được cập nhật | ⬜ |
| 2.4.2 | Đổi password — được hash lại | `{ password: "newpass" }` | password trong DB là bcrypt hash | ⬜ |
| 2.4.3 | Cache bị invalidate sau update | update → GET | dữ liệu mới, không phải cache cũ | ⬜ |

### 2.5 Xóa user (DELETE /users/:id) — Admin, soft delete

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 2.5.1 | Soft delete thành công | id hợp lệ | 200, deletedAt được set | ⬜ |
| 2.5.2 | Sau soft delete — không tìm thấy qua GET | xóa → GET cùng id | 404 NotFoundException | ⬜ |
| 2.5.3 | User không tồn tại | id không có | 404 NotFoundException | ⬜ |

---

## 3. Branches

### 3.1 Danh sách chi nhánh (GET /branches) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 3.1.1 | Lấy tất cả chi nhánh | không filter | 200, 3 branches từ seed | ⬜ |
| 3.1.2 | Lọc theo city | `city=Đà Nẵng` | chỉ branches ở Đà Nẵng | ⬜ |
| 3.1.3 | Tìm kiếm theo tên | `search=Ocean` | branches chứa "Ocean" | ⬜ |
| 3.1.4 | Phân trang | `page=1&limit=2` | `meta.totalPages` đúng | ⬜ |
| 3.1.5 | Không cần auth | no header | 200 OK | ⬜ |

### 3.2 Chi tiết chi nhánh (GET /branches/:id) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 3.2.1 | Branch tồn tại | `branch-da-nang-001` | 200, đầy đủ thông tin | ⬜ |
| 3.2.2 | Branch không tồn tại | id sai | 404 NotFoundException | ⬜ |
| 3.2.3 | Cache hit | gọi 2 lần | lần 2 từ cache | ⬜ |

### 3.3 Tạo chi nhánh (POST /branches) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 3.3.1 | Admin tạo branch hợp lệ | `{ name, address, city }` | 201, branch mới | ⬜ |
| 3.3.2 | Thiếu trường bắt buộc | không có `name` | 400 ValidationException | ⬜ |
| 3.3.3 | Customer không thể tạo | role=customer | 403 Forbidden | ⬜ |

### 3.4 Cập nhật chi nhánh (PATCH /branches/:id) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 3.4.1 | Cập nhật phone | `{ phone: "0236..." }` | 200, phone mới | ⬜ |
| 3.4.2 | Vô hiệu hóa branch | `{ isActive: false }` | 200, isActive=false | ⬜ |
| 3.4.3 | Cache bị clear sau update | update → GET | dữ liệu mới | ⬜ |

### 3.5 Xóa chi nhánh (DELETE /branches/:id) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 3.5.1 | Xóa branch tồn tại | id hợp lệ | 200, `{ id }` | ⬜ |
| 3.5.2 | Branch không tồn tại | id sai | 404 NotFoundException | ⬜ |

---

## 4. Rooms

### 4.1 Danh sách phòng (GET /rooms) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.1.1 | Lấy tất cả phòng active | không filter | 200, 6 phòng từ seed | ⬜ |
| 4.1.2 | Lọc theo branchId | `branchId=branch-da-nang-001` | phòng thuộc chi nhánh đó | ⬜ |
| 4.1.3 | Lọc theo hourly | `type=hourly` | chỉ phòng `allowHourly=true` | ⬜ |
| 4.1.4 | Lọc theo priceMax | `priceMax=1000000` | phòng pricePerDay ≤ 1.000.000 | ⬜ |
| 4.1.5 | Lọc isFeatured | `isFeatured=true` | phòng nổi bật | ⬜ |
| 4.1.6 | Tìm kiếm theo tên | `search=Deluxe` | phòng có "Deluxe" trong tên | ⬜ |
| 4.1.7 | Response chứa branch và images | - | `branch.name` và `images[].url` có trong item | ⬜ |
| 4.1.8 | Decimal fields là số | - | `pricePerHour`, `ratingAvg` là float (không phải string) | ⬜ |
| 4.1.9 | Phân trang | `page=1&limit=2` | `meta.total=6`, items có 2 phần tử | ⬜ |

### 4.2 Chi tiết phòng (GET /rooms/:id) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.2.1 | Phòng tồn tại | `room-001` | 200, đầy đủ amenities, timeSlots, policies | ⬜ |
| 4.2.2 | Phòng không tồn tại | `room-9999` | 404 NotFoundException | ⬜ |
| 4.2.3 | Phòng đã xóa (soft delete) | deletedAt ≠ null | 404 NotFoundException | ⬜ |
| 4.2.4 | Response chứa description | - | `description`, `descriptionEn` có mặt | ⬜ |
| 4.2.5 | Cache hit | 2 lần GET cùng id | lần 2 từ cache | ⬜ |

### 4.3 Kiểm tra availability (GET /rooms/:id/availability)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.3.1 | Phòng trống trong khoảng thời gian | checkIn/checkOut không trùng booking nào | `{ available: true, conflicts: [] }` | ⬜ |
| 4.3.2 | Phòng đã bị đặt (overlap) | checkIn/checkOut trùng booking confirmed | `{ available: false, conflicts: [...] }` | ⬜ |
| 4.3.3 | Booking cancelled không tính conflict | trùng booking cancelled | `{ available: true }` | ⬜ |

### 4.4 Time slots (GET /rooms/:id/time-slots?date=)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.4.1 | Lấy time slots cho ngày | `date=2026-07-01` (thứ 4 = dayOfWeek 3) | danh sách slots phù hợp | ⬜ |
| 4.4.2 | Slot không thuộc ngày đó | dayOfWeek không khớp | slot đó không có trong kết quả | ⬜ |
| 4.4.3 | Phòng không có time slots | phòng chưa cấu hình | array rỗng | ⬜ |

### 4.5 Tạo phòng (POST /rooms) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.5.1 | Admin tạo phòng hợp lệ | đầy đủ fields bắt buộc | 201, room mới | ⬜ |
| 4.5.2 | Thiếu `branchId` | không có branchId | 400 ValidationException | ⬜ |
| 4.5.3 | Thiếu `pricePerHour` | - | 400 ValidationException | ⬜ |
| 4.5.4 | Customer không thể tạo | role=customer | 403 Forbidden | ⬜ |

### 4.6 Cập nhật phòng (PATCH /rooms/:id) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.6.1 | Đổi status sang maintenance | `{ status: "maintenance" }` | 200, status=maintenance | ⬜ |
| 4.6.2 | Đổi giá | `{ pricePerDay: 1500000 }` | 200, giá mới | ⬜ |
| 4.6.3 | Cache bị clear sau update | update → GET | không phải cache cũ | ⬜ |

### 4.7 Xóa phòng (DELETE /rooms/:id) — Admin, soft delete

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 4.7.1 | Soft delete thành công | id hợp lệ | 200, room với deletedAt | ⬜ |
| 4.7.2 | Sau xóa không hiện trong danh sách public | xóa → GET /rooms | phòng không còn | ⬜ |

---

## 5. Bookings

### 5.1 Tạo booking (POST /bookings) — Public (guest hoặc user)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.1.1 | Booking theo ngày thành công (khách vãng lai) | bookingType=daily, không có token | 201, bookingCode bắt đầu HMS- | ⬜ |
| 5.1.2 | Booking theo giờ thành công | bookingType=hourly, numHours=3 | 201, baseAmount = pricePerHour × 3 | ⬜ |
| 5.1.3 | Booking theo giờ không có numHours | bookingType=hourly, numHours bỏ trống | 400 "numHours bắt buộc" | ⬜ |
| 5.1.4 | Phòng không hoạt động (maintenance) | roomId phòng maintenance | 400 "Phòng hiện không nhận đặt" | ⬜ |
| 5.1.5 | Phòng đã có booking overlap | checkIn/checkOut trùng | 400 "Phòng đã được đặt" | ⬜ |
| 5.1.6 | Tính phụ thu người thêm | numGuests=3, room có extraPersonPrice | extraAmount = 2 × extraPersonPrice | ⬜ |
| 5.1.7 | Áp dụng voucher hợp lệ | voucherCode=SUMMER30, bookingAmount đủ | discountAmount > 0 | ⬜ |
| 5.1.8 | Voucher không hợp lệ | voucherCode=EXPIRED | 400 "Voucher đã hết hạn" | ⬜ |
| 5.1.9 | usedCount voucher tăng sau booking | tạo booking với voucher → check voucher | usedCount + 1 | ⬜ |
| 5.1.10 | Payment record được tạo cùng lúc | tạo booking | booking có payment record kèm theo | ⬜ |
| 5.1.11 | User đã đăng nhập — booking gắn với userId | gửi kèm token | booking.userId = id của user | ⬜ |
| 5.1.12 | Thiếu guestName | bỏ trống guestName | 400 ValidationException | ⬜ |

### 5.2 Tra cứu theo mã (GET /bookings/code/:code) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.2.1 | Mã đúng | `HMS-MP9K8E1P` | 200, booking đầy đủ thông tin kèm room | ⬜ |
| 5.2.2 | Mã không tồn tại | `HMS-INVALID` | 404 NotFoundException | ⬜ |

### 5.3 Chi tiết booking (GET /bookings/:id)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.3.1 | User đã đăng nhập xem booking của mình | token + id booking của user | 200, booking detail | ⬜ |
| 5.3.2 | Admin xem bất kỳ booking | admin token + bất kỳ id | 200 | ⬜ |
| 5.3.3 | ID không tồn tại | id sai | 404 NotFoundException | ⬜ |

### 5.4 Danh sách của tôi (GET /bookings/my)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.4.1 | User lấy bookings của mình | Bearer token | 200, chỉ bookings của user đó | ⬜ |
| 5.4.2 | Không có token | no header | 401 Unauthorized | ⬜ |
| 5.4.3 | Phân trang | `page=1&limit=5` | `meta` đúng | ⬜ |

### 5.5 Danh sách tất cả (GET /bookings) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.5.1 | Admin lấy tất cả | admin token | 200, tất cả booking | ⬜ |
| 5.5.2 | Lọc theo bookingStatus | `bookingStatus=pending` | chỉ booking pending | ⬜ |
| 5.5.3 | Lọc theo paymentStatus | `paymentStatus=paid` | chỉ booking đã thanh toán | ⬜ |
| 5.5.4 | Lọc theo fromDate/toDate | date range | booking trong khoảng ngày | ⬜ |
| 5.5.5 | Customer không được xem tất cả | token customer | 403 Forbidden | ⬜ |

### 5.6 Hủy booking (POST /bookings/:id/cancel)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.6.1 | User hủy booking của mình (pending) | token + id + reason | 200, bookingStatus=cancelled | ⬜ |
| 5.6.2 | User hủy booking đã confirmed | confirmed status | 200, bookingStatus=cancelled | ⬜ |
| 5.6.3 | Không thể hủy booking completed | completed status | 400 "Không thể hủy" | ⬜ |
| 5.6.4 | User không thể hủy booking người khác | userId khác | 403 ForbiddenException | ⬜ |
| 5.6.5 | Admin có thể hủy bất kỳ booking | admin token + bất kỳ id | 200 | ⬜ |
| 5.6.6 | Thiếu reason | body không có reason | 400 ValidationException | ⬜ |

### 5.7 Cập nhật trạng thái (PATCH /bookings/:id/status) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 5.7.1 | Admin xác nhận booking | `{ bookingStatus: "confirmed" }` | 200, status=confirmed | ⬜ |
| 5.7.2 | Admin check-in | `{ bookingStatus: "checked_in" }` | 200, status=checked_in | ⬜ |
| 5.7.3 | Admin check-out (completed) | `{ bookingStatus: "completed" }` | 200, status=completed | ⬜ |
| 5.7.4 | Thêm adminNote | `{ adminNote: "VIP guest" }` | 200, adminNote được lưu | ⬜ |
| 5.7.5 | Customer không thể đổi status | role=customer | 403 Forbidden | ⬜ |

---

## 6. Payments / VNPay

### 6.1 Tạo URL thanh toán VNPay (POST /payments/vnpay/create)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 6.1.1 | Tạo URL thành công | bookingId hợp lệ, token | 200, `{ paymentUrl }` bắt đầu bằng VNPay URL | ⬜ |
| 6.1.2 | URL chứa chữ ký HMAC-SHA512 | - | `vnp_SecureHash` có trong URL | ⬜ |
| 6.1.3 | Số tiền được nhân 100 | booking 500.000₫ | `vnp_Amount=50000000` | ⬜ |
| 6.1.4 | Booking không tồn tại | bookingId sai | 404 NotFoundException | ⬜ |

### 6.2 VNPay Callback (GET /payments/vnpay/callback) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 6.2.1 | Thanh toán thành công | `vnp_ResponseCode=00`, chữ ký đúng | Redirect đến `/booking/:id/success` | ⬜ |
| 6.2.2 | Thanh toán thất bại | `vnp_ResponseCode=24` (hủy) | Redirect đến `/payment/callback?error=24` | ⬜ |
| 6.2.3 | Chữ ký sai | `vnp_SecureHash` không khớp | Redirect với `error=invalid_signature` | ⬜ |
| 6.2.4 | Sau thanh toán thành công — status cập nhật | responseCode=00 → GET booking | `paymentStatus=paid`, `bookingStatus=confirmed` | ⬜ |

### 6.3 VNPay IPN (POST /payments/vnpay/ipn) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 6.3.1 | IPN thành công | `vnp_ResponseCode=00`, chữ ký đúng | `{ RspCode: "00", Message: "Confirm Success" }` | ⬜ |
| 6.3.2 | Idempotency — booking đã paid | gọi IPN lần 2 | `{ RspCode: "02", Message: "Order already confirmed" }` | ⬜ |
| 6.3.3 | Chữ ký sai | hash không khớp | `{ RspCode: "97", Message: "Invalid signature" }` | ⬜ |
| 6.3.4 | Booking không tồn tại | bookingCode không có | `{ RspCode: "01", Message: "Order not found" }` | ⬜ |

---

## 7. Vouchers

### 7.1 Validate voucher (POST /vouchers/validate) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 7.1.1 | Voucher % hợp lệ | SUMMER30, bookingAmount=2.000.000 | `valid=true`, discountAmount=300.000 (capped) | ⬜ |
| 7.1.2 | Voucher fixed_amount | WELCOME100, bookingAmount=500.000 | discountAmount=100.000 | ⬜ |
| 7.1.3 | Voucher hết hạn | EXPIRED50 | `valid=false`, message chứa "hết hạn" | ⬜ |
| 7.1.4 | Voucher chưa bắt đầu | validFrom tương lai | `valid=false`, "chưa có hiệu lực" | ⬜ |
| 7.1.5 | Đơn hàng dưới mức tối thiểu | bookingAmount < minBookingAmount | `valid=false` | ⬜ |
| 7.1.6 | Voucher đã hết lượt | usedCount >= usageLimit | `valid=false`, "hết lượt sử dụng" | ⬜ |
| 7.1.7 | Mã không tồn tại | code=NONEXISTENT | `valid=false`, "không hợp lệ" | ⬜ |
| 7.1.8 | Giảm % không vượt cap | 30% của 2.000.000 > 300.000 cap | discountAmount=300.000 (không phải 600.000) | ⬜ |
| 7.1.9 | finalAmount = bookingAmount - discountAmount | - | finalAmount đúng | ⬜ |

### 7.2 CRUD Voucher (Admin)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 7.2.1 | Admin tạo voucher mới | đầy đủ fields | 201, voucher | ⬜ |
| 7.2.2 | Mã trùng | code đã tồn tại | 409 ConflictException | ⬜ |
| 7.2.3 | Customer không thể tạo | role=customer | 403 Forbidden | ⬜ |
| 7.2.4 | Admin xem danh sách | admin token | 200, `{ items, meta }` | ⬜ |
| 7.2.5 | Admin cập nhật voucher | `{ isActive: false }` | 200, isActive=false | ⬜ |
| 7.2.6 | Admin xóa voucher | id hợp lệ | 200, `{ id }` | ⬜ |

---

## 8. Reviews

### 8.1 Tạo đánh giá (POST /reviews)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 8.1.1 | User đánh giá booking đã hoàn thành của mình | bookingStatus=completed, userId khớp | 201, review mới | ⬜ |
| 8.1.2 | Booking chưa hoàn thành | bookingStatus=confirmed | 400 "Chỉ có thể đánh giá sau khi hoàn thành" | ⬜ |
| 8.1.3 | Booking của người khác | userId không khớp | 403 ForbiddenException | ⬜ |
| 8.1.4 | Đánh giá 2 lần cùng booking | gọi 2 lần | 409 ConflictException | ⬜ |
| 8.1.5 | ratingAvg của phòng được cập nhật | tạo review → GET /rooms/:id | ratingAvg và ratingCount mới | ⬜ |
| 8.1.6 | Rating ngoài 1-5 | rating=6 | 400 ValidationException | ⬜ |
| 8.1.7 | Không có token | no header | 401 Unauthorized | ⬜ |

### 8.2 Danh sách đánh giá theo phòng (GET /reviews/room/:roomId) — Public

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 8.2.1 | Lấy reviews của phòng | roomId hợp lệ | 200, chỉ reviews có `isVisible=true` | ⬜ |
| 8.2.2 | Review ẩn không hiển thị | isVisible=false | không có trong kết quả public | ⬜ |
| 8.2.3 | Phân trang | page, limit | meta đúng | ⬜ |

### 8.3 Admin quản lý đánh giá

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 8.3.1 | Admin xem tất cả reviews | admin token | 200, tất cả kể cả isVisible=false | ⬜ |
| 8.3.2 | Admin ẩn đánh giá | `PATCH /:id/visibility`, `{ isVisible: false }` | 200, isVisible=false | ⬜ |
| 8.3.3 | Admin hiện đánh giá | `{ isVisible: true }` | 200, isVisible=true | ⬜ |
| 8.3.4 | ratingAvg phòng cập nhật sau khi ẩn | ẩn review → GET /rooms/:id | ratingAvg tính lại không có review ẩn | ⬜ |
| 8.3.5 | Admin xóa đánh giá | DELETE /:id | 200, `{ id }` | ⬜ |
| 8.3.6 | Customer không thể xem tất cả | role=customer | 403 Forbidden | ⬜ |

---

## 9. Reports

### 9.1 Dashboard summary (GET /reports/bookings/summary) — Admin

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.1.1 | Lấy tổng quan | admin token | 200, `{ total, pending, confirmed, checkedIn, completed, cancelled, todayRevenue, occupancyRate }` | ⬜ |
| 9.1.2 | todayRevenue tính từ booking confirmed hôm nay | tạo booking confirmed hôm nay | todayRevenue tăng | ⬜ |
| 9.1.3 | occupancyRate = checkedIn/totalRooms × 100 | - | giá trị 0-100 | ⬜ |
| 9.1.4 | Customer không truy cập được | role=customer | 403 Forbidden | ⬜ |

### 9.2 Doanh thu theo ngày (GET /reports/revenue/daily)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.2.1 | Ngày có booking | `date=2026-05-17` | `{ date, revenue > 0, bookingCount > 0 }` | ⬜ |
| 9.2.2 | Ngày không có booking | `date=2020-01-01` | revenue=0, bookingCount=0 | ⬜ |

### 9.3 Doanh thu theo tháng (GET /reports/revenue/monthly)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.3.1 | Trả đủ 28-31 ngày của tháng | `year=2026&month=5` | items.length = 31 (Tháng 5 có 31 ngày) | ⬜ |
| 9.3.2 | Ngày có booking | 2026-05-17 | revenue=1.600.000 trong items | ⬜ |
| 9.3.3 | Ngày không có booking trả revenue=0 | 2026-05-01 | revenue=0 (không phải null) | ⬜ |

### 9.4 Doanh thu theo năm (GET /reports/revenue/yearly)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.4.1 | Trả đủ 12 tháng | `year=2026` | items.length = 12 | ⬜ |
| 9.4.2 | Tháng có booking | tháng 5 | month=5, revenue > 0 | ⬜ |
| 9.4.3 | Tháng không có booking trả 0 | tháng 1 | revenue=0 | ⬜ |

### 9.5 Doanh thu theo chi nhánh (GET /reports/revenue/by-branch)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.5.1 | Trả tất cả chi nhánh | `from=2026-01-01&to=2026-12-31` | 3 branches (kể cả revenue=0) | ⬜ |
| 9.5.2 | Chi nhánh có booking | chi nhánh Đà Nẵng | revenue=1.600.000 | ⬜ |
| 9.5.3 | Sắp xếp theo revenue giảm dần | - | chi nhánh có doanh thu cao nhất đứng đầu | ⬜ |

### 9.6 Tỷ lệ lấp đầy (GET /reports/rooms/occupancy)

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 9.6.1 | Trả tất cả phòng active | `from=2026-05-01&to=2026-05-31` | 6 phòng trong kết quả | ⬜ |
| 9.6.2 | Phòng được đặt có bookedDays > 0 | phòng room-001 có booking tháng 7 | khoảng từ/đến khớp thì > 0 | ⬜ |
| 9.6.3 | occupancyRate trong khoảng 0-100 | - | tất cả `occupancyRate` ≤ 100 | ⬜ |

---

## 10. Frontend — Trang Marketing

### 10.1 Trang chủ (`/vi`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.1.1 | Trang load thành công | `GET /vi` | HTTP 200, title chứa "Ocean Blue" | ⬜ |
| 10.1.2 | Hero section hiển thị | Browser → homepage | H1/H2 visible, nền `#0D1B2A` | ⬜ |
| 10.1.3 | Tab "Theo giờ" / "Theo ngày" hoạt động | Click tab | active pill chuyển màu | ⬜ |
| 10.1.4 | Dropdown chi nhánh có dữ liệu thật | Mở dropdown | 3 chi nhánh từ backend | ⬜ |
| 10.1.5 | Featured rooms hiển thị | Scroll xuống | có ≥ 1 RoomCard | ⬜ |
| 10.1.6 | Nút "Tìm phòng" điều hướng đúng | Click → tìm kiếm | URL chứa search params | ⬜ |
| 10.1.7 | Footer hiển thị | Scroll xuống cùng | footer visible | ⬜ |
| 10.1.8 | Navbar transparent trên hero | load homepage | background transparent | ⬜ |
| 10.1.9 | Navbar solid sau scroll | Scroll 20px | background white/blur | ⬜ |
| 10.1.10 | ISR revalidate | - | `Cache-Control` có `s-maxage=3600` | ⬜ |

### 10.2 Trang danh sách phòng (`/vi/rooms`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.2.1 | Hiển thị phòng từ backend | Mở `/vi/rooms` | 6 phòng từ seed | ⬜ |
| 10.2.2 | Filter chip "Theo giờ" | Click chip | URL thêm `type=hourly`, kết quả lọc | ⬜ |
| 10.2.3 | Filter sidebar (desktop) | Chọn chi nhánh | URL cập nhật `branchId=...` | ⬜ |
| 10.2.4 | Pagination | Nhiều phòng | nút next/prev hiện | ⬜ |
| 10.2.5 | RoomCard hiển thị ảnh | - | `<img>` hoặc `<Image>` có src từ backend | ⬜ |
| 10.2.6 | RoomCard hiển thị giá | - | số tiền format VNĐ | ⬜ |
| 10.2.7 | Click vào phòng → room detail | Click card | URL `/vi/rooms/room-xxx` | ⬜ |
| 10.2.8 | Skeleton khi đang load | Network throttle | skeleton loader hiện | ⬜ |

### 10.3 Trang chi tiết phòng (`/vi/rooms/:id`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.3.1 | Hiển thị tên phòng từ backend | `/vi/rooms/room-001` | "Phòng Deluxe Hướng Phố" visible | ⬜ |
| 10.3.2 | Image carousel hoạt động | Swipe/click arrow | ảnh tiếp theo hiển thị | ⬜ |
| 10.3.3 | Amenities hiển thị | Scroll | icon + tên tiện nghi | ⬜ |
| 10.3.4 | Chính sách hủy hiển thị | Scroll | bảng hoàn tiền % | ⬜ |
| 10.3.5 | Bản đồ Google Maps | Scroll | iframe embed hiển thị | ⬜ |
| 10.3.6 | Sticky booking bar | Scroll | bar cố định bottom | ⬜ |
| 10.3.7 | JSON-LD có trong HTML | View source | `<script type="application/ld+json">` với `@type: LodgingBusiness` | ⬜ |
| 10.3.8 | generateMetadata — title đúng | `<title>` tag | title = tên phòng | ⬜ |
| 10.3.9 | 404 cho phòng không tồn tại | `/vi/rooms/nope` | 404 page | ⬜ |
| 10.3.10 | ISR revalidate=3600 | - | Header `Cache-Control` | ⬜ |

### 10.4 Booking flow

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.4.1 | Form booking load đúng room | `/vi/booking/room-001` | tên phòng trong form | ⬜ |
| 10.4.2 | Tab "Theo giờ" / "Theo ngày" chuyển UI | Click tab | input numHours ↔ date picker | ⬜ |
| 10.4.3 | Pricing tính realtime | Thay đổi ngày/giờ | Tổng tiền cập nhật ngay | ⬜ |
| 10.4.4 | Voucher input — validate sau 500ms debounce | Nhập SUMMER30 | hiển thị số tiền giảm | ⬜ |
| 10.4.5 | Voucher không hợp lệ | Nhập INVALID | hiển thị thông báo lỗi | ⬜ |
| 10.4.6 | Submit tạo booking thật | Điền đủ → submit | redirect sang `/booking/:id/confirm` | ⬜ |
| 10.4.7 | Validation form — thiếu guestName | Submit rỗng | lỗi validation inline | ⬜ |
| 10.4.8 | Confirm page — chọn thanh toán | `/booking/:id/confirm` | 2 lựa chọn: VNPay / Tiền mặt | ⬜ |
| 10.4.9 | Chọn tiền mặt → success page | Click "Tiền mặt" | redirect `/booking/:id/success` | ⬜ |
| 10.4.10 | Success page hiển thị bookingCode | `/booking/:id/success` | `HMS-XXXXXX` to, nổi bật | ⬜ |

### 10.5 Tra cứu booking (`/vi/track`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.5.1 | Input mã và tra cứu | Nhập HMS-xxx → Enter/Click | hiển thị thông tin booking | ⬜ |
| 10.5.2 | Mã không tồn tại | Nhập HMS-INVALID | thông báo không tìm thấy | ⬜ |

### 10.6 Auth pages

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.6.1 | Đăng nhập thành công | email + password đúng | redirect khỏi /login, navbar hiển thị tên user | ⬜ |
| 10.6.2 | Sai credentials | password sai | error message hiện | ⬜ |
| 10.6.3 | Đăng nhập bằng phone | nhập số điện thoại | hoạt động tương tự email | ⬜ |
| 10.6.4 | Đăng xuất | Click logout | session hết, redirect /login | ⬜ |
| 10.6.5 | Route /my-bookings không có auth | Truy cập không login | redirect /login | ⬜ |
| 10.6.6 | Đăng ký mới | Điền đủ thông tin | 201, redirect hoặc success | ⬜ |

### 10.7 i18n (Đa ngôn ngữ)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 10.7.1 | Default locale là vi | Mở `localhost:3000` | Redirect sang `/vi/` | ⬜ |
| 10.7.2 | Chuyển sang EN | Click EN | URL đổi sang `/en/`, text chuyển Anh | ⬜ |
| 10.7.3 | Chuyển lại VI | Click VI | URL `/vi/`, text Việt | ⬜ |

---

## 11. Frontend — Admin Dashboard

### 11.1 Auth guard

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 11.1.1 | Chưa đăng nhập → redirect login | Truy cập `/vi/admin/dashboard` | redirect `/vi/login` | ⬜ |
| 11.1.2 | User role=customer → redirect / | Đăng nhập customer → vào `/vi/admin` | redirect về trang chủ | ⬜ |
| 11.1.3 | Admin được vào | Đăng nhập admin → `/vi/admin/dashboard` | Dashboard hiển thị | ⬜ |

### 11.2 Dashboard (`/vi/admin/dashboard`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 11.2.1 | 4 Metric cards hiển thị | Load dashboard | Doanh thu, Booking, Đang ở, Tỷ lệ lấp đầy | ⬜ |
| 11.2.2 | Revenue chart hiển thị 12 tháng | - | 12 cột trên biểu đồ | ⬜ |
| 11.2.3 | Recent bookings table | - | bảng booking mới nhất | ⬜ |
| 11.2.4 | Metric data từ API thật | - | số liệu khớp với backend | ⬜ |

### 11.3 Sidebar navigation

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 11.3.1 | Sidebar hiển thị tất cả menu | Load admin | 7 menu items visible | ⬜ |
| 11.3.2 | Active menu highlight | Đang ở /admin/bookings | Đặt phòng được highlight | ⬜ |
| 11.3.3 | Collapse sidebar | Click chevron | sidebar thu lại còn icon | ⬜ |
| 11.3.4 | Điều hướng giữa các trang | Click menu item | URL đổi, page load | ⬜ |

### 11.4 Bookings management (`/vi/admin/bookings`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 11.4.1 | Bảng hiển thị booking | Load page | table với các cột đúng | ⬜ |
| 11.4.2 | Search booking | Nhập mã/tên/SĐT | kết quả lọc realtime | ⬜ |
| 11.4.3 | Filter theo status | Chọn "Chờ xác nhận" | chỉ booking pending | ⬜ |
| 11.4.4 | Action menu | Click ⋮ | options: Xác nhận / Hủy | ⬜ |

### 11.5 Reports (`/vi/admin/reports`)

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 11.5.1 | Chart yearly load | Tab "Theo năm" | 12 tháng trên chart | ⬜ |
| 11.5.2 | Switch tab monthly | Tab "Theo tháng" | chart theo ngày trong tháng | ⬜ |
| 11.5.3 | Chọn năm khác | Dropdown năm | chart cập nhật | ⬜ |
| 11.5.4 | Summary cards đúng | - | Tổng doanh thu = sum các tháng | ⬜ |

---

## 12. SEO & Performance

### 12.1 sitemap.xml

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 12.1.1 | sitemap trả về HTTP 200 | `GET /sitemap.xml` | 200, XML hợp lệ | ⬜ |
| 12.1.2 | Chứa URLs trang tĩnh | Parse XML | `/vi`, `/en`, `/vi/rooms`, `/en/rooms` có mặt | ⬜ |
| 12.1.3 | Chứa URLs phòng động | Parse XML | `/vi/rooms/room-001` … có mặt | ⬜ |
| 12.1.4 | Cả 2 locale | Parse XML | mỗi URL có cả `/vi/` và `/en/` version | ⬜ |

### 12.2 robots.txt

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 12.2.1 | robots.txt trả 200 | `GET /robots.txt` | 200, text/plain | ⬜ |
| 12.2.2 | Disallow admin/api | Đọc nội dung | `Disallow: /admin/` và `/api/` | ⬜ |
| 12.2.3 | Allow root | Đọc nội dung | `Allow: /` | ⬜ |
| 12.2.4 | Link đến sitemap | Đọc nội dung | `Sitemap: http://.../sitemap.xml` | ⬜ |

### 12.3 Open Graph & JSON-LD

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 12.3.1 | og:title đúng | View source `/vi/rooms/room-001` | `og:title` = tên phòng | ⬜ |
| 12.3.2 | og:image có URL ảnh phòng | View source | `og:image` = URL ảnh | ⬜ |
| 12.3.3 | JSON-LD LodgingBusiness | View source | `@type: LodgingBusiness` | ⬜ |
| 12.3.4 | JSON-LD aggregateRating | View source | `ratingValue`, `reviewCount` đúng | ⬜ |
| 12.3.5 | JSON-LD address | View source | `streetAddress`, `addressLocality`, `addressCountry: VN` | ⬜ |

### 12.4 Performance

| # | Test case | Cách kiểm tra | Expected | Status |
|---|-----------|---------------|----------|--------|
| 12.4.1 | Homepage có ISR header | Check response header | `Cache-Control: s-maxage=3600` hoặc `x-nextjs-cache: HIT` | ⬜ |
| 12.4.2 | Ảnh dùng next/image | View source | `<img>` có `srcset`, `sizes` | ⬜ |
| 12.4.3 | Fonts không gây CLS | DevTools | không có layout shift từ font | ⬜ |

---

## 13. Non-functional

### 13.1 Rate Limiting

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 13.1.1 | Vượt 100 req/phút | 101 requests trong 1 phút | 429 Too Many Requests | ⬜ |

### 13.2 Security

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 13.2.1 | SQL Injection qua query param | `search='; DROP TABLE users; --` | 200 (query bị escape), không có lỗi DB | ⬜ |
| 13.2.2 | XSS qua body | `guestName: "<script>alert(1)</script>"` | lưu raw string, không execute khi hiển thị | ⬜ |
| 13.2.3 | Unauthorized cross-user access | user A xem booking user B | 403 hoặc 404 | ⬜ |
| 13.2.4 | Password không bao giờ trả về API | GET /users/:id | `password` không có trong response | ⬜ |
| 13.2.5 | CORS chỉ cho phép origin đúng | Request từ origin khác | 403 hoặc CORS error | ⬜ |

### 13.3 Availability

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 13.3.1 | Backend health check | `GET /api/v1` | response JSON (dù 404) | ⬜ |
| 13.3.2 | Redis disconnected | Tắt Redis → gọi API | fallback graceful, không crash | ⬜ |
| 13.3.3 | DB connection pool | 100 concurrent requests | không có 500 do connection timeout | ⬜ |

### 13.4 Data Integrity

| # | Test case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 13.4.1 | Booking + Payment là atomic | Tạo booking, giả lập lỗi sau booking trước payment | rollback toàn bộ (không có booking mồ côi) | ⬜ |
| 13.4.2 | ratingAvg tính lại đúng sau xóa review | Xóa review → GET room | ratingAvg và ratingCount giảm | ⬜ |
| 13.4.3 | Soft delete không xóa khỏi DB | Xóa user → query DB trực tiếp | row vẫn còn, deletedAt ≠ null | ⬜ |

---

## Hướng dẫn chạy test

### Backend unit tests
```bash
cd src/backend
npm test                    # tất cả unit tests
npm run test:cov            # với coverage report
npm test -- --watch         # watch mode khi dev
```

### Frontend unit tests
```bash
cd src/frontend
pnpm test                   # Vitest
pnpm test:coverage          # với coverage
```

### E2E tests (Playwright)
```bash
cd src/frontend
pnpm test:e2e               # headless
pnpm test:e2e:ui            # với UI browser
pnpm exec playwright show-report  # xem báo cáo HTML
```

### Manual API testing
```bash
# Lấy admin token
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@homestay.vn","password":"Admin@123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Sử dụng token
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/users
```

### Swagger UI
Mở trình duyệt: **http://localhost:4000/api/docs**  
Click "Authorize" → nhập Bearer token để test các endpoint cần auth.

---

## Legend

| Icon | Nghĩa |
|------|-------|
| ⬜ | Chưa test |
| ✅ | Pass |
| ❌ | Fail |
| ⚠️ | Fail một phần / cần xem lại |
| 🔁 | Đang test |
