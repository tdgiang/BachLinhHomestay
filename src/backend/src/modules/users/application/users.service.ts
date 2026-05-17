import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../interface/dto/create-user.dto';
import { UpdateUserDto } from '../interface/dto/update-user.dto';
import { UserQueryDto } from '../interface/dto/user-query.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';

/** Public user shape — no password, no deletedAt. Used by guards and auth service. */
export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: UsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.email) {
      const existingEmail = await this.findByEmail(createUserDto.email);
      if (existingEmail) throw new ConflictException('Email đã tồn tại');
    }
    if (createUserDto.phone) {
      const existingPhone = await this.findByPhone(createUserDto.phone);
      if (existingPhone) throw new ConflictException('Số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { fullName, ...rest } = createUserDto;
    const user = await this.repository.create({
      ...rest,
      fullName: fullName ?? createUserDto.email ?? createUserDto.phone ?? 'Người dùng',
      password: hashedPassword,
    });

    await this.invalidateListCache();
    this.logger.log(`User created: ${user.email}`);
    const { password: _password, ...result } = user;
    return result;
  }

  async findAll(query: UserQueryDto) {
    const cacheKey = `users_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      email,
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (email) where.email = email;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy: {
        [sortBy as keyof Prisma.UserOrderByWithRelationInput]: sortOrder,
      },
      select: this.repository.userSelect,
    });

    const result = {
      items: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string): Promise<AuthUser> {
    const cacheKey = `user_${id}`;
    const cached = await this.cacheManager.get<AuthUser>(cacheKey);
    if (cached) return cached;

    const user = await this.repository.findOne(
      { id },
      this.repository.userSelect,
    );
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    const authUser = user as unknown as AuthUser;
    await this.cacheManager.set(cacheKey, authUser, 60000);
    return authUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // ensure exists

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.repository.update({
      where: { id },
      data: updateUserDto,
    });
    await this.invalidateUserCache(id);
    this.logger.log(`User updated: ${id}`);

    const { password: _password, ...result } = user;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists

    const user = await this.repository.softRemove({ id });
    await this.invalidateUserCache(id);
    this.logger.log(`User soft-deleted: ${id}`);

    const { password: _password, ...result } = user;
    return result;
  }

  /** Finds an active, non-deleted user by email. Used for authentication. */
  async findByEmail(email: string) {
    return this.repository.findFirst({ email, deletedAt: null } as any);
  }

  /** Finds an active, non-deleted user by phone. Used for authentication. */
  async findByPhone(phone: string) {
    return this.repository.findFirst({ phone, deletedAt: null } as any);
  }

  /** Saves hashed refresh token for stateful refresh revocation. */
  async saveRefreshTokenHash(id: string, hash: string | null) {
    return this.repository.update({ where: { id }, data: { refreshTokenHash: hash } as any });
  }

  /** Returns user including refreshTokenHash — used only by auth.service for refresh verification. */
  async findByIdWithHash(id: string) {
    return this.repository.findOne({ id });
  }

  private async invalidateUserCache(id: string) {
    await this.cacheManager.del(`user_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all(
      [...this.listCacheKeys].map((k) => this.cacheManager.del(k)),
    );
    this.listCacheKeys.clear();
  }
}
