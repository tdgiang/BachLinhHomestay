import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { AmenitiesRepository } from '../infrastructure/amenities.repository';
import { CreateAmenityDto } from '../interface/dto/create-amenity.dto';
import { UpdateAmenityDto } from '../interface/dto/update-amenity.dto';
import { AmenityQueryDto } from '../interface/dto/amenity-query.dto';

@Injectable()
export class AmenitiesService {
  private readonly logger = new Logger(AmenitiesService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: AmenitiesRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateAmenityDto) {
    const amenity = await this.repository.create(dto as Prisma.AmenityCreateInput);
    await this.invalidateListCache();
    this.logger.log(`Amenity created: ${amenity.id}`);
    return amenity;
  }

  async findAll(query: AmenityQueryDto) {
    const cacheKey = `amenities_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const { page = 1, limit = 100, sortBy = 'category', sortOrder = 'asc', search, category } = query;

    const where: Prisma.AmenityWhereInput = { deletedAt: null };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [amenities, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder } as Prisma.AmenityOrderByWithRelationInput,
      select: this.repository.amenitySelect,
    });

    const result = {
      items: amenities,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string) {
    const amenity = await this.repository.findOne({ id }, this.repository.amenitySelect);
    if (!amenity || (amenity as any).deletedAt) {
      throw new NotFoundException(`Không tìm thấy tiện ích với ID: ${id}`);
    }
    return amenity;
  }

  async update(id: string, dto: UpdateAmenityDto) {
    await this.findOne(id);
    const amenity = await this.repository.update({
      where: { id },
      data: dto as Prisma.AmenityUpdateInput,
    });
    await this.invalidateAmenityCache(id);
    this.logger.log(`Amenity updated: ${id}`);
    return amenity;
  }

  async remove(id: string) {
    await this.findOne(id);
    const amenity = await this.repository.softRemove({ id });
    await this.invalidateAmenityCache(id);
    this.logger.log(`Amenity soft-deleted: ${id}`);
    return amenity;
  }

  private async invalidateAmenityCache(id: string) {
    await this.cacheManager.del(`amenity_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
