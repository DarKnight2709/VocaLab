import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WeekActivityDto {
  @ApiProperty()
  @Expose()
  date!: string;

  @ApiProperty()
  @Expose()
  minutes!: number;
}

export class HistoryDto {
  @ApiProperty()
  @Expose()
  date!: string;

  @ApiProperty()
  @Expose()
  count!: number;

  @ApiProperty()
  @Expose()
  cardsReviewed!: number;

  @ApiProperty()
  @Expose()
  cardsAdded!: number;

  @ApiProperty()
  @Expose()
  cardsUpdated!: number;

  @ApiProperty()
  @Expose()
  cardsDeleted!: number;
}

export class StatsResponseDto {
  @ApiProperty()
  @Expose()
  todayMinutes!: number;

  @ApiProperty()
  @Expose()
  dailyGoalMinutes!: number;

  @ApiProperty()
  @Expose()
  weeklyAverageMinutes!: number;

  @ApiProperty({ type: [WeekActivityDto] })
  @Expose()
  @Type(() => WeekActivityDto)
  weeklyActivity!: WeekActivityDto[];

  @ApiProperty()
  @Expose()
  currentStreak!: number;

  @ApiProperty()
  @Expose()
  maxStreak!: number;

  @ApiProperty()
  @Expose()
  totalMinutes!: number;

  @ApiProperty()
  @Expose()
  totalDays!: number;

  @ApiProperty({ type: [HistoryDto] })
  @Expose()
  @Type(() => HistoryDto)
  history!: HistoryDto[];

  // --- Card Mastery Stats ---

  @ApiProperty()
  @Expose()
  totalCards!: number;

  @ApiProperty()
  @Expose()
  masteredCards!: number;

  @ApiProperty()
  @Expose()
  learningCards!: number;

  @ApiProperty()
  @Expose()
  newCards!: number;
}

export class CollectionStatsResponseDto {
  @ApiProperty({ type: [HistoryDto] })
  @Expose()
  @Type(() => HistoryDto)
  history!: HistoryDto[];
}
