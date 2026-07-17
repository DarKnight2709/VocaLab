import { Global, Module, Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClsModule } from "nestjs-cls";
import envConfig from "@/core/configs/env.config";
import { ConfigService } from "./services/config.service";
import { ApiExceptionFilter } from "./filters/http-exception.filter";
import { TransformInterceptor } from "./interceptors/transform.interceptor";
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiValidationPipe } from "./pipes/validation.pipe"
import { HashingService } from "./services/hashing.service";
import { RsaKeyManager } from "./utils/RsaKeyManager";
import { PrismaService } from "@/core/database/prisma.service";
import { CloudinaryService } from "./services/cloudinary.service";
import { CloudinaryProvider } from "@/core/configs/cloudinary.config";
// import { RedisService } from "src/core/cache/redis.service";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { RedisService } from "@/core/cache/redis.service";


const globalService = [ConfigService, HashingService, RsaKeyManager, PrismaService, CloudinaryService, RedisService]

// global module 
// every module can use its services without importing
@Global() // có/không có cũng được đối với APP_FILTER
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // load used to get information (EX in the ConfigService: this.configService.get('port'); )
      load: [envConfig],
    }),
    // Cấu hình CLS (Context Local Storage) để lưu trữ context cho mỗi request
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST');
        const port = Number(configService.get('REDIS_PORT'));
        
        const redisUri = `redis://${host}:${port}`;
        return {
          stores: [
            createKeyv(redisUri),
          ],
          ttl: 60 * 60 * 1000, // 1 hour
        }
      },
    })
  ],
  providers: [
    CloudinaryProvider,
    // phải export thì mới inject nơi khác
    ...globalService,
    // không cần export vẫn hoạt động toàn cục
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ApiValidationPipe,
    },
    {
      provide: "LOGGER_SERVICE",
      useClass: Logger
    }
  ],
  exports: [
    ...globalService,
    "LOGGER_SERVICE"
  ]
})

export class GlobalModule {}