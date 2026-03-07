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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GroupChatService } from './services/group-chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GroupPermissionGuard } from './guards/group-permission.guard';
import {
  IsOwner,
  RequireGroupMember,
  RequireGroupPermission,
} from '../../common/decorators/group-auth.decorators';
import { GroupPermission } from '../../common/enums/group-permission.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo nhóm mới' })
  async createGroup(
    @CurrentUser() user: any,
    @Body() createDto: CreateGroupDto,
  ) {
    return this.groupChatService.createGroup(user.id, createDto);
  }

  @Get('getGroups')
  @ApiOperation({ summary: 'Lấy danh sách nhóm đã tham gia' })
  async getGroups(@CurrentUser() user: any) {
    return this.groupChatService.getGroups(user.id);
  }

  @Get(':id')
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Xem thông tin nhóm' })
  async getInfoGroup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getInfoGroup(id);
  }

  @Patch('update/:id')
  @RequireGroupPermission(GroupPermission.UPDATE_GROUP_INFO)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Sửa thông tin nhóm' })
  async updateGroup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateGroupDto,
  ) {
    return this.groupChatService.updateGroup(id, user.id, updateDto);
  }

  @Delete('delete/:id')
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Rời nhóm hoặc xóa nhóm' })
  async deleteGroup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.deleteGroup(id, user.id);
  }

  @Post('leave/:id')
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Rời nhóm ' })
  async leaveGroup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.leaveGroup(id, user.id);
  }

  @Patch(':id/transferOwnership')
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Chuyển quyền sở hữu nhóm' })
  async transferOwnership(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.groupChatService.transferOwnership(id, user.id, dto.newOwnerId);
  }

  @Get(':id/messages')
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Lấy tin nhắn trong nhóm' })
  async getGroupMessages(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getGroupMessages(id);
  }

  @Post(':id/addMembers')
  @RequireGroupPermission(GroupPermission.ADD_MEMBER)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Thêm thành viên nhóm' })
  async addMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.groupChatService.addMember(id, user.id, addMemberDto);
  }

  @Get(':id/getMembers')
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Lấy danh sách thành viên' })
  async getMembers(@CurrentUser() user: any, @Param('id') id: string) {
    return this.groupChatService.getMembers(id);
  }

  @Delete(':id/deleteMembers/:memberId')
  @RequireGroupPermission(GroupPermission.REMOVE_MEMBER)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Xóa thành viên nhóm' })
  async deleteMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.groupChatService.deleteMember(id, user.id, memberId);
  }

  @Patch(':id/changeRole/:memberId')
  @RequireGroupPermission(GroupPermission.MANAGE_ROLES)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Đổi role thành viên' })
  async changeRole(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    return this.groupChatService.changeRole(
      id,
      user.id,
      memberId,
      changeRoleDto,
    );
  }
}
