/**
 * Nguồn dữ liệu pháp lý duy nhất cho các nội dung công bố bắt buộc theo
 * Luật Thương mại điện tử 2025 và Nghị định 248/2026/NĐ-CP (hiệu lực 01/7/2026).
 *
 * Mọi trang chính sách và footer đọc từ đây — sửa một chỗ, cập nhật toàn site.
 * Khi hồ sơ Bộ Công Thương thay đổi, chỉ sửa file này.
 */

/** Điều 4 — thông tin chủ quản nền tảng. */
export const COMPANY = {
  name: 'Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh',
  brand: 'Ba.Li Homestay',
  /** Tên miền đã đăng ký với Bộ Công Thương tại online.gov.vn. */
  domain: 'bachlinh.com.vn',
  websiteUrl: 'https://bachlinh.com.vn',
  headOffice:
    'Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, TP Hà Nội, Việt Nam',
  legalRepName: 'Nguyễn Lan Phương',
  legalRepTitle: 'Giám đốc',
  /** Mã số doanh nghiệp đồng thời là mã số thuế. */
  businessCode: '0111484606',
  businessRegDate: '04/05/2026 (đăng ký lần đầu)',
  businessRegIssuer:
    'Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội',
  hotline: '0931 708 256',
  hotlineHref: 'tel:0931708256',
  email: 'admin@bachlinh.com.vn',
  emailHref: 'mailto:admin@bachlinh.com.vn',
} as const;

/**
 * Giấy chứng nhận đủ điều kiện về an ninh, trật tự (NĐ 96/2016/NĐ-CP) —
 * bắt buộc với dịch vụ lưu trú, thuộc ngành nghề kinh doanh có điều kiện.
 *
 * TODO(hồ sơ BCT): điền số, ngày cấp và cơ quan cấp thực tế rồi đặt
 * `pending: false`. Khi `pending` còn true, trang hiển thị câu trung tính
 * thay vì số giấy phép trống.
 */
export const SECURITY_LICENSE = {
  pending: true,
  number: '',
  issuedDate: '',
  issuer: '',
} as const;

export function securityLicenseText(): string {
  if (SECURITY_LICENSE.pending) {
    return 'Ba.Li Homestay đang hoàn thiện thủ tục cấp Giấy chứng nhận đủ điều kiện về an ninh, trật tự theo Nghị định 96/2016/NĐ-CP. Thông tin số, ngày cấp và cơ quan cấp sẽ được công bố tại mục này ngay khi được cấp.';
  }
  return `Giấy chứng nhận đủ điều kiện về an ninh, trật tự số ${SECURITY_LICENSE.number}, cấp ngày ${SECURITY_LICENSE.issuedDate}, cơ quan cấp: ${SECURITY_LICENSE.issuer}.`;
}

/** Địa bàn cung cấp dịch vụ — Điều 9b (giới hạn phạm vi địa lý). */
export const BRANCHES = [
  {
    name: 'Cầu Giấy',
    address: 'Số 66, Ngõ 61 Phạm Tuấn Tài, Phường Nghĩa Đô, TP Hà Nội',
  },
] as const;

/**
 * Thời hạn phản hồi và giải quyết theo từng nhóm vấn đề — Điều 7c.
 *
 * Phải khớp từng dòng với `COMPLAINT_SLA` ở
 * `src/backend/src/modules/complaints/application/complaint-sla.ts`, vì backend
 * trả chính con số đó về cho khách ngay sau khi gửi phiếu. Test
 * `nd248-disclosure.test.ts` đọc cả hai file và fail nếu lệch.
 */
export const COMPLAINT_SLA = {
  booking: {
    label: 'Sai sót thông tin đặt phòng, chưa nhận được email xác nhận',
    initialResponseHours: 24,
    resolutionDays: 2,
  },
  payment: {
    label: 'Giao dịch thanh toán bị treo, trừ tiền nhưng chưa ghi nhận',
    initialResponseHours: 24,
    resolutionDays: 5,
  },
  refund: {
    label: 'Yêu cầu hủy phòng và hoàn tiền',
    initialResponseHours: 48,
    resolutionDays: 7,
  },
  service: {
    label: 'Chất lượng dịch vụ, cơ sở vật chất, thái độ nhân viên',
    initialResponseHours: 48,
    resolutionDays: 7,
  },
  privacy: {
    label: 'Dữ liệu cá nhân (xem, chỉnh sửa, xóa, hạn chế xử lý)',
    initialResponseHours: 72,
    resolutionDays: 30,
  },
  other: {
    label: 'Vấn đề khác',
    initialResponseHours: 48,
    resolutionDays: 7,
  },
} as const;

/** Điều 8b — số ngày báo trước khi thay đổi biểu giá dịch vụ. */
export const PRICE_CHANGE_NOTICE_DAYS = 20;

