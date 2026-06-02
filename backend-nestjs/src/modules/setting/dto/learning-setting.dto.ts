import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsArray,
  IsEnum,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ReminderType } from '@prisma/client';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  title!: string;

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

export class ReminderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ReminderType })
  type!: ReminderType;

  @ApiProperty()
  isEnabled!: boolean;

  @ApiPropertyOptional()
  triggerTime!: number | null;

  @ApiPropertyOptional()
  startTime!: number | null;

  @ApiPropertyOptional()
  endTime!: number | null;

  @ApiProperty({ type: [Number] })
  daysOfWeek!: number[];

  @ApiProperty()
  createdAt!: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}

export class ReminderListResponseDto {
  @ApiProperty({ type: [ReminderResponseDto] })
  reminders!: ReminderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class ReminderDeleteResponseDto {
  @ApiProperty()
  id!: string;
}
