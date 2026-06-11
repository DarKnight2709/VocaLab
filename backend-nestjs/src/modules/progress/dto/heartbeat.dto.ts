import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class HeartbeatDto {
  @ApiProperty({
    description: 'Seconds to add to the study time (e.g., 30s)',
    example: 30,
    minimum: 5,
    maximum: 60,
  })
  @IsInt()
  @Min(5)
  @Max(60)
  seconds!: number;
}
