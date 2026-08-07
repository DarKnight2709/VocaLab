import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TranscriptItemDto {
  @ApiProperty({ example: 'Hello world' })
  @Expose()
  text!: string;

  @ApiProperty({ example: 0.5 })
  @Expose()
  start!: number;

  @ApiProperty({ example: 1.2 })
  @Expose()
  duration!: number;
}

export class ChapterItemDto {
  @ApiProperty({ example: 'Introduction' })
  @Expose()
  title!: string;

  @ApiProperty({ example: 0 })
  @Expose()
  start!: number;

  @ApiProperty({ example: 120 })
  @Expose()
  end!: number;
}

export class VideoInfoDto {
  @ApiProperty({ example: 'My Video Title' })
  @Expose()
  title!: string;

  @ApiProperty({ example: 'A great video about...' })
  @Expose()
  description!: string;

  @ApiProperty({ example: 'My Channel' })
  @Expose()
  channelTitle!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @Expose()
  publishedAt!: string;

  @ApiProperty({ example: 'https://img.youtube.com/vi/abc/hqdefault.jpg' })
  @Expose()
  thumbnail!: string;

  @ApiProperty({ example: 'PT5M30S' })
  @Expose()
  duration!: string;

  @ApiProperty({ example: '12345' })
  @Expose()
  viewCount!: string;
}

export class ExtractVideoResponseDto {
  @ApiProperty({ type: [TranscriptItemDto] })
  @Expose()
  @Type(() => TranscriptItemDto)
  transcript!: TranscriptItemDto[];

  @ApiProperty({ type: [ChapterItemDto] })
  @Expose()
  @Type(() => ChapterItemDto)
  chapters!: ChapterItemDto[];

  @ApiPropertyOptional({ type: VideoInfoDto, nullable: true })
  @Expose()
  @Type(() => VideoInfoDto)
  videoInfo!: VideoInfoDto | null;
}
