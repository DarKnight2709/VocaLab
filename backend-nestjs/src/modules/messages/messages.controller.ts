import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './services/messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsProtected } from 'src/common/decorators/protected.decorator';

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

  @Post('upload')
  @ApiOperation({ summary: 'Upload file đính kèm' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.messagesService.uploadFile(file);
  }
}
