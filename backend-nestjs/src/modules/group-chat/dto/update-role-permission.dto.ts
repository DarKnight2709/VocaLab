import { IsEnum, IsString, IsBoolean } from 'class-validator';
import { MemberRole } from '@prisma/client';
import { GroupPermission } from '../../../common/enums/group-permission.enum';

export class UpdateRolePermissionDto {
  @IsEnum(MemberRole)
  role!: MemberRole;

  @IsString()
  permissionId!: string;

  @IsBoolean()
  isEnabled!: boolean;
}
