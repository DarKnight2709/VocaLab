import type { VideoData } from '../video.repository';
import type { Video } from '@prisma/client';

export const VIDEO_REPOSITORY = 'IVideoRepository';

export interface IVideoRepository {
  findByYoutubeId(youtubeId: string): Promise<Video | null>;
  upsert(data: VideoData): Promise<void>;
}
