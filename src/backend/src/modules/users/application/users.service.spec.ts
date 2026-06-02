import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../infrastructure/users.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Record<string, jest.Mock>;

  const mockRepository = {
    create:     jest.fn(),
    findAll:    jest.fn(),
    findOne:    jest.fn(),
    findFirst:  jest.fn(),
    update:     jest.fn(),
    softRemove: jest.fn(),
    userSelect: {},
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repository = mockRepository;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
        { provide: CACHE_MANAGER,   useValue: mockCache },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findOne', () => {
    it('returns user from cache when present', async () => {
      const user = { id: '1', email: 'a@a.com', fullName: 'A' };
      mockCache.get.mockResolvedValue(user);
      expect(await service.findOne('1')).toEqual(user);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('fetches from repo and caches on miss', async () => {
      const user = { id: '1', email: 'a@a.com', fullName: 'A' };
      mockCache.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(user);
      expect(await service.findOne('1')).toEqual(user);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('throws NotFoundException when user not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('searches by fullName (not firstName/lastName)', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([[{ id: '1' }], 1]);

      await service.findAll({ search: 'John', page: 1, limit: 10 } as any);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { fullName: { contains: 'John', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('returns cached result on hit', async () => {
      const cached = { items: [], meta: {} };
      mockCache.get.mockResolvedValue(cached);
      expect(await service.findAll({} as any)).toEqual(cached);
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('filters by isActive', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([[], 0]);
      await service.findAll({ isActive: false } as any);
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });

  describe('create', () => {
    it('throws ConflictException on duplicate email', async () => {
      mockRepository.findFirst.mockResolvedValue({ id: 'x' });
      await expect(
        service.create({ email: 'taken@a.com', password: 'abc123' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('strips password from returned value', async () => {
      mockRepository.findFirst.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: '1', email: 'new@a.com', fullName: 'New', password: 'hashed',
      });
      const result = await service.create({ email: 'new@a.com', password: 'p' } as any);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('calls softRemove and invalidates cache', async () => {
      const user = { id: '1', email: 'a@a.com', fullName: 'A', password: 'h' };
      mockCache.get.mockResolvedValue(user);
      mockRepository.softRemove.mockResolvedValue({ ...user, deletedAt: new Date() });

      await service.remove('1');

      expect(repository.softRemove).toHaveBeenCalledWith({ id: '1' });
      expect(mockCache.del).toHaveBeenCalledWith('user_1');
    });
  });
});
