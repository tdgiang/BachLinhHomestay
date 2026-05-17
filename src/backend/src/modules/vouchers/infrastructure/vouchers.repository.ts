import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Voucher } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class VouchersRepository extends BaseRepository<
  Voucher,
  Prisma.VoucherCreateInput,
  Prisma.VoucherUpdateInput,
  Prisma.VoucherWhereUniqueInput,
  Prisma.VoucherWhereInput,
  Prisma.VoucherOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.voucher as any);
  }

  async incrementUsedCount(id: string): Promise<void> {
    await (this as any).prisma.voucher.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }
}
