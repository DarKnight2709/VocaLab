import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRE_MEMBER_KEY,
  REQUIRE_PERMISSION_KEY,
  REQUIRE_OWNER_KEY,
} from '../../../common/decorators/group-auth.decorators';
import { GroupPermission } from '../../../common/enums/group-permission.enum';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { GroupChatService } from '../group-chat.service';

@Injectable()
export class GroupPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private groupChatService: GroupChatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const groupId = request.params.id;

    if (!groupId) {
      return true; // Nếu không có groupId trong param thì skip guard này
    }

    if (!user) {
      return false;
    }

    // 1. Kiểm tra sự tồn tại của nhóm
    const group = await this.groupChatService.getActiveGroupOrThrow(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException(ErrorCode.GROUP_NOT_FOUND_OR_INACTIVE);
    }

    // Gắn thông tin nhóm vào request để dùng lại ở UseCase nếu cần
    request.group = group;

    // 2. Find member once (replaces both isMember check and later find)
    const member = group.members.find((m) => m.userId === user.id);

    // 3. Check membership requirement
    const requireMember = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_MEMBER_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requirePermission = this.reflector.getAllAndOverride<GroupPermission>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireOwner = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If any check is required but user is not a member;
    if ((requireOwner || requireMember || requirePermission) && !member) {
      throw new ForbiddenException(ErrorCode.GROUP_MEMBER_FORBIDDEN);
    }

    // Check owner requirement first if requested
    if (requireOwner) {
      const isOwner = group.ownerId === user.id;
      if (!isOwner) {
        throw new ForbiddenException(ErrorCode.ONLY_OWNER_ALLOWED);
      }
      return true;
    }

    // 4. Check specific permission if required
    if (requirePermission) {
      // Owner always has all permissions
      const isOwner = group.ownerId === user.id;
      if (isOwner) return true;

      // Get user permissions based on their role
      const userPermissions =
        group.rolePermissions
          ?.filter((rp) => rp.role === member!.role)
          .map((rp) => rp.permission.name) || [];

      if (!userPermissions.includes(requirePermission)) {
        throw new ForbiddenException(ErrorCode.PERMISSION_DENIED);
      }
    }

    return true;
  }
}
