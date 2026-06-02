import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/application/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash:    jest.fn().mockResolvedValue('hashed'),
}));

const mockUsersService = {
  create:                jest.fn(),
  findByEmail:           jest.fn(),
  findByPhone:           jest.fn(),
  findOne:               jest.fn(),
  saveRefreshTokenHash:  jest.fn(),
  findByIdWithHash:      jest.fn(),
};

const mockJwtService = {
  sign:   jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
};

const mockConfig = { get: jest.fn((key: string) => {
  const map: Record<string, string> = {
    JWT_EXPIRATION:          '15m',
    JWT_REFRESH_SECRET:      'refresh-secret',
    JWT_REFRESH_EXPIRATION:  '7d',
  };
  return map[key] ?? '';
})};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService,  useValue: mockUsersService },
        { provide: JwtService,    useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const user = {
      id: 'u1', email: 'a@a.com', phone: null, fullName: 'A',
      password: 'hashed', isActive: true, role: 'admin',
      refreshTokenHash: null, createdAt: new Date(), updatedAt: new Date(),
    };

    it('throws UnauthorizedException when neither email nor phone provided', async () => {
      await expect(service.login({ password: 'p' } as any)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'a@a.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for inactive user', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ ...user, isActive: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(service.login({ email: 'a@a.com', password: 'p' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens and user on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.saveRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.login({ email: 'a@a.com', password: 'p' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshTokenHash');
    });

    it('uses findByPhone when phone is provided', async () => {
      mockUsersService.findByPhone.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.saveRefreshTokenHash.mockResolvedValue(undefined);

      await service.login({ phone: '0901234567', password: 'p' });

      expect(mockUsersService.findByPhone).toHaveBeenCalledWith('0901234567');
      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears refresh token hash', async () => {
      mockUsersService.saveRefreshTokenHash.mockResolvedValue(undefined);
      await service.logout('u1');
      expect(mockUsersService.saveRefreshTokenHash).toHaveBeenCalledWith('u1', null);
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('throws UnauthorizedException for invalid token type', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'u1', type: 'access' });
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when hash does not match', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'u1', type: 'refresh' });
      mockUsersService.findByIdWithHash.mockResolvedValue({
        id: 'u1', isActive: true, email: 'a@a.com', refreshTokenHash: 'other-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.refresh('token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
