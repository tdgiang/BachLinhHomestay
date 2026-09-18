import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Complaint, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class ComplaintsRepository extends BaseRepository<
  Complaint,
  Prisma.ComplaintCreateInput,
  Prisma.ComplaintUpdateInput,
  Prisma.ComplaintWhereUniqueInput,
  Prisma.ComplaintWhereInput,
  Prisma.ComplaintOrderByWithRelationInput
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, prismaService.complaint as any);
  }

  /** Dùng cho danh sách phía admin. */
  readonly complaintSelect: Prisma.ComplaintSelect = {
    id: true,
    code: true,
    fullName: true,
    email: true,
    phone: true,
    bookingCode: true,
    category: true,
    subject: true,
    content: true,
    status: true,
    response: true,
    respondedAt: true,
    resolvedAt: true,
    createdAt: true,
    updatedAt: true,
  };

  /**
   * Chỉ các trường khách hàng được xem khi tra cứu công khai bằng mã phiếu.
   * Không lộ email/phone để mã phiếu bị lộ cũng không rò rỉ dữ liệu cá nhân.
   */
  readonly publicTrackSelect: Prisma.ComplaintSelect = {
    code: true,
    category: true,
    subject: true,
    status: true,
    response: true,
    respondedAt: true,
    resolvedAt: true,
    createdAt: true,
  };
}
