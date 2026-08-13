import type { RequestUser } from '@/common/types';
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
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type Request, type Response } from 'express';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@/common/services/config.service';
import { PublicUserDto } from '../users/dto/users-response.dto';
import {
  AccessTokenReponseDto,
  AuthTokensDto,
  TempTokenResponseDto,
  TwoFactorGenerateResponseDto,
} from './dto/auth-response.dto';
import {
  ChangePasswordDto,
  LoginDto,
  SetPasswordDto,
  SignupDto,
  TwoFactorLoginDto,
  TwoFactorVerifyDto,
} from './dto/auth.dto';

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
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiOperation({
    summary: 'Đăng nhập (Public)',
    description: 'Đăng nhập với email và password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenReponseDto | TempTokenResponseDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    if (result instanceof TempTokenResponseDto) {
      return result;
    }
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: Number(this.configService.get('REFRESH_TOKEN_EXPIRES_IN')) * 1000,
      path: '/api/v1/auth',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('two-factor-auth/login')
  @SerializeOptions({ type: AuthTokensDto, excludeExtraneousValues: true })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiOperation({
    summary: 'Đăng nhập 2FA (Public)',
    description: 'Đăng nhập với temp token và mã OTP',
  })
  async loginTwoFa(
    @Body() twoFactorLoginDto: TwoFactorLoginDto,
    @Req() request: Request,
  ): Promise<AuthTokensDto> {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const result = await this.authService.loginTwoFa(
      twoFactorLoginDto,
      ipAddress,
      userAgent,
    );

    return result;
  }

  // refresh token
  @Post('refresh-token')
  @SerializeOptions({ type: AuthTokensDto, excludeExtraneousValues: true })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiOperation({
    summary: 'Làm mới access token và refresh token (Public)',
    description: 'Sử dụng refresh token để lấy access và refresh token mới',
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenReponseDto> {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const oldRefreshToken = req.cookies['refreshToken'];
    const result = await this.authService.refreshToken(
      oldRefreshToken,
      ipAddress,
      userAgent,
    );

    // overwrite the cookie with the new one
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: Number(this.configService.get('REFRESH_TOKEN_EXPIRES_IN')) * 1000,
      path: '/api/v1/auth',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @IsProtected()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất (Protect)',
    description: 'Đăng xuất đồng thời thu hồi refresh token',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];
    await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken', {
      path: '/api/v1/auth',
    });
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    await this.authService.signup(signupDto);
  }

  // lấy người dùng hiện tại
  @Get('me')
  @SerializeOptions({ type: PublicUserDto, excludeExtraneousValues: true })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiOperation({
    summary: 'Lấy thông tin user từ access token (Protect)',
  })
  async getCurrentUser(
    @CurrentUser() user: RequestUser,
  ): Promise<PublicUserDto> {
    const result = await this.authService.getCurrentUser(user.id);
    return result;
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
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.authService.setPassword(user.id, setPasswordDto);
  }

  @Patch('change-password')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Đổi mật khẩu (Protect)',
  })
  async changePassword(
    @CurrentUser() user: RequestUser,
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
  @ApiOkResponse({ type: AuthTokensDto })
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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: Number(this.configService.get('REFRESH_TOKEN_EXPIRES_IN')) * 1000,
      path: '/api/v1/auth',
    });

    // Redirect về client mà không mang theo dữ liệu trên URL
    const redirectUrl = `${this.configService.get('CLIENT_URL')}/auth/callback`;
    return res.redirect(redirectUrl);
  }

  @Post('two-factor-auth/generate')
  @SerializeOptions({
    type: TwoFactorGenerateResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOkResponse({ type: TwoFactorGenerateResponseDto })
  @ApiOperation({
    summary: 'Tạo mã 2FA (Protect)',
  })
  async generateTwoFactorAuth(
    @CurrentUser() user: RequestUser,
  ): Promise<TwoFactorGenerateResponseDto> {
    const result = await this.authService.generateTwoFactorSecret(user.id);
    return result;
  }

  @Post('two-factor-auth/verify')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Xác thực mã 2FA (Protect)',
  })
  async verifyTwoFactorAuth(
    @CurrentUser() user: RequestUser,
    @Body() verifyDto: TwoFactorVerifyDto,
  ): Promise<void> {
    await this.authService.verifyTwoFactorAuth(user.id, verifyDto.code);
  }

  @Post('two-factor-auth/disable')
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Tắt mã 2FA (Protect)',
  })
  async disableTwoFactorAuth(@CurrentUser() user: RequestUser): Promise<void> {
    await this.authService.disableTwoFactorAuth(user.id);
  }
}
