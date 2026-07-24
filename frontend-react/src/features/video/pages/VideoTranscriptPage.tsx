import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlignLeft, Copy, CheckCircle2, ArrowLeft, Eye, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import YouTube from 'react-youtube';
import { useExtractVideo } from '../api/videoService';
import { Switch } from '@/shared/components/ui/switch';
import { useTranslation } from '@/shared/hooks/useTranslation';


const formatDuration = (isoStr: string) => {
  if (!isoStr) return '';
  const match = isoStr.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return isoStr;
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (m > 0) {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return `${s}s`;
};

export const ExtractedVideoPage = () => {
  const { t } = useTranslation();
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(true);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  
  const { mutate, data: response, isPending, error } = useExtractVideo();

  useEffect(() => {
    if (videoId) {
      mutate({ url: `https://www.youtube.com/watch?v=${videoId}` });
    }
  }, [videoId]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSentenceClick = (startMs: number) => {
    if (player) {
      player.seekTo(startMs / 1000, true);
      player.playVideo();
    }
  };

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
  };

  const transcript = response?.data?.transcript;
  const videoInfo = response?.data?.videoInfo;
  const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || (error ? t('video.failedToExtract') : null);

  // Syncing logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (player && isSyncing && transcript) {
      interval = setInterval(() => {
        const rawTimeMs = player.getCurrentTime() * 1000;
        // Add a 200ms lookahead so the text highlights slightly before/exactly as they speak
        const timeMs = rawTimeMs + 200;

        let newIndex = -1;
        for (let i = transcript.length - 1; i >= 0; i--) {
          if (transcript[i].start <= timeMs) {
            newIndex = i;
            break;
          }
        }
        setActiveLineIndex((prev) => prev !== newIndex ? newIndex : prev);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [player, isSyncing, transcript]);

  useEffect(() => {
    if (isSyncing && activeLineRef.current && transcriptContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, isSyncing]);

  return (
    <div className="h-full flex flex-col p-6 max-w-[1400px] mx-auto gap-6">

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          {errorMessage}
        </div>
      )}

      {/* Loading Skeleton */}
      {isPending && (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 animate-pulse">
          <div className="lg:w-[55%] w-full h-full bg-muted rounded-3xl" />
          <div className="lg:w-[45%] w-full h-full flex flex-col bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 flex gap-4 shrink-0">
              <div className="w-32 h-6 bg-muted rounded-lg" />
              <div className="w-16 h-6 bg-muted rounded-lg" />
            </div>
            <div className="p-6 space-y-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full h-16 bg-muted/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Area */}
      {transcript && !isPending && (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
          {/* YouTube Video Section */}
          <div className="w-full lg:w-[55%] h-full flex flex-col gap-4 overflow-y-auto pb-4 hide-scrollbar">
            <div className="rounded-3xl overflow-hidden shadow-md bg-black w-full aspect-video shrink-0">
              {videoId && (
                <YouTube
                  videoId={videoId}
                  onReady={onPlayerReady}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 0,
                    },
                  }}
                  className="w-full h-full"
                />
              )}
            </div>

            {videoInfo && (
              <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug">{videoInfo.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/90 font-semibold">{videoInfo.channelTitle}</span>
                  </div>
                  {videoInfo.duration && (
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDuration(videoInfo.duration)}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {isExpanded ? Number(videoInfo.viewCount).toLocaleString() : Intl.NumberFormat('en', { notation: 'compact' }).format(Number(videoInfo.viewCount))} {t('video.views')}
                  </span>
                  {videoInfo.publishedAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {isExpanded ? new Date(videoInfo.publishedAt).toLocaleDateString() : formatDistanceToNow(new Date(videoInfo.publishedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {videoInfo.description && (
                  <div className="mt-2 bg-muted/30 p-4 rounded-2xl">
                    <div className={`text-[15px] text-muted-foreground/90 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {videoInfo.description}
                    </div>
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-3 text-primary font-semibold text-sm flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {isExpanded ? (
                        <>{t('video.showLess')} <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>{t('video.showMore')} <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transcript Section */}
          <div className="w-full lg:w-[45%] h-full flex flex-col bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-card-foreground font-bold text-lg">
                <button 
                  onClick={() => navigate('/video')}
                  className="p-2 hover:bg-muted rounded-full transition-colors -ml-2"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <AlignLeft className="w-6 h-6 text-primary" />
                {t('video.transcript')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const fullText = transcript.map((l: any) => l.text).join('\n');
                    navigator.clipboard.writeText(fullText);
                    setIsCopiedAll(true);
                    setTimeout(() => setIsCopiedAll(false), 2000);
                  }}
                  title={t('video.copyEntireTranscript')}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {isCopiedAll 
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Copy className="w-4 h-4" />}
                </button>
                <div className="w-px h-5 bg-border"></div>
                <div title={isSyncing ? t('video.autoSyncOn') : t('video.autoSyncOff')} className="flex items-center cursor-pointer">
                  <Switch 
                    id="auto-sync" 
                    checked={isSyncing}
                    onCheckedChange={setIsSyncing}
                  />
                </div>
                <div className="w-px h-5 bg-border"></div>
                <div className="text-xs font-semibold px-3 py-1 text-primary">
                  {t('video.sentences', { count: transcript.length })}
                </div>
              </div>
            </div>

            <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-muted/5 custom-scrollbar">
              {transcript.map((line: any, idx: number) => {
                const isActive = idx === activeLineIndex;
                return (
                  <div 
                    key={idx} 
                    ref={isActive ? activeLineRef : null}
                    onClick={() => {
                      handleSentenceClick(line.start);
                    }}
                    className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer active:scale-[0.98] ${
                      isActive 
                        ? "bg-gray-200 dark:bg-zinc-700 border-transparent" 
                        : "bg-card border-border/40 hover:bg-muted/50 hover:border-transparent"
                    }`}
                  >
                  
                  <div className="flex-1 text-[15px] leading-relaxed text-foreground/80 font-normal pt-1 pr-12 group-hover:text-foreground transition-colors">
                    {line.text.split(/(\s+)/).map((wordPart: string, i: number) => {
                      if (!wordPart.trim()) {
                        return <span key={i}>{wordPart}</span>;
                      }
                      return (
                        <span 
                          key={i} 
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanWord = wordPart.replace(/[.,!?()[\]{}"':;]/g, '').trim();
                            if (cleanWord) {
                              window.dispatchEvent(new CustomEvent('open-dictionary', { detail: cleanWord }));
                            }
                          }}
                          className="hover:bg-primary/20 hover:text-primary rounded px-0.5 -mx-0.5 cursor-pointer transition-colors"
                        >
                          {wordPart}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(line.text, idx);
                    }}
                    className="absolute right-4 top-4 p-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={t('video.copySentence')}
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
