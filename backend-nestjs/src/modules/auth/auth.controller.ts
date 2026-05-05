import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import {
  ChangePasswordDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  SetPasswordDto,
  SignupDto,
} from './auth.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type Request, type Response } from 'express';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@/common/services/config.service';
import { PublicUser } from '../users/user.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly configService: ConfigService,
  ) {}

  // login
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({
    summary: 'Đăng nhập (Public)',
    description: 'Đăng nhập với email và password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    return await this.authService.login(loginDto, ipAddress, userAgent);
  }

  // refresh token
  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @ApiOperation({
    summary: 'Làm mới access token và refresh token (Public)',
    description: 'Sử dụng refresh token để lấy access và refresh token mới',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<RefreshTokenResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    return this.authService.refreshToken(refreshTokenDto, ipAddress, userAgent);
  }

  @Post('logout')
  @IsProtected()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiOperation({
    summary: 'Đăng xuất (Protect)',
    description: 'Đăng xuất đồng thời thu hồi refresh token',
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LogoutResponseDto> {
    return await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  async signup(
    @Body() signupDto: SignupDto,
  ): Promise<ResponseInterceptor<PublicUser>> {
    const result = await this.authService.signup(signupDto);
    return {
      message: 'Đăng ký thành công',
      data: result,
    };
  }

  // lấy người dùng hiện tại
  @Get('me')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Lấy thông tin user từ access token (Protect)',
  })
  async getCurrentUser(@CurrentUser() user: any) {
    return await this.authService.getCurrentUser(user.id);
  }

  @Patch('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Thiết lập mật khẩu lần đầu',
    description: 'Chỉ áp dụng cho tài khoản đăng ký bằng Google',
  })
  @ApiOkResponse({ type: Object })
  async setPassword(
    @Body() setPasswordDto: SetPasswordDto,
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<any>> {
    await this.authService.setPassword(user.id, setPasswordDto);
    return {
      message: 'Thiết lập mật khẩu thành công!',
    };
  }

  @Patch('change-password')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Đổi mật khẩu (Protect)',
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseInterceptor<void>> {
    await this.authService.changePassword(user.id, changePasswordDto);
    return {
      message: 'Đổi mật khẩu thành công!',
    };
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Bắt đầu đăng nhập Google' })
  async googleAuth() {
    // Sẽ không bao giờ được gọi vì sẽ redirect ngay lập tức
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({ summary: 'Callback sau khi Google xác thực' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const user = req.user; // Dữ liệu từ GoogleStrategy.validate()
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    // Tạo response
    const result = await this.authService.handleGoogleLogin(
      user,
      ipAddress,
      userAgent,
    );

    // Thiết lập cookie để truyền dữ liệu sang Frontend
    // Cookie này chỉ tồn tại trong 2 phút để FE kịp đọc và lưu vào Zustand
    res.cookie('accessToken', result.accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 1000,
    });

    // Redirect về client mà không mang theo dữ liệu trên URL
    const redirectUrl = `${this.configService.get('CLIENT_URL')}/auth/callback`;
    return res.redirect(redirectUrl);
  }
}
