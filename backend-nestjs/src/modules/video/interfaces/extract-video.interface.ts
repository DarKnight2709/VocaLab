export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

export interface ChapterItem {
  title: string;
  start: number;
  end: number;
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
  chapters: ChapterItem[];
  videoInfo: VideoInfo | null;
}