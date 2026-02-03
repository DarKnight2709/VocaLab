import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  SignupDto,
} from './auth.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type Request } from 'express';
import { IsProtected } from 'src/common/decorators/protected.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({
    summary: 'Đăng nhập (Public)',
    description: 'Đăng nhập với username và password',
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

  //logout
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
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  // lấy người dùng hiện tại
  @Get('me')
  @IsProtected()
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Lấy thông tin user từ access token (Protect)',
  })
  async getCurrentUser(@CurrentUser() user: any) {
    return await this.authService.getCurrentUser(user.id);
  }


}
