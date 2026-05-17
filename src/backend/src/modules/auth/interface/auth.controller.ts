import {
  Controller, Post, Get, Body, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email hoặc SĐT đã tồn tại' })
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return { message: 'Đăng ký tài khoản thành công', data };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email hoặc số điện thoại' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không đúng' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return { message: 'Đăng nhập thành công', data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất (thu hồi refresh token)' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(@Request() req: { user: { id: string } }) {
    const data = await this.authService.logout(req.user.id);
    return { message: 'Đăng xuất thành công', data };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng' })
  async me(@Request() req: { user: object }) {
    return { message: 'Lấy thông tin thành công', data: req.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token (có rotate refresh token)' })
  @ApiResponse({ status: 200, description: 'Tokens mới' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc hết hạn' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return { message: 'Làm mới token thành công', data };
  }
}
