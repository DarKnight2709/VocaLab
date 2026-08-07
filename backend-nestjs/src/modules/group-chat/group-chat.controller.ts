import type { RequestUser } from '@/common/types';
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GroupChatService } from './group-chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GroupPermissionGuard } from './guards/group-permission.guard';
import {
  IsOwner,
  RequireGroupMember,
  RequireGroupPermission,
} from '../../common/decorators/group-auth.decorators';
import { GroupPermission } from '../../common/enums/group-permission.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateGroupVisibilityDto } from './dto/update-group-visibility.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  CreateGroupResponseDto,
  GroupDetailDto,
  GroupMemberDto,
  PermissionDto,
} from './dto/group-chat-response.dto';
import { DeleteResponseDto } from '../blog/dto/blog-response.dto';
import { MessageWithDetails } from '../messages/dto/messages-response.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @Post('create')
  @SerializeOptions({ type: CreateGroupResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Tạo nhóm mới' })
  async createGroup(
    @CurrentUser() user: RequestUser,
    @Body() createDto: CreateGroupDto,
  ): Promise<CreateGroupResponseDto> {
    const result = await this.groupChatService.createGroup(user.id, createDto);
    return result;
  }

  @Get(':id')
  @SerializeOptions({ type: GroupDetailDto, excludeExtraneousValues: true })
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Xem thông tin nhóm' })
  async getInfoGroup(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<GroupDetailDto> {
    const result = await this.groupChatService.getInfoGroup(id);
    return result;
  }

  @Patch('update/:id')
  @SerializeOptions({ type: CreateGroupResponseDto, excludeExtraneousValues: true })
  @RequireGroupPermission(GroupPermission.UPDATE_GROUP_INFO)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Sửa thông tin nhóm' })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroup(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateGroupDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateGroupResponseDto> {
    const result = await this.groupChatService.updateGroup(
      id,
      user.id,
      updateDto,
      file,
    );
    return result;
  }

  @Patch(':id/visibility')
  @SerializeOptions({ type: CreateGroupResponseDto, excludeExtraneousValues: true })
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Update group public visibility' })
  async updateGroupVisibility(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateGroupVisibilityDto,
  ): Promise<CreateGroupResponseDto> {
    const result = await this.groupChatService.updateGroupVisibility(
      id,
      user.id,
      dto.isPublic,
    );
    return result;
  }

  @Delete('delete/:id')
  @SerializeOptions({ type: DeleteResponseDto, excludeExtraneousValues: true })
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Rời nhóm hoặc xóa nhóm' })
  async deleteGroup(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<DeleteResponseDto> {
    const result = await this.groupChatService.deleteGroup(id, user.id);
    return result;
  }

  @Post('leave/:id')
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Rời nhóm ' })
  async leaveGroup(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.groupChatService.leaveGroup(id, user.id);
  }

  @Post('join/:id')
  @ApiOperation({ summary: 'Tham gia nhóm ' })
  async joinGroup(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.groupChatService.joinGroup(id, user.id);
  }

  @Patch(':id/transferOwnership')
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Chuyển quyền sở hữu nhóm' })
  async transferOwnership(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: TransferOwnershipDto,
  ): Promise<void> {
    await this.groupChatService.transferOwnership(
      id,
      user.id,
      dto.newOwnerId,
    );
  }

  @Get(':id/messages')
  @SerializeOptions({ type: MessageWithDetails, excludeExtraneousValues: true })
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Lấy tin nhắn trong nhóm' })
  async getGroupMessages(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<MessageWithDetails[]> {
    const result = await this.groupChatService.getGroupMessages(id);
    return result;
  }

  @Post(':id/addMembers')
  @RequireGroupPermission(GroupPermission.ADD_MEMBER)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Thêm thành viên nhóm' })
  async addMember(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<void> {
    await this.groupChatService.addMember(
      id,
      user.id,
      addMemberDto,
    );
  }

  @Get(':id/getMembers')
  @SerializeOptions({ type: GroupMemberDto, excludeExtraneousValues: true })
  @RequireGroupMember()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Lấy danh sách thành viên' })
  async getMembers(
    @Param('id') id: string,
  ): Promise<GroupMemberDto[]> {
    const result = await this.groupChatService.getMembers(id);
    return result;
  }

  @Delete(':id/deleteMembers/:memberId')
  @RequireGroupPermission(GroupPermission.REMOVE_MEMBER)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Xóa thành viên nhóm' })
  async deleteMember(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    await this.groupChatService.deleteMember(
      id,
      user.id,
      memberId,
    );
  }

  @Patch(':id/changeRole/:memberId')
  @IsOwner()
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Đổi role thành viên' })
  async changeRole(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ): Promise<void> {
    await this.groupChatService.changeRole(
      id,
      user.id,
      memberId,
      changeRoleDto,
    );
  }

  @Patch(':id/rolePermissions')
  @RequireGroupPermission(GroupPermission.UPDATE_ROLE_PERMISSION)
  @UseGuards(GroupPermissionGuard)
  @ApiOperation({ summary: 'Cập nhật phân quyền của một role trong nhóm' })
  async updateRolePermission(
    @Param('id') id: string,
    @Body() updateDto: UpdateRolePermissionDto,
  ): Promise<void> {
    await this.groupChatService.updateRolePermission(
      id,
      updateDto,
    );
  }

  @Get('permissions/all')
  @SerializeOptions({ type: PermissionDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy danh sách tất cả các quyền trong hệ thống' })
  async getAvailablePermissions(): Promise<PermissionDto[]> {
    const result = await this.groupChatService.getAvailablePermissions();
    return result;
  }
}
