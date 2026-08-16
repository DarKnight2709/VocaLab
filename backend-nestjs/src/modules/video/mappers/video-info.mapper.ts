import { VideoInfoRes } from '@/modules/video/validation/VideoInfoResponseSchema';

export function formatVideoInfo(videoInfoRes: VideoInfoRes) {
  if (!videoInfoRes.items || videoInfoRes.items.length === 0) {
    return null;
  }

  const item = videoInfoRes.items[0];
  const snippet = item.snippet;
  const statistics = item.statistics;
  const contentDetails = item.contentDetails;

  return {
    title: snippet?.title || '',
    description: snippet?.description || '',
    channelTitle: snippet?.channelTitle || '',
    publishedAt: snippet?.publishedAt || '',
    thumbnail:
      snippet?.thumbnails?.maxres?.url ||
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.default?.url ||
      '',
    duration: contentDetails?.duration || '',
    viewCount: statistics?.viewCount || '0',
  };
}
