import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupChatService } from './services/group-chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo nhóm mới' })
  async createGroup(@CurrentUser() user: any, @Body() createDto: CreateGroupDto) {
    return this.groupChatService.createGroup(user.id, createDto);
  }

  @Get('getGroups')
  @ApiOperation({ summary: 'Lấy danh sách nhóm đã tham gia' })
  async getGroups(@CurrentUser() user: any) {
    return this.groupChatService.getGroups(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem thông tin nhóm' })
  async getInfoGroup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getInfoGroup(id, user.id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Sửa thông tin nhóm' })
  async updateGroup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateGroupDto,
  ) {
    return this.groupChatService.updateGroup(id, user.id, updateDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Rời nhóm hoặc xóa nhóm' })
  async deleteGroup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.deleteGroup(id, user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Lấy tin nhắn trong nhóm' })
  async getGroupMessages(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getGroupMessages(id, user.id);
  }

  @Post(':id/addMembers')
  @ApiOperation({ summary: 'Thêm thành viên nhóm' })
  async addMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.groupChatService.addMember(id, user.id, addMemberDto);
  }

  @Get(':id/getMembers')
  @ApiOperation({ summary: 'Lấy danh sách thành viên' })
  async getMembers(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getMembers(id, user.id);
  }

  @Delete(':id/deleteMembers/:memberId')
  @ApiOperation({ summary: 'Xóa thành viên nhóm' })
  async deleteMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.groupChatService.deleteMember(id, user.id, memberId);
  }

  @Patch(':id/changeRole/:memberId')
  @ApiOperation({ summary: 'Đổi role thành viên' })
  async changeRole(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    return this.groupChatService.changeRole(id, user.id, memberId, changeRoleDto);
  }
}

