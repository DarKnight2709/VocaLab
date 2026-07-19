import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
// import { UserEntity } from 'src/database/entities/user.entity';
// import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IRequest } from '../types';
import { RsaKeyManager } from '../utils/RsaKeyManager';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    // lấy public key để verify JWT
    private readonly keyManager: RsaKeyManager,
    // đọc metadata của decorator (@Public())
    private readonly reflector: Reflector,
    // lấy repo để query user
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // nếu có route có @Public(), bỏ qua xác thực bắt buộc -> cho đi thẳng nhưng vẫn giải mã token nếu có để hỗ trợ optional auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        try {
          const payload = jwt.verify(token, this.keyManager.getPublicKeyAccess(), {
            algorithms: ['RS256'],
          }) as JwtPayload;

          const user = await this.prisma.user.findUnique({
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              avatar: true,
            },
            where: {
              id: payload.sub as string,
            },
          });

          if (user) {
            request.user = {
              id: payload.sub,
              email: payload.email,
              fullName: user.fullName,
              username: user.username,
              avatar: user.avatar,
            };
          }
        } catch (e: any) {
          this.logger.warn(`Optional JWT verification failed: ${e.message}`);
        }
      }
      return true;
    }

    // không có token -> 401
    if (!token) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    // giải mã token + xác minh chữ kí bằng public key -> lấy được payload
    try {
      const payload = jwt.verify(token, this.keyManager.getPublicKeyAccess(), {
        algorithms: ['RS256'],
      }) as JwtPayload;

      // Dùng query builder để chắc chắn join đầy đủ roles + permissions
      const user = await this.prisma.user.findUnique({
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          avatar: true,
        },
        where: {
          id: payload.sub as string,
        },
      });
      if (!user) {
        throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
      }

      // Gán thông tin user vào request để tiếp tục khâu permission guard
      request.user = {
        id: payload.sub,
        email: payload.email,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(ErrorCode.EXPIRED_TOKEN);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          ErrorCode.INVALID_TOKEN,
        );
      } else if (error instanceof ForbiddenException) {
        throw error;
      } else if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error('JWT verification failed:', error);
        throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
