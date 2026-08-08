import type { RequestUser } from '@/common/types';
import { Controller, Get, Param, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';

import {
  ConversationListItem,
  GroupsResponseDto,
  MessageWithDetails,
} from './dto/messages-response.dto';
import { UserResponse } from '../users/dto/users-response.dto';

@ApiTags('messages')
@Controller('messages')
@IsProtected()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('users')
  @SerializeOptions({
    type: ConversationListItem,
    excludeExtraneousValues: true,
  })
  @ApiOperation({
    summary: 'Lấy danh sách người dùng đã từng nhắn tin (Dashboard)',
  })
  async getConversations(
    @CurrentUser() user: RequestUser,
  ): Promise<ConversationListItem[]> {
    const result = await this.messagesService.getConversations(user.id);
    return result;
  }

  @Get('friends')
  @SerializeOptions({ type: UserResponse, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy danh sách bạn bè (mutual follow)' })
  async getFriends(@CurrentUser() user: RequestUser): Promise<UserResponse[]> {
    const result = await this.messagesService.getFriends(user.id);
    return result;
  }

  @Get('groups')
  @SerializeOptions({
    type: GroupsResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Lấy danh sách nhóm đã tham gia' })
  async getGroups(
    @CurrentUser() user: RequestUser,
  ): Promise<GroupsResponseDto[]> {
    const result = await this.messagesService.getGroups(user.id);
    return result;
  }

  @Get(':id')
  @SerializeOptions({
    type: MessageWithDetails,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Lấy tin nhắn giữa tôi và người này' })
  async getMessages(
    @CurrentUser() user: RequestUser,
    @Param('id') friendId: string,
  ): Promise<MessageWithDetails[]> {
    const result = await this.messagesService.getMessages(user.id, friendId);
    return result;
  }
}
