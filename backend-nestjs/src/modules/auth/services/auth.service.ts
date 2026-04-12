import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  SignupDto,
} from '../auth.dto';
import { HashingService } from '@/common/services/hashing.service';
import { RsaKeyManager } from '@/common/utils/RsaKeyManager';
import {
  IUSER_REPOSITORY,
  type UserRepositoryInterface,
} from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserEntity } from '@/modules/users/domain/user.entity';

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
    @Inject(IUSER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    try {
      const { username, password } = loginDto;

      // tìm user theo username
      const user = await this.prisma.user.findUnique({
        where: { username },
        // include: {
        //   roles: true,
        // },
      });

      if (!user) {
        throw new UnauthorizedException(
          'Tên đăng nhập hoặc mặt khẩu không hợp lệ',
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log('Unique constraint failed on: ', error.meta?.target);
        }
      }
      throw error;
    }
  }

  async refreshToken(
    refreshToken: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponseDto> {
    // lấy token ra
    const rawRefreshToken = refreshToken.refreshToken;

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

      // Transaction để revoke + tạo refresh token mới
      return await this.prisma.$transaction(async (manager) => {
        // check trong database xem có bản ghi nào có userid/refresh token hợp lệ, expiresAt < now, ip/user-agent giống nhau, isRevoked  = false
        const tokenEntity = await manager.refreshToken.findUnique({
          where: {
            token: this.hashToken(rawRefreshToken),
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
          where: { token: this.hashToken(rawRefreshToken) },
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

  async signup(signupDto: SignupDto) {
    // Check username exists
    const existingUser = await this.userRepository.findByUsername(
      signupDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Check email exists
    const existingEmail = await this.userRepository.findByEmail(
      signupDto.email,
    );

    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(signupDto.password, 10);

    // Create user
    const newUser = await this.userRepository.create({
      username: signupDto.username,
      hashedPassword,
      fullName: signupDto.fullName,
      email: signupDto.email,
    });

    return {
      message: 'Đăng ký thành công',
      user: newUser,
    };
  }

  async googleAuth(profile: any) {
    const email = profile?.emails?.[0]?.value;
    const fullName = profile?.displayName || 'Google User';
    const avatar = profile?.photos?.[0]?.value;

    if (!email) {
      throw new Error('Google profile is missing email');
    }

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      const emailPrefix = email.split('@')[0] || 'user';
      let username = emailPrefix;
      const existingUsername =
        await this.userRepository.findByUsername(username);

      if (existingUsername) {
        username = `${emailPrefix}_${Date.now()}`;
      }

      const randomPassword = `${profile?.id || 'google'}_${Date.now()}`;
      const hashedPassword = bcrypt.hashSync(randomPassword, 10);

      user = await this.userRepository.create({
        username,
        hashedPassword,
        fullName,
        email,
      });
    }

    return user;
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    try {
      // verify refresh token
      jwt.verify(refreshToken, this.keyManager.getPublicKeyRefresh(), {
        algorithms: ['RS256'],
      }) as JWTRefreshPayLoad;

      // thu hồi refresh
      await this.prisma.refreshToken.updateMany({
        where: {
          token: this.hashToken(refreshToken),
          isRevoked: false,
        },
        data: { isRevoked: true },
      });

      return {
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      // Vẫn trả về thành công để không leak thông tin
      return { message: 'Đăng xuất thành công' };
    }
  }

  private generateAccessToken(user: UserEntity): string {
    // mã hóa(sign) dữ liệu bằng private access key.
    const payload = {
      sub: user.id,
      username: user.username,
      // roles: user.roles.map((role) => role.name),
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
    user: UserEntity,
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
    const refreshToken = jwt.sign(
      payload,
      this.keyManager.getPrivateKeyRefresh(),
      {
        algorithm: 'RS256',
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    // lưu refresh token vào database
    const refreshExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN');

    await (manager
      ? manager.refreshToken.create({
          data: {
            token: this.hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
            ipAddress,
            userAgent,
          },
        })
      : this.prisma.refreshToken.create({
          data: {
            token: this.hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
            ipAddress,
            userAgent,
          },
        }));
    return refreshToken;
  }
}
