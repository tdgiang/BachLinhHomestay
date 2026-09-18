import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { ComplaintStatus, Prisma } from '@prisma/client';
import { ComplaintsRepository } from '../infrastructure/complaints.repository';
import { CreateComplaintDto } from '../interface/dto/create-complaint.dto';
import { UpdateComplaintDto } from '../interface/dto/update-complaint.dto';
import { ComplaintQueryDto } from '../interface/dto/complaint-query.dto';
import { COMPLAINT_SLA } from './complaint-sla';

/** Số ký tự base32 của hậu tố mã phiếu. 8 ký tự ≈ 1,1e12 tổ hợp mỗi ngày. */
const CODE_SUFFIX_LENGTH = 8;

/** Số lần thử lại khi mã phiếu sinh ra trùng (P2002). */
const CODE_MAX_ATTEMPTS = 5;

/**
 * Tiếp nhận và xử lý phản ánh, yêu cầu, khiếu nại — Điều 7 NĐ 248/2026/NĐ-CP.
 *
 * Thời hạn phản hồi và giải quyết theo từng nhóm vấn đề nằm ở `complaint-sla.ts`
 * và phải khớp với bảng công bố trên trang Liên hệ.
 */
@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: ComplaintsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateComplaintDto) {
    const complaint = await this.createWithUniqueCode(dto);

    await this.invalidateListCache();
    this.logger.log(`Complaint received: ${complaint.code} (${dto.category})`);

    const sla = COMPLAINT_SLA[dto.category];
    return {
      code: complaint.code,
      status: complaint.status,
      createdAt: complaint.createdAt,
      initialResponseHours: sla.initialResponseHours,
      resolutionDays: sla.resolutionDays,
    };
  }

  /**
   * Ghi phiếu, thử lại nếu mã trùng.
   *
   * Không kiểm tra tồn tại rồi mới ghi: giữa lúc kiểm tra và lúc ghi, một
   * request khác có thể chiếm mất mã, khiến phiếu của khách bị mất kèm lỗi
   * P2002 hiển thị thô ra giao diện. Ở đây để unique index của DB phân xử và
   * chỉ sinh mã mới khi thực sự đụng độ.
   */
  private async createWithUniqueCode(dto: CreateComplaintDto) {
    for (let attempt = 1; attempt <= CODE_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.repository.create({
          code: this.generateCode(),
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          bookingCode: dto.bookingCode,
          category: dto.category,
          subject: dto.subject,
          content: dto.content,
        });
      } catch (error) {
        if (
          !this.isDuplicateCodeError(error) ||
          attempt === CODE_MAX_ATTEMPTS
        ) {
          throw error;
        }
        this.logger.warn(`Trùng mã phiếu, sinh lại (lần ${attempt})`);
      }
    }
    // Không tới được: vòng lặp hoặc return hoặc throw.
    throw new Error('Không sinh được mã phiếu duy nhất');
  }

  async findAll(query: ComplaintQueryDto) {
    const cacheKey = `complaints_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      category,
      search,
    } = query;

    const where: Prisma.ComplaintWhereInput = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { bookingCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: {
        [sortBy]: sortOrder,
      } as Prisma.ComplaintOrderByWithRelationInput,
      select: this.repository.complaintSelect,
    });

    const result = {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `complaint_${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const complaint = await this.repository.findFirst(
      { id, deletedAt: null },
      this.repository.complaintSelect,
    );
    if (!complaint) {
      throw new NotFoundException(
        `Không tìm thấy phiếu khiếu nại với ID: ${id}`,
      );
    }

    await this.cacheManager.set(cacheKey, complaint, 60000);
    return complaint;
  }

  /** Tra cứu công khai bằng mã phiếu — không yêu cầu đăng nhập. */
  async trackByCode(code: string) {
    const complaint = await this.repository.findFirst(
      { code: code.trim().toUpperCase(), deletedAt: null },
      this.repository.publicTrackSelect,
    );
    if (!complaint) {
      throw new NotFoundException(
        `Không tìm thấy phiếu khiếu nại với mã: ${code}`,
      );
    }
    return complaint;
  }

  async update(id: string, dto: UpdateComplaintDto) {
    await this.findOne(id);

    const data: Prisma.ComplaintUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (dto.response !== undefined) {
      data.response = dto.response;
      data.respondedAt = new Date();
    }
    if (dto.status) {
      const isClosed =
        dto.status === ComplaintStatus.resolved ||
        dto.status === ComplaintStatus.rejected;
      // Mở lại phiếu phải xóa mốc đóng, nếu không hồ sơ ghi phiếu đang xử lý
      // mà vẫn mang ngày giải quyết cũ.
      data.resolvedAt = isClosed ? new Date() : null;
    }

    const updated = await this.repository.update({ where: { id }, data });
    await this.invalidateCache(id);
    this.logger.log(`Complaint ${updated.code} → ${updated.status}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.softRemove({ id });
    await this.invalidateCache(id);
    return { id };
  }

  /**
   * Lỗi có phải do trùng `code` không.
   *
   * Prisma đặt `meta.target` là mảng tên cột với PostgreSQL, nhưng kiểu khai
   * báo chỉ là `unknown`. Kiểm tra từng phần tử thay vì ép chuỗi cả object —
   * ép chuỗi một object cho ra "[object Object]" và điều kiện luôn sai, khiến
   * phiếu của khách bị mất thay vì được sinh mã mới.
   */
  private isDuplicateCodeError(error: unknown): boolean {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return false;
    }

    const target: unknown = error.meta?.target;
    if (Array.isArray(target)) return target.includes('code');
    if (typeof target === 'string') return target.includes('code');
    // Không xác định được cột nào trùng: chỉ có `code` là unique trên bảng này,
    // nên vẫn coi là trùng mã và thử lại.
    return true;
  }

  /**
   * Phần ngày của mã phiếu, luôn theo giờ Việt Nam.
   *
   * Container thường chạy UTC. Nếu lấy ngày theo giờ máy, phiếu gửi lúc
   * 00:30 giờ Hà Nội sẽ mang mã ngày hôm trước trong khi `createdAt` và
   * giao diện tra cứu đều hiển thị ngày hôm nay — mã phiếu là định danh
   * pháp lý khách hàng trích dẫn, không được lệch ngày tiếp nhận.
   */
  private vietnamDatePart(now = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(now)
      .replace(/-/g, '');
  }

  /**
   * Sinh mã phiếu `KN-YYYYMMDD-XXXXXXXX`.
   *
   * Hậu tố là 8 ký tự Crockford base32 (bỏ I, L, O, U để khỏi đọc nhầm),
   * tức ~1,1 nghìn tỷ tổ hợp mỗi ngày. Không dùng dãy số ngắn: endpoint
   * `GET /complaints/track/:code` là public, hậu tố 4 chữ số cho phép quét
   * toàn bộ 10.000 mã của một ngày và thu về tiêu đề phiếu lẫn nội dung
   * phản hồi của nhân viên.
   */
  private generateCode(): string {
    const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const bytes = randomBytes(CODE_SUFFIX_LENGTH);
    let suffix = '';
    for (let i = 0; i < CODE_SUFFIX_LENGTH; i++) {
      suffix += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return `KN-${this.vietnamDatePart()}-${suffix}`;
  }

  private async invalidateCache(id: string) {
    await this.cacheManager.del(`complaint_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all(
      [...this.listCacheKeys].map((k) => this.cacheManager.del(k)),
    );
    this.listCacheKeys.clear();
  }
}
