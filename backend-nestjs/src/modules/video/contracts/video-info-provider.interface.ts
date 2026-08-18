import type { VideoInfoRes } from '../validation/VideoInfoResponseSchema';

export const VIDEO_INFO_PROVIDER = 'IVideoInfoProvider';

export interface IVideoInfoProvider {
  getVideoInfo(videoId: string): Promise<VideoInfoRes>;
}
