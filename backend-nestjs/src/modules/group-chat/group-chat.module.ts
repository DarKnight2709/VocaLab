import { Module } from '@nestjs/common';
import { GroupChatGateway } from './group-chat.gateway';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './services/group-chat.service';
import { GroupRepository } from './repositories/group.repository';
import { CreateGroupUseCase } from './use-cases/create-group.usecase';
import { JoinGroupUseCase } from './use-cases/join-group.usecase';
import { LeaveGroupUseCase } from './use-cases/leave-group.usecase';
import { UpdateGroupUseCase } from './use-cases/update-group.usecase';
import { AddMemberUseCase } from './use-cases/add-member.usecase';
import { RemoveMemberUseCase } from './use-cases/remove-member.usecase';
import { ChangeRoleUseCase } from './use-cases/change-role.usecase';
import { MessagesModule } from '../messages/messages.module';
import { IGROUP_REPOSITORY } from './domain/interfaces/group-repository.interface';

@Module({
  imports: [
    MessagesModule
  ],
  controllers: [GroupChatController],
  providers: [
    GroupChatGateway,
    GroupChatService,
    {
      provide: IGROUP_REPOSITORY,
      useClass: GroupRepository,
    },
    CreateGroupUseCase,
    JoinGroupUseCase,
    LeaveGroupUseCase,
    UpdateGroupUseCase,
    AddMemberUseCase,
    RemoveMemberUseCase,
    ChangeRoleUseCase,
  ],
  exports: [GroupChatGateway, IGROUP_REPOSITORY],
})
export class GroupChatModule {}
