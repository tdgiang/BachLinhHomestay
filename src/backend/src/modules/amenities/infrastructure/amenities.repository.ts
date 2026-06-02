import { Injectable } from '@nestjs/common';
import { Amenity, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class AmenitiesRepository extends BaseRepository<
  Amenity,
  Prisma.AmenityCreateInput,
  Prisma.AmenityUpdateInput,
  Prisma.AmenityWhereUniqueInput,
  Prisma.AmenityWhereInput,
  Prisma.AmenityOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.amenity as any);
  }

  readonly amenitySelect: Prisma.AmenitySelect = {
    id: true,
    name: true,
    nameEn: true,
    icon: true,
    category: true,
    createdAt: true,
    updatedAt: true,
  };
}
