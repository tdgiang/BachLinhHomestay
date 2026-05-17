import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/application/users.service';
import { LoginDto } from '../interface/dto/login.dto';
import { RegisterDto } from '../interface/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    if (!loginDto.email && !loginDto.phone) {
      throw new UnauthorizedException('Vui lòng nhập email hoặc số điện thoại');
    }

    const user = loginDto.email
      ? await this.usersService.findByEmail(loginDto.email)
      : await this.usersService.findByPhone(loginDto.phone!);

    if (!user || !user.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Thông tin đăng nhập không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const payload = { sub: user.id, email: user.email ?? '' };
    const accessToken = this.signAccess(payload);
    const refreshToken = this.signRefresh(user.id);

    // Lưu hash của refresh token để có thể revoke
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.saveRefreshTokenHash(user.id, hash);

    const { password: _pw, refreshTokenHash: _rth, ...userResult } = user;
    return { user: userResult, accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersService.saveRefreshTokenHash(userId, null);
    return { success: true };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; type: string }>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const user = await this.usersService.findByIdWithHash(payload.sub);
      if (!user?.isActive) {
        throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
      }

      // Verify token hash matches stored hash
      if (!user.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
        throw new UnauthorizedException('Refresh token đã bị thu hồi');
      }

      const newAccessToken = this.signAccess({ sub: user.id, email: user.email ?? '' });
      const newRefreshToken = this.signRefresh(user.id);

      // Rotate: save new hash
      const newHash = await bcrypt.hash(newRefreshToken, 10);
      await this.usersService.saveRefreshTokenHash(user.id, newHash);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async validateUser(payload: { sub: string; email: string }) {
    return this.usersService.findOne(payload.sub);
  }

  private signAccess(payload: { sub: string; email: string }): string {
    const options: any = {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    };
    return this.jwtService.sign(payload, options as JwtSignOptions);
  }

  private signRefresh(userId: string): string {
    const options: any = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    };
    return this.jwtService.sign({ sub: userId, type: 'refresh' }, options as JwtSignOptions);
  }
}
