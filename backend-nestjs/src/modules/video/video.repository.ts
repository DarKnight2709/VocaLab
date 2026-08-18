import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Prisma, Video } from '@prisma/client';
import { TranscriptItemDto, ChapterItemDto } from './dto/extract-video-response.dto';
import type { IVideoRepository } from './contracts/video-repository.interface';

export interface VideoData {
  youtubeId: string;
  userId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  transcript: TranscriptItemDto[];
  chapters: ChapterItemDto[];
}

@Injectable()
export class VideoRepository implements IVideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByYoutubeId(youtubeId: string): Promise<Video | null> {
    return this.prisma.video.findUnique({
      where: { youtubeId },
    });
  }

  async upsert(data: VideoData): Promise<void> {
    await this.prisma.video.upsert({
      where: { youtubeId: data.youtubeId },
      update: {
        title: data.title,
        viewCount: data.viewCount,
        transcript: data.transcript as unknown as Prisma.InputJsonValue,
        chapters: data.chapters as unknown as Prisma.InputJsonValue,
      },
      create: {
        youtubeId: data.youtubeId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        channelTitle: data.channelTitle,
        publishedAt: new Date(data.publishedAt),
        thumbnail: data.thumbnail,
        duration: data.duration,
        viewCount: data.viewCount,
        transcript: data.transcript as unknown as Prisma.InputJsonValue,
        chapters: data.chapters as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
