import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VisibilityScope } from '@prisma/client';

export class UpdateAllowFollowDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  allowFollow!: boolean;
}

export class UpdateMessageScopeDto {
  @ApiProperty({ enum: VisibilityScope, example: VisibilityScope.EVERYONE })
  @IsEnum(VisibilityScope)
  @IsNotEmpty()
  messageScope!: VisibilityScope;
}

export class UpdateFollowersTabVisibilityDto {
  @ApiProperty({ enum: VisibilityScope, example: VisibilityScope.EVERYONE })
  @IsEnum(VisibilityScope)
  @IsNotEmpty()
  followersTabVisibility!: VisibilityScope;
}

export class UpdateFollowingTabVisibilityDto {
  @ApiProperty({ enum: VisibilityScope, example: VisibilityScope.EVERYONE })
  @IsEnum(VisibilityScope)
  @IsNotEmpty()
  followingTabVisibility!: VisibilityScope;
}

export class UpdateFriendTabVisibilityDto {
  @ApiProperty({ enum: VisibilityScope, example: VisibilityScope.EVERYONE })
  @IsEnum(VisibilityScope)
  @IsNotEmpty()
  friendTabVisibility!: VisibilityScope;
}
