import { Provider } from '@nestjs/common';
import { ConfigService } from '@/common/services/config.service';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    return new Redis({
      host: configService.get('REDIS_HOST'),
      port: Number(configService.get('REDIS_PORT')),
    });
  },
  inject: [ConfigService],
};