/**
 * Giới hạn số lượng khi đặt phòng — Điều 9d.
 *
 * Phải khớp với `BOOKING_LIMITS` ở
 * `src/backend/src/modules/bookings/application/booking-limits.ts`, nơi các
 * giới hạn này thực sự được cưỡng chế. Test `nd248-disclosure.test.ts` đọc cả
 * hai file và fail nếu lệch — công bố một đằng chặn một nẻo là đúng thứ cơ
 * quan quản lý kiểm chứng được bằng cách gọi API.
 */
export const BOOKING_LIMITS = {
  minHours: 2,
  maxHours: 12,
  maxNights: 30,
  maxActivePerCustomer: 3,
} as const;

/**
 * Bản đồ 13 nhóm nội dung Sở Công Thương yêu cầu công bố → trang chứa nội dung.
 * Dùng cho khối "Chính sách & Pháp lý" ở trang chủ và trang tổng hợp /chinh-sach.
 */
export const POLICY_INDEX = [
  {
    id: 'chu-quan',
    article: 'Điều 4',
    title: 'Thông tin chủ quản nền tảng',
    description: 'Tên, trụ sở, người đại diện, mã số doanh nghiệp, nơi và ngày cấp.',
    href: '/chinh-sach#chu-quan',
  },
  {
    id: 'bao-mat',
    article: 'Điều 5',
    title: 'Chính sách bảo vệ thông tin cá nhân',
    description:
      'Mục đích, phạm vi thu thập và sử dụng, thời gian lưu trữ, quyền xem — sửa — xóa dữ liệu.',
    href: '/privacy',
  },
  {
    id: 'quyen-nghia-vu',
    article: 'Điều 6',
    title: 'Quyền và nghĩa vụ của các bên',
    description: 'Trách nhiệm của Ba.Li Homestay và quyền, nghĩa vụ của khách hàng.',
    href: '/chinh-sach-nd248#rights-obligations',
  },
  {
    id: 'khieu-nai',
    article: 'Điều 7',
    title: 'Tiếp nhận và giải quyết phản ánh, khiếu nại',
    description:
      'Biểu mẫu trực tuyến, quy trình 4 bước, thời hạn phản hồi và công cụ hỗ trợ.',
    href: '/contact',
  },
  {
    id: 'gia',
    article: 'Điều 8',
    title: 'Chính sách về giá',
    description: 'Giá đã gồm thuế GTGT, không phụ phí ẩn, quy tắc thay đổi biểu giá.',
    href: '/chinh-sach-nd248#pricing',
  },
  {
    id: 'dieu-kien',
    article: 'Điều 9',
    title: 'Điều kiện và hạn chế cung cấp dịch vụ',
    description: 'Giới hạn thời gian, phạm vi địa lý, độ tuổi, số lượng và tính khả dụng.',
    href: '/terms#conditions',
  },
  {
    id: 'thanh-toan',
    article: 'Điều 10',
    title: 'Chính sách về thanh toán',
    description: 'Phương thức thanh toán, hoàn tiền và quy định về mã giảm giá.',
    href: '/payment-policy',
  },
  {
    id: 'uu-tien-hien-thi',
    article: 'Điều 11',
    title: 'Chính sách ưu tiên hiển thị',
    description: 'Tiêu chí sắp xếp phòng trên trang chủ và trang tìm phòng.',
    href: '/chinh-sach-nd248#display-ranking',
  },
  {
    id: 'livestream',
    article: 'Điều 12',
    title: 'Quy chế livestream bán hàng',
    description: 'Ba.Li Homestay không cung cấp chức năng livestream bán hàng.',
    href: '/chinh-sach-nd248#livestream',
  },
  {
    id: 'giao-hang',
    article: 'Điều 13, 14',
    title: 'Giao hàng, đổi trả hàng hóa',
    description:
      'Không áp dụng — nền tảng cung cấp dịch vụ lưu trú, không kinh doanh hàng hóa.',
    href: '/chinh-sach-nd248#goods-delivery',
  },
  {
    id: 'cung-cap-dich-vu',
    article: 'Điều 15',
    title: 'Phương thức cung cấp dịch vụ',
    description: 'Đặt trước — sử dụng sau: quy trình đặt, nhận phòng, chi phí phát sinh.',
    href: '/chinh-sach-nd248#service-delivery',
  },
  {
    id: 'cham-dut',
    article: 'Điều 16',
    title: 'Chấm dứt dịch vụ và hoàn tiền',
    description: 'Các trường hợp chấm dứt, thời điểm hiệu lực và mức hoàn tiền.',
    href: '/chinh-sach-nd248#termination',
  },
  {
    id: 'nganh-co-dieu-kien',
    article: 'Bổ sung',
    title: 'Ngành nghề kinh doanh có điều kiện',
    description: 'Điều kiện về an ninh, trật tự đối với dịch vụ lưu trú.',
    href: '/chinh-sach-nd248#conditional-industry',
  },
] as const;
