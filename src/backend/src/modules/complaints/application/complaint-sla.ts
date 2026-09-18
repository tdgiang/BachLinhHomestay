import { ComplaintCategory } from '@prisma/client';

/**
 * Thời hạn phản hồi và giải quyết theo từng nhóm vấn đề — Điều 7c
 * NĐ 248/2026/NĐ-CP.
 *
 * Đây là cam kết công khai, không phải tham số kỹ thuật: bảng này phải khớp
 * từng dòng với bảng hiển thị ở trang Liên hệ (`COMPLAINT_SLA` trong
 * `src/frontend/src/lib/legal.ts`). Test `nd248-disclosure.test.ts` phía
 * frontend đọc chính file này và fail nếu hai bên lệch nhau.
 *
 * `initialResponseHours` tính theo giờ; `resolutionDays` tính theo ngày làm việc.
 */
export const COMPLAINT_SLA: Record<
  ComplaintCategory,
  { initialResponseHours: number; resolutionDays: number }
> = {
  booking: { initialResponseHours: 24, resolutionDays: 2 },
  payment: { initialResponseHours: 24, resolutionDays: 5 },
  refund: { initialResponseHours: 48, resolutionDays: 7 },
  service: { initialResponseHours: 48, resolutionDays: 7 },
  privacy: { initialResponseHours: 72, resolutionDays: 30 },
  other: { initialResponseHours: 48, resolutionDays: 7 },
};

/** Thời hạn dài nhất trong bảng — dùng cho cảnh báo quá hạn ở trang admin. */
export const MAX_RESOLUTION_DAYS = Math.max(
  ...Object.values(COMPLAINT_SLA).map((s) => s.resolutionDays),
);
