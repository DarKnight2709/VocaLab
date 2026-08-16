export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    // youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    if (hostname === 'youtube.com') {
      // /watch?v=VIDEO_ID
      const v = parsed.searchParams.get('v');
      if (v) return v;

      // /shorts/VIDEO_ID or /embed/VIDEO_ID
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (
        pathParts.length >= 2 &&
        (pathParts[0] === 'shorts' || pathParts[0] === 'embed')
      ) {
        return pathParts[1];
      }
    }

    return null;
  } catch {
    // URL parsing failed — treat the input as a raw video ID
    return url || null;
  }
}
