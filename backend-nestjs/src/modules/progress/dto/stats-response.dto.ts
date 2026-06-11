import { ApiProperty } from '@nestjs/swagger';

export class WeekActivityDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  minutes!: number;
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
}
