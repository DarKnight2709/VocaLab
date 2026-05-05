import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../../core/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RsaKeyManager } from '../utils/RsaKeyManager';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly keyManager: RsaKeyManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client = context.switchToWs().getClient();
    const token =
      client.handshake?.auth?.token || client.handshake?.headers?.token;

    if (!token) {
      this.logger.error('No token found in handshake');
      throw new WsException('Vui lòng đăng nhập để tiếp tục socket');
    }

    try {
      const payload = jwt.verify(token, this.keyManager.getPublicKeyAccess(), {
        algorithms: ['RS256'],
      }) as JwtPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub as string },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });

      if (!user) {
        throw new WsException('Vui lòng đăng nhập để tiếp tục');
      }

      client.user = {
        id: payload.sub,
        email: payload.email,
        fullName: user.fullName,
      };
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Socket auth error: ${error.message}`);
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError'
        ) {
          throw new WsException(
            'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại',
          );
        }
      }

      throw new WsException('Internal server error');
    }
  }
}
