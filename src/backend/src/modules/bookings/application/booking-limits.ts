/**
 * Giới hạn số lượng khi đặt phòng — Điều 9d NĐ 248/2026/NĐ-CP.
 *
 * Đây là cam kết công khai chứ không phải tham số kỹ thuật: mỗi con số dưới
 * đây phải khớp với mục "Giới hạn về số lượng" ở trang Điều khoản sử dụng
 * (`BOOKING_LIMITS` trong `src/frontend/src/lib/legal.ts`). Test
 * `nd248-disclosure.test.ts` phía frontend đọc chính file này và fail nếu hai
 * bên lệch nhau.
 *
 * Công bố mà không cưỡng chế thì nền tảng nói một đằng làm một nẻo — đúng thứ
 * cơ quan quản lý có thể kiểm chứng trực tiếp bằng cách gọi API.
 */
export const BOOKING_LIMITS = {
  /** Số giờ tối thiểu mỗi lượt đặt theo giờ. Phòng có thể yêu cầu cao hơn. */
  minHours: 2,
  /** Số giờ tối đa mỗi lượt đặt theo giờ. Dài hơn thì đặt theo ngày. */
  maxHours: 12,
  /** Số đêm tối đa mỗi lượt đặt theo ngày. */
  maxNights: 30,
  /**
   * Số đơn đang hiệu lực tối đa của một khách tại cùng thời điểm.
   *
   * Tính cả đơn chờ thanh toán, đã xác nhận và đang lưu trú. Không đặt thêm
   * hạn mức riêng cho đơn chờ thanh toán: đó là tập con của đơn hiệu lực nên
   * hạn mức riêng sẽ không bao giờ chạm tới, công bố ra chỉ gây hiểu nhầm.
   */
  maxActivePerCustomer: 3,
} as const;

/**
 * Sai số cho phép giữa `numHours` khách khai và khoảng thời gian thực đặt.
 *
 * Khách chọn khung 08:00–11:00 thì numHours phải là 3. Cho lệch 1 giờ để không
 * làm phiền các trường hợp làm tròn ở giao diện, nhưng không nới hơn: numHours
 * quyết định số tiền, còn checkIn/checkOut quyết định thời gian phòng bị khóa.
 */
export const HOURS_TOLERANCE = 1;
