import { useState } from 'react';
import { Search, ListVideo } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/shared/hooks/useTranslation';


export const VideoPage = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleExtract = () => {
    if (!url) return;
    
    // Extract video ID from YouTube URL
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      setError(t('video.invalidYouTubeUrl'));
      return;
    }

    // Navigate to the extracted video page
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-[1200px] mx-auto gap-8">
      {/* Header & Input Section */}
      <div className="flex gap-3 w-full z-10 pt-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
            placeholder={t('video.pasteYouTubeUrl')}
            className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={handleExtract}
          disabled={!url}
          className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100 text-primary-foreground font-semibold rounded-2xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ListVideo className="w-5 h-5" />
          {t('video.extract')}
        </button>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive mt-[-10px]">
          {error}
        </div>
      )}
    </div>
  );
};
