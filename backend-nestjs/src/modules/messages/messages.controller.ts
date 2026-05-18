import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';

@ApiTags('messages')
@Controller('messages')
@IsProtected()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng đã từng nhắn tin (Dashboard)' })
  async getUsers(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy tin nhắn giữa tôi và người này' })
  async getMessages(@CurrentUser() user: any, @Param('id') friendId: string) {
    return this.messagesService.getMessages(user.id, friendId);
  }

}
