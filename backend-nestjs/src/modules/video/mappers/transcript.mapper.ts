import { TranscriptItemDto } from "@/modules/video/dto/extract-video-response.dto";
import { SerpApiTranscriptItem } from "@/modules/video/validation/SerpApiTranscriptSchema";


export function formatTranscript(rawTranscript: SerpApiTranscriptItem[]): TranscriptItemDto[] {
    const formattedTranscript: TranscriptItemDto[] = [];

    const cleanText = (raw: string) =>
      raw
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();

    const hasPunctuation = rawTranscript.some((item) =>
      /[.!?]/.test(item.snippet),
    );

    let groupText = '';
    let groupStart = 0;
    let groupDurationEnd = 0;

    const flushGroup = () => {
      const trimmed = groupText.trim();
      if (trimmed) {
        formattedTranscript.push({
          text: trimmed,
          start: groupStart,
          duration: groupDurationEnd - groupStart,
        });
      }
      groupText = '';
    };

    for (const item of rawTranscript) {
      const text = cleanText(item.snippet);
      if (!text) continue;

      // fall back to start_ms when end_ms is absent (SerpAPI omits it for some videos)
      const chunkEnd = item.end_ms ?? item.start_ms;

      if (!hasPunctuation) {
        if (groupText === '') groupStart = item.start_ms;
        groupText += (groupText ? ' ' : '') + text;
        groupDurationEnd = chunkEnd;

        const wordCount = groupText.split(/\s+/).length;
        if (wordCount >= 15) {
          flushGroup();
        }
        continue;
      }

      if (groupText === '') groupStart = item.start_ms;
      groupText += (groupText ? ' ' : '') + text;
      groupDurationEnd = chunkEnd;

      const wordCount = groupText.split(/\s+/).length;
      const endsWithPunctuation = /[.!?]["']?$/.test(groupText.trim());

      if ((endsWithPunctuation && wordCount >= 10) || wordCount >= 30) {
        flushGroup();
      }
    }

    flushGroup();

    return formattedTranscript;
  }

 