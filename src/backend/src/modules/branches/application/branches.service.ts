import {
  Injectable, NotFoundException, BadRequestException, Inject, Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { BranchesRepository } from '../infrastructure/branches.repository';
import { CreateBranchDto } from '../interface/dto/create-branch.dto';
import { UpdateBranchDto } from '../interface/dto/update-branch.dto';
import { BranchQueryDto } from '../interface/dto/branch-query.dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: BranchesRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateBranchDto) {
    const branch = await this.repository.create(dto as Prisma.BranchCreateInput);
    await this.invalidateListCache();
    this.logger.log(`Branch created: ${branch.id}`);
    return branch;
  }

  async findAll(query: BranchQueryDto) {
    const cacheKey = `branches_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
      search, city, isActive,
    } = query;

    const where: Prisma.BranchWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (city) where.city = city;
    if (isActive !== undefined) where.isActive = isActive;

    const [branches, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder } as Prisma.BranchOrderByWithRelationInput,
      select: this.repository.branchSelect,
    });

    const result = {
      items: branches,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `branch_${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const branch = await this.repository.findOne({ id }, this.repository.branchSelect);
    if (!branch) throw new NotFoundException(`Không tìm thấy chi nhánh với ID: ${id}`);

    await this.cacheManager.set(cacheKey, branch, 60000);
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    const branch = await this.repository.update({ where: { id }, data: dto });
    await this.invalidateBranchCache(id);
    this.logger.log(`Branch updated: ${id}`);
    return branch;
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.repository.remove({ id });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new BadRequestException('Không thể xóa chi nhánh vì vẫn còn phòng liên kết. Hãy xóa hoặc chuyển phòng trước.');
      }
      throw err;
    }
    await this.invalidateBranchCache(id);
    this.logger.log(`Branch deleted: ${id}`);
    return { id };
  }

  private async invalidateBranchCache(id: string) {
    await this.cacheManager.del(`branch_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
