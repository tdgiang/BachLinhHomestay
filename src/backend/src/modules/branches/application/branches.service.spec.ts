import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesRepository } from '../infrastructure/branches.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
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
      await service.findAll({ city: 'Đà Nẵng' } as any);
      expect(mockRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ city: 'Đà Nẵng' }) }),
      );
    });

    it('returns cached list on cache hit', async () => {
      const cached = { items: [], meta: {} };
      mockCache.get.mockResolvedValue(cached);
      expect(await service.findAll({} as any)).toEqual(cached);
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
