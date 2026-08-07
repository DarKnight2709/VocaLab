import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel, ReminderType, VisibilityScope } from '@prisma/client';

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

export class UpdateGroupsTabVisibilityDto {
  @ApiProperty({ enum: VisibilityScope, example: VisibilityScope.EVERYONE })
  @IsEnum(VisibilityScope)
  @IsNotEmpty()
  groupsTabVisibility!: VisibilityScope;
}

export class UpdateNotificationSettingDto {
  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  chatMessages?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  comments?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  upvotes?: NotificationChannel;

  @IsEnum(NotificationChannel)
  @IsOptional()
  newFollowers?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  activityFromFollowed?: NotificationChannel;
}
export class UpdateChatMessagesDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  chatMessages!: NotificationChannel;
}

export class UpdateCommentsDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  comments!: NotificationChannel;
}
export class UpdateUpvotesDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  upvotes!: NotificationChannel;
}
export class UpdateNewFollowersDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  newFollowers!: NotificationChannel;
}
export class UpdateActivityFromFollowedDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  activityFromFollowed!: NotificationChannel;
}

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ReminderType })
  @IsEnum(ReminderType)
  type!: ReminderType;

  @ApiPropertyOptional({ description: 'Minutes from midnight (0-1439)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  triggerTime?: number;

  @ApiPropertyOptional({ description: 'Start time in minutes from midnight' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  startTime?: number;

  @ApiPropertyOptional({ description: 'End time in minutes from midnight' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  endTime?: number;

  @ApiProperty({ type: [Number], description: '0-6 for Sun-Sat' })
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];
}
export class UpdateDailyGoalDto {
  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(5)
  @Max(60)
  dailyGoalMinutes!: number;
}
