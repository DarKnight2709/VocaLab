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
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IRequest } from '../types';
import { RsaKeyManager } from '../utils/RsaKeyManager';
import { ErrorCode } from '../enums/error-code.enum';
import { JwtAccessTokenPayload } from '@/modules/auth/interfaces/JwtAccessTokenPayload';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    // lấy public key để verify JWT
    private readonly keyManager: RsaKeyManager,
    // đọc metadata của decorator (@Public())
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractTokenFromHeader(request);

    // nếu có route có @Public(), bỏ qua xác thực bắt buộc -> cho đi thẳng nhưng vẫn giải mã token nếu có để hỗ trợ optional auth
    if (isPublic) {
      if (token) {
        try {
          const payload = jwt.verify(
            token,
            this.keyManager.getPublicKeyAccess(),
            {
              algorithms: ['RS256'],
            },
          ) as JwtAccessTokenPayload;
          request.user = {
            id: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            username: payload.username,
            avatar: payload.avatar || null,
          };
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
      }) as JwtAccessTokenPayload;

      // Gán thông tin user vào request
      request.user = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        username: payload.username,
        avatar: payload.avatar || null,
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(ErrorCode.EXPIRED_TOKEN);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(ErrorCode.INVALID_TOKEN);
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
    if (type === 'Bearer' && token) {
      return token;
    }
    return request.cookies?.['accessToken'];
  }
}
