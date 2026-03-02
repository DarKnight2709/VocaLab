import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IGROUP_REPOSITORY, IGroupRepository } from '../domain/interfaces/group-repository.interface';
import { REQUIRE_MEMBER_KEY, REQUIRE_PERMISSION_KEY } from '../decorators/group-auth.decorators';
import { GroupPermission } from '../../../common/enums/group-permission.enum';

@Injectable()
export class GroupPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
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
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    // Gắn thông tin nhóm vào request để dùng lại ở UseCase nếu cần
    request.group = group;

    // 2. Kiểm tra yêu cầu membership
    const requireMember = this.reflector.getAllAndOverride<boolean>(REQUIRE_MEMBER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isMember = await this.groupRepository.isMember(groupId, user.id);
    if (requireMember && !isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

    // 3. Kiểm tra yêu cầu Permission cụ thể
    const requirePermission = this.reflector.getAllAndOverride<GroupPermission>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requirePermission) {
      // Lấy role của user trong nhóm
      const member = group.members.find(m => m.userId === user.id);
      
      if (!member) {
        throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
      }

      // Luôn cho phép Owner
      const isOwner = group.ownerId === user.id;
      if (isOwner) return true;

      // Lấy danh sách permission ứng với role của member
      const userPermissions = group.rolePermissions
        ?.filter(rp => rp.role === member.role)
        .map(rp => rp.permission.name) || [];

      if (!userPermissions.includes(requirePermission)) {
        throw new ForbiddenException(`Bạn không có quyền thực hiện hành động này (Yêu cầu: ${requirePermission})`);
      }
    }

    return true;
  }
}
