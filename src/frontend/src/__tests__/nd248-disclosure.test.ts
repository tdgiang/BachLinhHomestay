import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  BOOKING_LIMITS,
  BRANCHES,
  COMPANY,
  COMPLAINT_SLA,
  POLICY_INDEX,
  SECURITY_LICENSE,
  securityLicenseText,
} from '@/lib/legal';

const ROOT = path.resolve(__dirname, '../..'); // src/frontend
const MARKETING = path.join(ROOT, 'src/app/[locale]/(marketing)');

function readPage(route: string): string {
  return fs.readFileSync(path.join(MARKETING, route, 'page.tsx'), 'utf-8');
}

/**
 * Guard cho hồ sơ đăng ký Bộ Công Thương: mỗi nhóm nội dung bắt buộc theo
 * NĐ 248/2026/NĐ-CP phải thực sự tồn tại trên website, không chỉ có trong
 * danh mục. Nếu ai đó xóa một mục, test này fail trước khi lên production.
 */
describe('ND 248 — nội dung công bố bắt buộc', () => {
  it('công bố đủ 13 nhóm nội dung, id không trùng', () => {
    expect(POLICY_INDEX).toHaveLength(13);
    expect(new Set(POLICY_INDEX.map((p) => p.id)).size).toBe(13);
  });

  it('mọi mục đều có điều khoản, mô tả và đường dẫn nội bộ', () => {
    for (const item of POLICY_INDEX) {
      expect(item.article, item.id).toMatch(/^(Điều|Bổ sung)/);
      expect(item.description.length, item.id).toBeGreaterThan(20);
      expect(item.href, item.id).toMatch(/^\//);
    }
  });

  it('các điều 4–16 đều được ánh xạ tới một trang', () => {
    const covered = POLICY_INDEX.flatMap((p) =>
      [...p.article.matchAll(/\d+/g)].map((m) => Number(m[0])),
    );
    for (const article of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) {
      expect(covered, `thiếu Điều ${article}`).toContain(article);
    }
  });

  it('anchor của các mục trỏ tới section thực sự tồn tại trong trang đích', () => {
    const anchors = POLICY_INDEX.map((p) => p.href)
      .filter((href) => href.includes('#'))
      .map((href) => href.split('#'));

    for (const [route, anchor] of anchors) {
      // '/chinh-sach-nd248' -> 'chinh-sach-nd248'
      const source = readPage(route.replace(/^\//, ''));
      // Section id xuất hiện dưới dạng object literal (`id: "x"`) trong mảng
      // SECTIONS, hoặc dưới dạng thuộc tính JSX (`id="x"`) khi viết thẳng.
      const declared =
        source.includes(`id: "${anchor}"`) || source.includes(`id="${anchor}"`);
      expect(declared, `${route}#${anchor}`).toBe(true);
    }
  });
});

describe('Điều 4 — thông tin chủ quản', () => {
  it('có đủ tên, trụ sở, người đại diện, mã số doanh nghiệp, ngày và nơi cấp', () => {
    expect(COMPANY.name).toContain('Bách Linh');
    expect(COMPANY.headOffice).toContain('Hà Nội');
    expect(COMPANY.legalRepName).not.toBe('');
    expect(COMPANY.legalRepTitle).not.toBe('');
    expect(COMPANY.businessCode).toMatch(/^\d{10}(-\d{3})?$/);
    expect(COMPANY.businessRegDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(COMPANY.businessRegIssuer).not.toBe('');
  });

  it('có ít nhất một kênh hỗ trợ trực tuyến', () => {
    expect(COMPANY.email).toMatch(/@/);
    expect(COMPANY.hotline).not.toBe('');
  });

  it('công bố đúng tên miền đã đăng ký tại online.gov.vn', () => {
    expect(COMPANY.domain).toBe('bachlinh.com.vn');
    // websiteUrl phải là https và trỏ đúng tên miền đã khai với Bộ Công Thương.
    expect(COMPANY.websiteUrl).toBe(`https://${COMPANY.domain}`);
  });

  it('trang tổng hợp hiển thị tên miền đã đăng ký', () => {
    expect(readPage('chinh-sach')).toContain('Tên miền đã đăng ký với Bộ Công Thương');
  });
});

describe('Ngành nghề kinh doanh có điều kiện', () => {
  it('không bao giờ hiển thị placeholder rỗng cho giấy phép an ninh, trật tự', () => {
    const text = securityLicenseText();
    expect(text.length).toBeGreaterThan(40);
    expect(text).not.toMatch(/\[.*\]/); // không còn dạng "[Chờ bổ sung …]"
    // Không bao giờ in ra một số giấy phép rỗng, ví dụ "…an ninh, trật tự số ,"
    expect(text).not.toMatch(/trật tự số\s*,/);
  });

  it('khi đã có giấy phép thì in đủ số, ngày cấp và cơ quan cấp', () => {
    if (SECURITY_LICENSE.pending) return;
    const text = securityLicenseText();
    expect(text).toContain(SECURITY_LICENSE.number);
    expect(text).toContain(SECURITY_LICENSE.issuedDate);
    expect(text).toContain(SECURITY_LICENSE.issuer);
  });
});

describe('Điều 9b — phạm vi địa lý khớp với số chi nhánh thực tế', () => {
  it('có ít nhất một địa điểm và mỗi địa điểm đều có địa chỉ đầy đủ', () => {
    expect(BRANCHES.length).toBeGreaterThan(0);
    for (const b of BRANCHES) {
      expect(b.name).not.toBe('');
      expect(b.address).toContain('Hà Nội');
    }
  });

  it('không chuỗi hiển thị nào quảng cáo nhiều chi nhánh hơn thực tế', () => {
    // Guard trước đây chỉ đọc footer.tagline nên bỏ lọt "5+ chi nhánh" ở hero
    // và "3 chi nhánh" ở lưới tính năng. Quét toàn bộ file ngôn ngữ.
    const offenders: string[] = [];

    function walk(node: unknown, keyPath: string, locale: string) {
      if (typeof node === 'string') {
        if (/\d\s*\+?\s*(chi nhánh|branch)/i.test(node)) {
          offenders.push(`${locale}.${keyPath}: ${node}`);
        }
        return;
      }
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          walk(v, keyPath ? `${keyPath}.${k}` : k, locale);
        }
      }
    }

    for (const locale of ['vi', 'en']) {
      walk(
        JSON.parse(fs.readFileSync(path.join(ROOT, `messages/${locale}.json`), 'utf-8')),
        '',
        locale,
      );
    }

    expect(offenders).toEqual([]);
  });
});

describe('Điều 7a — kênh tiếp nhận trực tuyến phải tồn tại thật', () => {
  const contact = readPage('contact');

  it('trang liên hệ nhúng biểu mẫu gửi phản ánh', () => {
    expect(contact).toContain('ComplaintForm');
  });

  it('trang liên hệ có công cụ tra cứu tiến độ bằng mã phiếu', () => {
    expect(contact).toContain('ComplaintTracker');
  });

  it('công bố thời hạn phản hồi ban đầu và thời hạn giải quyết', () => {
    expect(contact).toContain('Phản hồi ban đầu');
    expect(contact).toContain('Thời hạn giải quyết');
  });
});

describe('Điều 10c / Điều 11 — nội dung mới phải nằm đúng trang', () => {
  it('chính sách thanh toán có mục mã giảm giá và cấm quy đổi tiền mặt', () => {
    const payment = readPage('payment-policy');
    expect(payment).toContain('id: "vouchers"');
    expect(payment).toContain('KHÔNG được quy đổi thành tiền mặt');
  });

  it('chính sách ưu tiên hiển thị nêu rõ không bán vị trí hiển thị', () => {
    const nd248 = readPage('chinh-sach-nd248');
    expect(nd248).toContain('id: "display-ranking"');
    expect(nd248).toContain('Không có hình thức trả phí để được ưu tiên hiển thị');
  });

  it('điều kiện cung cấp dịch vụ nêu giới hạn số lượng', () => {
    expect(readPage('terms')).toContain('Giới hạn về số lượng');
  });
});

describe('URL gốc của site', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('môi trường dev dùng localhost', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined as unknown as string);
    vi.stubEnv('NODE_ENV', 'development');
    const { APP_URL } = await import('@/lib/constants');
    expect(APP_URL).toBe('http://localhost:3000');
  });

  it('production thiếu env thì fallback về tên miền đã đăng ký, không phải localhost', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined as unknown as string);
    vi.stubEnv('NODE_ENV', 'production');
    const { APP_URL } = await import('@/lib/constants');
    expect(APP_URL).toBe(COMPANY.websiteUrl);
    expect(APP_URL).not.toContain('localhost');
  });

  it('biến môi trường luôn thắng fallback', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.example.com');
    vi.stubEnv('NODE_ENV', 'production');
    const { APP_URL } = await import('@/lib/constants');
    expect(APP_URL).toBe('https://staging.example.com');
  });
});

