import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './services/user.service';
import { PrismaUserRepository } from './repositories/user.repository';
import { IUSER_REPOSITORY } from './domain/interfaces/user-repository.interface';


@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: IUSER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserService, IUSER_REPOSITORY],
})
export class UsersModule {}

