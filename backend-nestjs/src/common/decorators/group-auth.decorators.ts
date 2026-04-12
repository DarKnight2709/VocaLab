import { SetMetadata } from '@nestjs/common';
import { GroupPermission } from '../enums/group-permission.enum';

export const REQUIRE_MEMBER_KEY = 'requireGroupMember';
export const REQUIRE_PERMISSION_KEY = 'requireGroupPermission';
export const REQUIRE_OWNER_KEY = 'requireGroupOwner';

/**
 * Decorator yêu cầu user phải là thành viên của nhóm
 */
export const RequireGroupMember = () => SetMetadata(REQUIRE_MEMBER_KEY, true);

/**
 * Decorator yêu cầu user phải là chủ sở hữu của nhóm
 */
export const IsOwner = () => SetMetadata(REQUIRE_OWNER_KEY, true);

/**
 * Decorator yêu cầu user phải có quyền cụ thể trong nhóm (VD: GroupPermission.UPDATE_GROUP_NAME)
 */
export const RequireGroupPermission = (permission: GroupPermission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
