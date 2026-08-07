import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationChannel, ReminderType } from "@prisma/client";
import { Expose, Type } from "class-transformer";


export class NotificationSettingDto {
  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  chatMessages!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  comments!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  upvotes!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  newFollowers!: NotificationChannel;

  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  activityFromFollowed!: NotificationChannel;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}

export class ReminderResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  description!: string | null;

  @ApiProperty({ enum: ReminderType })
  @Expose()
  type!: ReminderType;

  @ApiProperty()
  @Expose()
  isEnabled!: boolean;

  @ApiPropertyOptional()
  @Expose()
  triggerTime!: number | null;

  @ApiPropertyOptional()
  @Expose()
  startTime!: number | null;

  @ApiPropertyOptional()
  @Expose()
  endTime!: number | null;

  @ApiProperty({ type: [Number] })
  @Expose()
  daysOfWeek!: number[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  @Expose()
  page!: number;

  @ApiProperty({ example: 10 })
  @Expose()
  limit!: number;

  @ApiProperty({ example: 100 })
  @Expose()
  total!: number;

  @ApiProperty({ example: 10 })
  @Expose()
  totalPages!: number;
}

export class ReminderListResponseDto {
  @ApiProperty({ type: [ReminderResponseDto] })
  @Expose()
  @Type(() => ReminderResponseDto)
  reminders!: ReminderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class ReminderDeleteResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;
}

export class DailyGoalResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;
  
  @ApiProperty()
  @Expose()
  dailyGoalMinutes!: number;
}