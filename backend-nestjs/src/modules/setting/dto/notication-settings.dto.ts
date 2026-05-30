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


export class NotificationSettingDto {
  @ApiProperty({ enum: NotificationChannel })
  chatMessages!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  comments!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  upvotes!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  newFollowers!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  activityFromFollowed!: NotificationChannel;

  @ApiProperty()
  updatedAt!: Date;
}
