import { ErrorCode } from '@/common/enums/error-code.enum';
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
      throw new WsException(ErrorCode.UNAUTHORIZED);
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
          username: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new WsException(ErrorCode.UNAUTHORIZED);
      }

      client.user = {
        id: payload.sub,
        email: payload.email,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
      };
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Socket auth error: ${error.message}`);
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError'
        ) {
          throw new WsException(ErrorCode.INVALID_TOKEN);
        }
      }

      throw new WsException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
