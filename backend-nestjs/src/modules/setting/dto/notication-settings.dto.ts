import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';


export class UpdateNotificationSettingDto {
  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  chatMessages?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  commentsOnPosts?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  upvotes?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  repliesToComments?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationChannel })
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

export class UpdateCommentsOnPostsDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  commentsOnPosts!: NotificationChannel;
}

export class UpdateUpvotesDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  upvotes!: NotificationChannel;
}

export class UpdateRepliesToCommentsDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  repliesToComments!: NotificationChannel;
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


export class NotificationSettingDto {
  @ApiProperty({ enum: NotificationChannel })
  chatMessages!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  commentsOnPosts!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  upvotes!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  repliesToComments!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  newFollowers!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  activityFromFollowed!: NotificationChannel;

  @ApiProperty()
  updatedAt!: Date;
}
