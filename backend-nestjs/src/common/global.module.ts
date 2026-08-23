import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClsModule } from "nestjs-cls";
import envConfig from "@/core/configs/env.config";
import { ConfigService } from "./services/config.service";
import { HashingService } from "./services/hashing.service";
import { RsaKeyManager } from "./utils/RsaKeyManager";
import { PrismaService } from "@/core/database/prisma.service";
import { CloudinaryService } from "./services/cloudinary.service";
import { CloudinaryProvider } from "@/core/configs/cloudinary.config";
// import { RedisService } from "src/core/cache/redis.service";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { RedisService } from "@/core/cache/redis.service";
import { S3Provider } from "@/core/configs/s3.config";
import { S3Service } from "./services/s3.service";
import { REDIS_CLIENT, RedisProvider } from "@/core/redis/redis.provider";

const globalService = [ConfigService, HashingService, RsaKeyManager, PrismaService, CloudinaryService, RedisService, S3Service];

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
    S3Provider,
    RedisProvider,
    // phải export thì mới inject nơi khác
    ...globalService,
  ],
  exports: [
    ...globalService,
    REDIS_CLIENT,
  ]
})

export class GlobalModule {}