import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { GetConversationsResponseDto, GetMessagesResponseDto } from './dto/messages-response.dto';

@ApiTags('messages')
@Controller('messages')
@IsProtected()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng đã từng nhắn tin (Dashboard)' })
  async getUsers(@CurrentUser() user: any): Promise<ResponseInterceptor<GetConversationsResponseDto>> {
    const result = await this.messagesService.getConversations(user.id);
    return {
      data: result
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy tin nhắn giữa tôi và người này' })
  async getMessages(@CurrentUser() user: any, @Param('id') friendId: string): Promise<ResponseInterceptor<GetMessagesResponseDto>> {
    const result = await this.messagesService.getMessages(user.id, friendId);
    return {
      data: result
    }
  }

}
