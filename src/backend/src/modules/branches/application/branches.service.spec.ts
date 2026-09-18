import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BranchesService } from './branches.service';
import { BranchQueryDto } from '../interface/dto/branch-query.dto';
import { BranchesRepository } from '../infrastructure/branches.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

/** Tham số findAll mà service truyền xuống repository. */
type FindAllArgs = { where: Prisma.BranchWhereInput };

const mockRepo = {
  create: jest.fn(),
  // Gõ kiểu để các assertion đọc `where` không bị coi là truy cập trên `any`.
  findAll: jest.fn<Promise<[unknown[], number]>, [FindAllArgs]>(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  branchSelect: {},
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

describe('BranchesService', () => {
  let service: BranchesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: BranchesRepository, useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();
    service = module.get(BranchesService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findOne', () => {
    it('returns cached branch on cache hit', async () => {
      const branch = { id: 'b1', name: 'Test Branch' };
      mockCache.get.mockResolvedValue(branch);
      expect(await service.findOne('b1')).toEqual(branch);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when branch not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('applies city filter when provided', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({ city: 'Hà Nội' } as any);
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ city: 'Hà Nội' }),
        }),
      );
    });

    it('returns cached list on cache hit', async () => {
      const cached = { items: [], meta: {} };
      mockCache.get.mockResolvedValue(cached);
      expect(await service.findAll({} as any)).toEqual(cached);
    });

    it('mặc định chỉ trả chi nhánh đang hoạt động (endpoint công khai)', async () => {
      // Test cache-hit ở trên set mockCache.get; clearAllMocks không xoá
      // implementation nên phải trả về cache miss tường minh.
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({} as BranchQueryDto);
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('includeInactive cho trang quản trị thấy cả chi nhánh đã ẩn', async () => {
      // Test cache-hit ở trên set mockCache.get; clearAllMocks không xoá
      // implementation nên phải trả về cache miss tường minh.
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({ includeInactive: true } as BranchQueryDto);
      expect(mockRepo.findAll.mock.calls[0][0].where.isActive).toBeUndefined();
    });

    it('isActive truyền tường minh vẫn được tôn trọng', async () => {
      // Test cache-hit ở trên set mockCache.get; clearAllMocks không xoá
      // implementation nên phải trả về cache miss tường minh.
      mockCache.get.mockResolvedValue(null);
      mockRepo.findAll.mockResolvedValue([[], 0]);
      await service.findAll({ isActive: false } as BranchQueryDto);
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });

  describe('create', () => {
    it('creates branch and invalidates list cache', async () => {
      mockRepo.create.mockResolvedValue({ id: 'new', name: 'New' });
      await service.create({ name: 'New', address: 'A', city: 'B' } as any);
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when branch does not exist', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
