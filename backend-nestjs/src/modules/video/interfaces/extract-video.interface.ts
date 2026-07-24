export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface VideoInfo {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
}

export interface ExtractVideoResponse {
  transcript: TranscriptItem[];
  videoInfo: VideoInfo | null;
}