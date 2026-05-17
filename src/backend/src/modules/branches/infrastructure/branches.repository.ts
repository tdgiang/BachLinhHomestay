import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Branch } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class BranchesRepository extends BaseRepository<
  Branch,
  Prisma.BranchCreateInput,
  Prisma.BranchUpdateInput,
  Prisma.BranchWhereUniqueInput,
  Prisma.BranchWhereInput,
  Prisma.BranchOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.branch as any);
  }

  readonly branchSelect: Prisma.BranchSelect = {
    id: true,
    name: true,
    nameEn: true,
    address: true,
    city: true,
    latitude: true,
    longitude: true,
    phone: true,
    description: true,
    descriptionEn: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };
}
