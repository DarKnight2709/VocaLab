import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

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
} from '../auth.dto';
import { HashingService } from '@/common/services/hashing.service';
import { RsaKeyManager } from '@/common/utils/RsaKeyManager';
import { UserService } from '@/modules/users/users.service';
import { PublicUser, TokenUser } from '@/modules/users/user.types';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface JWTRefreshPayLoad {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly hashingService: HashingService,
    private readonly keyManager: RsaKeyManager,
    private readonly userService: UserService,
  ) {}

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto | TempTokenResponseDto> {
    const { email, password } = loginDto;

    // tìm user theo email (bao gồm cả user đã bị xóa mềm)
    const user = await (this.prisma as any).$parent.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    if (!user.hashedPassword && user.googleId) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã được đăng ký bằng Google, vui lòng đăng nhập bằng Google và đặt mật mẩu để tiếp tục đăng nhập',
      );
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = this.hashingService.compare(
      password,
      user.hashedPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không hợp lệ');
    }

    if (user.deletedAt !== null) {
      await this.restoreAccount(user.id);
    }

    if(user.isTwoFactorEnabled) {
      const tempToken = this.generateTempToken(user);
      return {
        tempToken
      };
    }

    // tạo access token và refresh token
    const accessToken = this.generateAccessToken(user);

    // create refresh token
    // store the refresh token into dabase.
    const refreshToken = await this.generateRefreshToken(
      user,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }


  async loginTwoFa(
    twoFactorLoginDto: TwoFactorLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const { tempToken, code } = twoFactorLoginDto;

    // 1. Verify tempToken
    let payload: any;
    try {
      payload = jwt.verify(tempToken, this.keyManager.getPublicKeyTemp(), {
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = payload.sub;

    // 2. Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Yêu cầu xác thực không hợp lệ');
    }

    // 3. Verify OTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      this.logger.warn(`OTP verification failed for user ${user.id}`);
      throw new UnauthorizedException('Mã OTP không chính xác');
    }

    // 4. Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async restoreAccount(userId: string): Promise<void> {
    // Khôi phục tài khoản
    await (this.prisma as any).$parent.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });
  }

  async refreshToken(
    refreshToken: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponseDto> {
    // lấy token ra
    const { refreshToken: rawRefreshToken } = refreshToken;

    // check valid
    if (!rawRefreshToken) {
      throw new UnauthorizedException(
        'Không thực hiện được hành động này vì thiếu refresh token',
      );
    }

    try {
      //verify -> lấy payload
      const payload = jwt.verify(
        rawRefreshToken,
        this.keyManager.getPublicKeyRefresh(),
        {
          algorithms: ['RS256'],
        },
      ) as JWTRefreshPayLoad;

      const jti = payload.jti;

      // Transaction để revoke + tạo refresh token mới
      return await this.prisma.$transaction(async (manager) => {
        // check trong database xem có bản ghi nào có userid/refresh token hợp lệ, expiresAt < now, ip/user-agent giống nhau, isRevoked  = false
        const tokenEntity = await manager.refreshToken.findUnique({
          where: {
            id: jti,
          },
          include: {
            user: true,
          },
        });

        if (
          !tokenEntity ||
          tokenEntity.userId !== payload.sub ||
          tokenEntity.isRevoked ||
          tokenEntity.expiresAt <= new Date() ||
          (ipAddress && tokenEntity.ipAddress !== ipAddress) ||
          (userAgent && tokenEntity.userAgent !== userAgent)
        ) {
          throw new UnauthorizedException(
            'Refresh token không hợp lệ hoặc hết hạn',
          );
        }

        // revoke the old refresh.
        await manager.refreshToken.update({
          where: { id: jti },
          data: { isRevoked: true },
        });

        // valid thì tạo mới access token và refresh token mới
        // tạo access token và refresh token

        const newAccessToken = this.generateAccessToken(tokenEntity.user);

        // create refresh token
        // store the refresh token into dabase.
        const newRefreshToken = await this.generateRefreshToken(
          tokenEntity.user,
          ipAddress,
          userAgent,
          manager,
        );

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          'Refresh token đã hết hạn, vui lòng đăng nhập lại',
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          'Refresh token không hợp lệ, vui lòng đăng nhập lại',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Refresh token verification failed:', error);
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async signup(signupDto: SignupDto): Promise<void> {
    // Check username exists
    const existingUser = await this.userService.findByUsername(
      signupDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Check email exists
    const existingEmail = await this.userService.findByEmail(signupDto.email);

    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(signupDto.password, 10);

    // Create user
    await this.userService.create({
      username: signupDto.username,
      hashedPassword,
      fullName: signupDto.fullName,
      email: signupDto.email,
    });
  }

  async handleGoogleLogin(
    profile: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    const { googleId, email, fullName, avatar } = profile;

    if (!email || !googleId) {
      throw new Error('Google profile is missing email or googleId');
    }

    // tìm người dùng với email nếu exist mà không có googleId thì cập nhật googleId
    let existUser = await (this.prisma as any).$parent.user.findUnique({
      where: { email },
    });

    // chưa có thì tạo
    if (!existUser) {
      let username = email.split('@')[0];
      const isUsernameExist = await this.userService.findByUsername(username);
      if (isUsernameExist) {
        username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
      }
      existUser = await this.prisma.user.create({
        data: {
          googleId,
          username,
          email,
          fullName,
          avatar,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      if (existUser.deletedAt !== null) {
        await this.restoreAccount(existUser.id);
      }

      if (!existUser.googleId) {
        await this.prisma.user.update({
          where: {
            id: existUser.id,
          },
          data: {
            googleId,
          },
        });
      } else {
        if (existUser.googleId !== googleId) {
          throw new UnauthorizedException(
            'Tài khoảng này đã được liên kết với một Google account khác',
          );
        }
      }
    }

    // tạo access token và refresh token
    const accessToken = this.generateAccessToken(existUser);

    // create refresh token
    // store the refresh token into dabase.
    const refreshToken = await this.generateRefreshToken(
      existUser,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // verify refresh token
      const payload = jwt.verify(
        refreshToken,
        this.keyManager.getPublicKeyRefresh(),
        {
          algorithms: ['RS256'],
        },
      ) as JWTRefreshPayLoad;

      const jti = payload.jti;

      // thu hồi refresh
      await this.prisma.refreshToken.updateMany({
        where: {
          id: jti,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    } catch (error) {
      this.logger.error('Logout failed:', error);
    }
  }

  async setPassword(
    userId: string,
    setPasswordDto: SetPasswordDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (user.hashedPassword) {
      throw new BadRequestException(
        'You already have a password. Please use change password instead.',
      );
    }

    const hashedPassword = bcrypt.hashSync(setPasswordDto.password, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword,
      },
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!user.hashedPassword) {
      throw new BadRequestException(
        'You are using Google login. Please set a password before changing it.',
      );
    }

    const isPasswordValid = bcrypt.compareSync(
      changePasswordDto.oldPassword,
      user.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu cũ');
    }

    // check new password if it's the same as old password
    const isNewPasswordValid = bcrypt.compareSync(
      changePasswordDto.newPassword,
      user.hashedPassword,
    );

    if (isNewPasswordValid) {
      throw new UnauthorizedException(
        'Mật khẩu mới không được giống mật khẩu cũ',
      );
    }

    const hashedNewPassword = bcrypt.hashSync(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword: hashedNewPassword,
      },
    });

    // Thu hồi toàn bộ refresh token cũ của user để ép đăng xuất trên mọi thiết bị
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }


  async generateTwoFactorSecret(userId: string): Promise<TwoFactorGenerateResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    let secretBase32 = user.twoFactorSecret;

    // Nếu chưa có secret hoặc đã bật 2FA rồi mà vẫn gọi generate (muốn reset)
    // thì mới tạo mới. Còn đang thiết lập dở dang thì dùng lại cái cũ.
    if (!secretBase32 || user.isTwoFactorEnabled) {
      const secret = speakeasy.generateSecret({
        name: `VocaLab (${user.email})`,
        issuer: 'VocaLab',
      });
      secretBase32 = secret.base32;

      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          twoFactorSecret: secretBase32,
        },
      });
    }

    const otpauth_url = speakeasy.otpauthURL({
      secret: secretBase32,
      label: user.email,
      issuer: 'VocaLab',
      encoding: 'base32',
    });

    const qrCode = await QRCode.toDataURL(otpauth_url);

    return {
      qrCode,
    };
  }

  async verifyTwoFactorAuth(userId: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    this.logger.debug(`verifyTwoFactorAuth code=${code}`);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isValid = speakeasy.totp.verify({
      secret: user?.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      this.logger.warn(`OTP verification failed during setup for user ${user.id}`);
      throw new BadRequestException('Mã OTP không chính xác');
    }

    // bật 2FA
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isTwoFactorEnabled: true,
      }
    });
  }

  async disableTwoFactorAuth(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      }
    });
  }

  private generateAccessToken(user: TokenUser): string {
    // mã hóa(sign) dữ liệu bằng private access key.
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.keyManager.getPrivateKeyAccess(), {
      algorithm: 'RS256',
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateRefreshToken(
    user: TokenUser,
    ipAddress?: string,
    userAgent?: string,
    manager?: Prisma.TransactionClient,
  ): Promise<string> {
    const jti = crypto.randomUUID();
    const payload = {
      sub: user.id,
      jti,
    };

    // tạo
    const refreshExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN');
    // sign -> tự động thêm 2 trường là iat và exp
    const refreshToken = jwt.sign(
      payload,
      this.keyManager.getPrivateKeyRefresh(),
      {
        algorithm: 'RS256',
        expiresIn: refreshExpiresIn,
      },
    );

    // lưu refresh token vào database
    const createData = {
      id: jti,
      token: this.hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
      ipAddress,
      userAgent,
    };

    if (manager) {
      await manager.refreshToken.create({ data: createData });
    } else {
      await this.prisma.refreshToken.create({ data: createData });
    }

    return refreshToken;
  }


  private generateTempToken(user: TokenUser) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const tempToken = jwt.sign(payload, this.keyManager.getPrivateKeyTemp(), {
      algorithm: 'RS256',
      expiresIn: this.configService.get('TEMP_TOKEN_EXPIRES_IN')
    });

    return tempToken;
  }
}
