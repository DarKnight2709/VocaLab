import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import compression from 'compression';
import { UsersModule } from './modules/users/users.module';
import { MessagesModule } from './modules/messages/messages.module';
import { DirectChatModule } from './modules/direct-chat/direct-chat.module';
import { GroupChatModule } from './modules/group-chat/group-chat.module';
import { GlobalModule } from './common/global.module';
import { BlogModule } from './modules/blog/blog.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtGuard } from './common/guards/jwt-auth.guard';
import { UploadModule } from './modules/upload/upload.module';
import helmet from 'helmet';
import { ScheduleModule } from '@nestjs/schedule';
import { SettingModule } from './modules/setting/setting.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from './common/services/config.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { NotificationsModule } from './modules/notifications/notifications.module';



@Module({
  imports: [
    AuthModule,
    UsersModule,
    MessagesModule,
    DirectChatModule,
    GroupChatModule,
    GlobalModule,
    BlogModule,
    GrammarModule,
    VocabularyModule,
    UploadModule,
    ScheduleModule.forRoot(),
    SettingModule,
    NotificationsModule,
    // tell BullMQ how to connect to Redis
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues', // The path where you can access the UI
      adapter: ExpressAdapter,
    }),
  ],
  controllers: [],
  providers: [
    // dùng để serialize response data (loại bỏ các field không cần thiết - các field có decorator @Exclude())
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditContextInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet(), compression(), LoggerMiddleware).forRoutes('*');
  }
}
