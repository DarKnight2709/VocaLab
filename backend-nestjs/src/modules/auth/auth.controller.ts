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
  RefreshTokenDto,
  RefreshTokenResponseDto,
  SetPasswordDto,
  SignupDto,
  TempTokenResponseDto,
  TwoFactorGenerateResponseDto,
  TwoFactorLoginDto,
  TwoFactorVerifyDto,
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
  ): Promise<ResponseInterceptor<LoginResponseDto | TempTokenResponseDto>> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    return {
      data: result
    }
  }

  @Post('two-factor-auth/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({
    summary: 'Đăng nhập (Public)',
    description: 'Đăng nhập với email và password',
  })
  async loginTwoFa(
    @Body() twoFactorLoginDto: TwoFactorLoginDto,
    @Req() request: Request,
  ): Promise<ResponseInterceptor<LoginResponseDto>> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const result = await this.authService.loginTwoFa(twoFactorLoginDto, ipAddress, userAgent);

    return {
      data: result
    }
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
  ): Promise<ResponseInterceptor<RefreshTokenResponseDto>> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const result = await this.authService.refreshToken(refreshTokenDto, ipAddress, userAgent);

    return {
      data: result
    }
  }

  @Post('logout')
  @IsProtected()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất (Protect)',
    description: 'Đăng xuất đồng thời thu hồi refresh token',
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  async signup(
    @Body() signupDto: SignupDto,
  ): Promise<void> {
    await this.authService.signup(signupDto);
  }

  // lấy người dùng hiện tại
  @Get('me')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Lấy thông tin user từ access token (Protect)',
  })
  async getCurrentUser(@CurrentUser() user: any): Promise<ResponseInterceptor<PublicUser>> {
    const result =  await this.authService.getCurrentUser(user.id);
    return {
      data: result
    }
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
  ): Promise<void> {
    await this.authService.setPassword(user.id, setPasswordDto);
  }

  @Patch('change-password')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Đổi mật khẩu (Protect)',
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(user.id, changePasswordDto);
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

  @Post('two-factor-auth/generate')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Tạo mã 2FA (Protect)',
  })
  async generateTwoFactorAuth(
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<TwoFactorGenerateResponseDto>> {
    const result = await this.authService.generateTwoFactorSecret(user.id);

    return {
      data: result,
    };
  }

  @Post('two-factor-auth/verify')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Xác thực mã 2FA (Protect)',
  })
  async verifyTwoFactorAuth(
    @CurrentUser() user: any,
    @Body() verifyDto: TwoFactorVerifyDto,
  ): Promise<void> {
    await this.authService.verifyTwoFactorAuth(user.id, verifyDto.code);
  }

  @Post('two-factor-auth/disable')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Tắt mã 2FA (Protect)',
  })
  async disableTwoFactorAuth(
    @CurrentUser() user: any,
  ): Promise<void> {
    await this.authService.disableTwoFactorAuth(user.id);
  }
}
