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
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtGuard } from './common/guards/jwt-auth.guard';
import helmet from 'helmet';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MessagesModule,
    DirectChatModule,
    GroupChatModule,
    GlobalModule,
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
    }
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