describe('Điều 7c — bảng thời hạn phải khớp giữa frontend và backend', () => {
  it('COMPLAINT_SLA trùng khớp với complaint-sla.ts của backend', () => {
    // Backend trả chính những con số này về cho khách trong biên nhận, nên hai
    // bảng lệch nhau là công bố một đằng, thực hiện một nẻo.
    const backendSource = fs.readFileSync(
      path.resolve(
        ROOT,
        '../backend/src/modules/complaints/application/complaint-sla.ts',
      ),
      'utf-8',
    );

    for (const [category, sla] of Object.entries(COMPLAINT_SLA)) {
      const row = new RegExp(
        `${category}:\\s*\\{\\s*initialResponseHours:\\s*(\\d+),\\s*resolutionDays:\\s*(\\d+)`,
      ).exec(backendSource);

      expect(row, `backend thiếu nhóm ${category}`).not.toBeNull();
      expect(Number(row![1]), `${category}.initialResponseHours`).toBe(
        sla.initialResponseHours,
      );
      expect(Number(row![2]), `${category}.resolutionDays`).toBe(sla.resolutionDays);
    }
  });

  it('mọi nhóm vấn đề trên biểu mẫu đều có thời hạn công bố', () => {
    const form = fs.readFileSync(
      path.join(ROOT, 'src/components/marketing/ComplaintForm.tsx'),
      'utf-8',
    );
    for (const category of Object.keys(COMPLAINT_SLA)) {
      expect(form, `biểu mẫu thiếu nhóm ${category}`).toContain(`value: '${category}'`);
    }
  });
});

