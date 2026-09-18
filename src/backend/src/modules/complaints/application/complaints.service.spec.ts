import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { ComplaintsService } from './complaints.service';
import { COMPLAINT_SLA } from './complaint-sla';
import { ComplaintsRepository } from '../infrastructure/complaints.repository';
import { CreateComplaintDto } from '../interface/dto/create-complaint.dto';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  softRemove: jest.fn(),
  complaintSelect: {},
  publicTrackSelect: {},
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

const validDto: CreateComplaintDto = {
  fullName: 'Nguyễn Văn A',
  email: 'a@example.com',
  phone: '0931708256',
  category: ComplaintCategory.booking,
  subject: 'Chưa nhận được email xác nhận',
  content: 'Tôi đã thanh toán nhưng chưa nhận được email xác nhận đặt phòng.',
};

describe('ComplaintsService', () => {
  let service: ComplaintsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockCache.get.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        { provide: ComplaintsRepository, useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();
    service = module.get(ComplaintsService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('create', () => {
    it('generates a KN-YYYYMMDD-XXXXXXXX code and returns the SLA for that category', async () => {
      mockRepo.create.mockImplementation(({ code }: { code: string }) =>
        Promise.resolve({
          code,
          status: ComplaintStatus.received,
          createdAt: new Date('2026-09-18T00:00:00Z'),
        }),
      );

      const result = await service.create(validDto);

      // Hậu tố base32 8 ký tự (Crockford: không có I, L, O, U).
      expect(result.code).toMatch(/^KN-\d{8}-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{8}$/);
      expect(result.status).toBe(ComplaintStatus.received);
      expect(result.initialResponseHours).toBe(
        COMPLAINT_SLA.booking.initialResponseHours,
      );
      expect(result.resolutionDays).toBe(COMPLAINT_SLA.booking.resolutionDays);
    });

    it('trả đúng SLA riêng cho từng nhóm vấn đề', async () => {
      mockRepo.create.mockImplementation(({ code }: { code: string }) =>
        Promise.resolve({
          code,
          status: ComplaintStatus.received,
          createdAt: new Date(),
        }),
      );

      const privacy = await service.create({
        ...validDto,
        category: ComplaintCategory.privacy,
      });

      expect(privacy.initialResponseHours).toBe(72);
      expect(privacy.resolutionDays).toBe(30);
    });

    it('phần ngày của mã phiếu theo giờ Việt Nam, không theo giờ máy', async () => {
      // 17/09 23:30 UTC = 18/09 06:30 giờ Hà Nội.
      jest.useFakeTimers().setSystemTime(new Date('2026-09-17T23:30:00Z'));
      mockRepo.create.mockImplementation(({ code }: { code: string }) =>
        Promise.resolve({
          code,
          status: ComplaintStatus.received,
          createdAt: new Date(),
        }),
      );

      const { code } = await service.create(validDto);
      jest.useRealTimers();

      expect(code.startsWith('KN-20260918-')).toBe(true);
    });

    it('sinh mã mới và thử lại khi đụng unique index, không làm mất phiếu', async () => {
      const duplicate = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: '7.0.0',
        meta: { target: ['code'] },
      });
      mockRepo.create
        .mockRejectedValueOnce(duplicate)
        .mockImplementation(({ code }: { code: string }) =>
          Promise.resolve({
            code,
            status: ComplaintStatus.received,
            createdAt: new Date(),
          }),
        );

      const result = await service.create(validDto);

      expect(mockRepo.create).toHaveBeenCalledTimes(2);
      expect(result.code).toMatch(/^KN-\d{8}-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{8}$/);
      // Hai lần gọi phải dùng hai mã khác nhau.
      const [first, second] = mockRepo.create.mock.calls.map(
        (c: any[]) => c[0].code,
      );
      expect(first).not.toBe(second);
    });

    it('không nuốt lỗi khác P2002', async () => {
      mockRepo.create.mockRejectedValue(new Error('mất kết nối DB'));
      await expect(service.create(validDto)).rejects.toThrow('mất kết nối DB');
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it('persists the submitted content unchanged', async () => {
      mockRepo.create.mockResolvedValue({
        code: 'KN-20260918-ABCDEFGH',
        status: ComplaintStatus.received,
        createdAt: new Date(),
      });

      await service.create(validDto);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: validDto.fullName,
          email: validDto.email,
          phone: validDto.phone,
          category: validDto.category,
          subject: validDto.subject,
          content: validDto.content,
        }),
      );
    });
  });

  describe('trackByCode', () => {
    it('normalises the code and hides personal data', async () => {
      mockRepo.findFirst.mockResolvedValue({ code: 'KN-20260918-0001' });

      await service.trackByCode('  kn-20260918-0001 ');

      expect(mockRepo.findFirst).toHaveBeenCalledWith(
        { code: 'KN-20260918-0001', deletedAt: null },
        mockRepo.publicTrackSelect,
      );
    });

    it('throws NotFoundException for an unknown code', async () => {
      mockRepo.findFirst.mockResolvedValue(null);
      await expect(service.trackByCode('KN-00000000-0000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('excludes soft-deleted rows', async () => {
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({});
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('returns the cached page without hitting the repository', async () => {
      const cached = {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockCache.get.mockResolvedValue(cached);

      await expect(service.findAll({})).resolves.toBe(cached);
      expect(mockRepo.findAll).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockRepo.findFirst.mockResolvedValue({
        id: 'c1',
        code: 'KN-20260918-0001',
      });
    });

    it('stamps respondedAt when a response is written', async () => {
      mockRepo.update.mockResolvedValue({
        code: 'KN-1',
        status: ComplaintStatus.in_progress,
      });

      await service.update('c1', {
        response: 'Chúng tôi đã kiểm tra và gửi lại email.',
      });

      const { data } = mockRepo.update.mock.calls[0][0];
      expect(data.response).toBe('Chúng tôi đã kiểm tra và gửi lại email.');
      expect(data.respondedAt).toBeInstanceOf(Date);
      expect(data.resolvedAt).toBeUndefined();
    });

    it('stamps resolvedAt when the status becomes resolved', async () => {
      mockRepo.update.mockResolvedValue({
        code: 'KN-1',
        status: ComplaintStatus.resolved,
      });

      await service.update('c1', { status: ComplaintStatus.resolved });

      expect(mockRepo.update.mock.calls[0][0].data.resolvedAt).toBeInstanceOf(
        Date,
      );
    });

    it('xóa resolvedAt khi mở lại phiếu đã đóng', async () => {
      mockRepo.update.mockResolvedValue({
        code: 'KN-1',
        status: ComplaintStatus.in_progress,
      });

      await service.update('c1', { status: ComplaintStatus.in_progress });

      expect(mockRepo.update.mock.calls[0][0].data.resolvedAt).toBeNull();
    });

    it('throws NotFoundException when the complaint does not exist', async () => {
      mockRepo.findFirst.mockResolvedValue(null);
      await expect(
        service.update('missing', { status: ComplaintStatus.resolved }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes instead of hard-deleting', async () => {
      mockRepo.findFirst.mockResolvedValue({ id: 'c1', code: 'KN-1' });
      mockRepo.softRemove.mockResolvedValue({ id: 'c1' });

      await expect(service.remove('c1')).resolves.toEqual({ id: 'c1' });
      expect(mockRepo.softRemove).toHaveBeenCalledWith({ id: 'c1' });
    });
  });
});
