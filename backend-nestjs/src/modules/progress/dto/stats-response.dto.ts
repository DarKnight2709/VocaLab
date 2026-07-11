import { ApiProperty } from '@nestjs/swagger';

export class WeekActivityDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  minutes!: number;
}

export class HistoryDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  cardsReviewed!: number;

  @ApiProperty()
  cardsAdded!: number;

  @ApiProperty()
  cardsUpdated!: number;

  @ApiProperty()
  cardsDeleted!: number;
}

export class StatsResponseDto {
  @ApiProperty()
  todayMinutes!: number;

  @ApiProperty()
  dailyGoalMinutes!: number;

  @ApiProperty()
  weeklyAverageMinutes!: number;

  @ApiProperty({ type: [WeekActivityDto] })
  weeklyActivity!: WeekActivityDto[];

  @ApiProperty()
  currentStreak!: number;

  @ApiProperty()
  maxStreak!: number;

  @ApiProperty()
  totalMinutes!: number;

  @ApiProperty()
  totalDays!: number;

  @ApiProperty({ type: [HistoryDto] })
  history!: HistoryDto[];

  // --- Card Mastery Stats ---

  @ApiProperty()
  totalCards!: number;

  @ApiProperty()
  masteredCards!: number;

  @ApiProperty()
  learningCards!: number;

  @ApiProperty()
  newCards!: number;
}

export class CollectionStatsResponseDto {
  @ApiProperty({ type: [HistoryDto] })
  history!: HistoryDto[];
}