describe('Điều 11 — công bố phải mô tả đúng cơ chế đang chạy', () => {
  const nd248 = readPage('chinh-sach-nd248');
  const roomsService = fs.readFileSync(
    path.resolve(
      ROOT,
      '../backend/src/modules/rooms/application/rooms.service.ts',
    ),
    'utf-8',
  );

  it('không công bố xếp hạng theo đánh giá hay số đơn khi code không làm vậy', () => {
    // rooms.service chỉ orderBy theo một trường do client chọn. Nếu sau này
    // thêm xếp hạng theo rating/đơn hàng thì phải cập nhật lại công bố.
    const ordersByRatingOrBookings =
      /orderBy[\s\S]{0,200}(ratingAvg|ratingCount|bookings)/.test(roomsService);
    expect(ordersByRatingOrBookings).toBe(false);
    expect(nd248).toContain(
      'Điểm đánh giá, số lượt đánh giá và số đơn đặt thành công không tác động đến thứ tự hiển thị.',
    );
  });

  it('vẫn khẳng định không bán vị trí hiển thị', () => {
    expect(nd248).toContain('Không có hình thức trả phí để được ưu tiên hiển thị');
  });
});

describe('Không công bố năng lực nền tảng chưa có', () => {
  it('trang khiếu nại không hứa email tự động khi backend chưa có mailer', () => {
    const backendSrc = path.resolve(ROOT, '../backend/src');
    const hasMailer = fs
      .readdirSync(backendSrc, { recursive: true, encoding: 'utf-8' })
      .filter((f) => typeof f === 'string' && f.endsWith('.ts'))
      .some((f) =>
        /nodemailer|MailerService|sendMail|EmailService/.test(
          fs.readFileSync(path.join(backendSrc, f), 'utf-8'),
        ),
      );

    if (hasMailer) return; // đã có mailer thì được phép hứa gửi email

    const contact = readPage('contact');
    expect(contact).not.toContain('thông báo kết quả bằng văn bản qua email');
    expect(
      fs.readFileSync(
        path.join(ROOT, 'src/components/marketing/ComplaintForm.tsx'),
        'utf-8',
      ),
    ).not.toContain('email xác nhận');
  });
});

describe('Điều 9d — giới hạn số lượng phải được cưỡng chế, không chỉ công bố', () => {
  const backendLimits = fs.readFileSync(
    path.resolve(
      ROOT,
      '../backend/src/modules/bookings/application/booking-limits.ts',
    ),
    'utf-8',
  );
  const bookingsService = fs.readFileSync(
    path.resolve(
      ROOT,
      '../backend/src/modules/bookings/application/bookings.service.ts',
    ),
    'utf-8',
  );

  it('BOOKING_LIMITS trùng khớp với backend', () => {
    for (const [key, value] of Object.entries(BOOKING_LIMITS)) {
      const row = new RegExp(`${key}:\\s*(\\d+)`).exec(backendLimits);
      expect(row, `backend thiếu giới hạn ${key}`).not.toBeNull();
      expect(Number(row![1]), key).toBe(value);
    }
  });

  it('bookings.service thực sự dùng BOOKING_LIMITS khi tạo đơn', () => {
    // Công bố mà không cưỡng chế là nói một đằng làm một nẻo.
    expect(bookingsService).toContain("from './booking-limits'");
    expect(bookingsService).toContain('assertWithinPublishedLimits');
    for (const key of Object.keys(BOOKING_LIMITS)) {
      expect(bookingsService, `chưa cưỡng chế ${key}`).toContain(
        `BOOKING_LIMITS.${key}`,
      );
    }
  });

  it('đối chiếu numHours với khoảng thời gian thực để không bán hụt giờ', () => {
    expect(bookingsService).toContain('HOURS_TOLERANCE');
  });

  it('chặn số khách vượt sức chứa phòng', () => {
    expect(bookingsService).toMatch(/numGuests > capacity/);
  });

  it('trang Điều khoản công bố đúng các con số đang cưỡng chế', () => {
    const terms = readPage('terms');
    expect(terms).toContain(`tối thiểu 0${BOOKING_LIMITS.minHours} giờ`);
    expect(terms).toContain(`tối đa ${BOOKING_LIMITS.maxHours} giờ`);
    expect(terms).toContain(`tối đa ${BOOKING_LIMITS.maxNights} đêm`);
    expect(terms).toContain(`0${BOOKING_LIMITS.maxActivePerCustomer} đơn đặt phòng đang hiệu lực`);
  });
});
