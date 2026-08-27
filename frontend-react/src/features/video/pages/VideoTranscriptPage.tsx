import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlignLeft, Copy, CheckCircle2, ArrowLeft, Eye, Clock, Calendar, ChevronDown, ChevronUp, Bookmark, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import YouTube from 'react-youtube';
import { useExtractVideo } from '../api/videoService';
import { Switch } from '@/shared/components/ui/switch';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Breadcrumb from '@/shared/components/Breadcrumb';

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

const formatTimestamp = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (num: number) => String(num).padStart(2, '0');
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
};

export const ExtractedVideoPage = () => {
  const { t } = useTranslation();
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chapters'>('transcript');
  
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
  const chapters = response?.data?.chapters || [];
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
      const container = transcriptContainerRef.current;
      const element = activeLineRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offsetTop = elementRect.top - containerRect.top + container.scrollTop;
      
      // Always scroll active sentence to the very top (with 12px padding) next to the video screen
      container.scrollTo({
        top: Math.max(0, offsetTop - 12),
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex, isSyncing]);

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        <Breadcrumb 
          items={[
            { label: t("common.video", "Video"), href: "/video" },
            { label: videoInfo?.title || t("video.transcript", "Phụ đề Video") }
          ]} 
        />

        {error && (
          <div className="p-5 bg-destructive/10 text-destructive border border-destructive/20 rounded-3xl text-sm font-semibold flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => navigate('/video')}
              className="px-4 py-1.5 rounded-xl bg-card border border-border/80 text-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
            >
              {t("video.tryAnotherVideo", "Try another video")}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isPending && (
          <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
            <div className="lg:w-[55%] w-full flex flex-col gap-4">
              <div className="aspect-video w-full bg-muted rounded-3xl" />
              <div className="h-40 bg-muted/60 rounded-3xl" />
            </div>
            <div className="lg:w-[45%] w-full h-[650px] flex flex-col bg-card border border-border/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-border/60 flex gap-4 shrink-0 bg-muted/30">
                <div className="w-36 h-9 bg-muted rounded-2xl" />
                <div className="w-20 h-9 bg-muted rounded-2xl" />
              </div>
              <div className="p-6 space-y-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-full h-18 bg-muted/40 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        {transcript && !isPending && (
          <div className="flex flex-col lg:flex-row items-start gap-6 pb-12">
            {/* YouTube Video & Metadata Section */}
            <div className="w-full lg:w-[55%] flex flex-col gap-5">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-border/80 bg-black w-full aspect-video shrink-0">
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
                <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl shadow-xs flex flex-col gap-4">
                  <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight tracking-tight">
                    {videoInfo.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-muted-foreground font-semibold">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-foreground font-bold">
                      <span>{videoInfo.channelTitle}</span>
                    </div>

                    {videoInfo.duration && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {formatDuration(videoInfo.duration)}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      {isExpanded ? Number(videoInfo.viewCount).toLocaleString() : Intl.NumberFormat('en', { notation: 'compact' }).format(Number(videoInfo.viewCount))} {t('video.views')}
                    </span>

                    {videoInfo.publishedAt && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {isExpanded ? new Date(videoInfo.publishedAt).toLocaleDateString() : formatDistanceToNow(new Date(videoInfo.publishedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {videoInfo.description && (
                    <div className="mt-2 bg-muted/20 border border-border/60 p-4 rounded-2xl">
                      <div className={`text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {videoInfo.description}
                      </div>
                      <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2.5 text-primary font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {isExpanded ? (
                          <>{t('video.showLess')} <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>{t('video.showMore')} <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transcript & Chapters Section */}
            <div className="w-full lg:w-[45%] flex flex-col bg-card border border-border/80 rounded-3xl shadow-xs overflow-hidden h-[calc(100vh-140px)] min-h-[640px] sticky top-6">
              {/* Header Controls */}
              <div className="p-3.5 border-b border-border/60 bg-muted/30 flex items-center justify-between shrink-0 gap-3 flex-wrap backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/video')}
                    className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer border border-border/60 shadow-xs"
                    title={t("common.back", "Back")}
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/60 shadow-xs">
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'transcript'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-primary" />
                      <span>{t('video.transcript')}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chapters')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'chapters'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('video.chapters', 'Chapters')}</span>
                      {chapters.length > 0 && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.2 rounded-full font-bold">
                          {chapters.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {activeTab === 'transcript' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const fullText = transcript.map((l: any) => l.text).join('\n');
                        navigator.clipboard.writeText(fullText);
                        setIsCopiedAll(true);
                        setTimeout(() => setIsCopiedAll(false), 2000);
                      }}
                      title={t('video.copyEntireTranscript')}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60 bg-card transition-colors cursor-pointer shadow-xs"
                    >
                      {isCopiedAll 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <Copy className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/60 shadow-xs" title={isSyncing ? t('video.autoSyncOn') : t('video.autoSyncOff')}>
                      <Volume2 className={`w-3.5 h-3.5 ${isSyncing ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Switch 
                        id="auto-sync" 
                        checked={isSyncing}
                        onCheckedChange={setIsSyncing}
                      />
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                      {t('video.sentences', { count: transcript?.length || 0 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              {activeTab === 'chapters' ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/5">
                  {chapters.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="font-semibold">{t('video.noChapters', 'Video này không có danh sách chương.')}</p>
                    </div>
                  ) : (
                    chapters.map((ch: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => handleSentenceClick(ch.start)}
                        className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all duration-300 cursor-pointer active:scale-98 shadow-xs"
                      >
                        <div className="flex items-center gap-3.5 pr-4 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                            {idx + 1}
                          </div>
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {ch.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-xl shrink-0 border border-border/60">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {formatTimestamp(ch.start)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/5">
                  {transcript?.map((line: any, idx: number) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div 
                        key={idx} 
                        ref={isActive ? activeLineRef : null}
                        onClick={() => {
                          handleSentenceClick(line.start);
                        }}
                        className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer active:scale-99 shadow-xs ${
                          isActive 
                            ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 border-l-4 border-l-primary" 
                            : "bg-card border-border/60 hover:bg-muted/40 hover:border-border/90"
                        }`}
                      >
                        {/* Timestamp badge */}
                        <div className="shrink-0 pt-0.5">
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                            isActive 
                              ? "bg-primary/20 text-primary border-primary/30" 
                              : "bg-muted/60 text-muted-foreground border-border/50"
                          }`}>
                            {formatTimestamp(line.start)}
                          </span>
                        </div>

                        {/* Text parts */}
                        <div className={`flex-1 text-sm leading-relaxed pr-8 transition-colors ${
                          isActive 
                            ? "text-foreground font-semibold" 
                            : "text-foreground/80 font-normal group-hover:text-foreground"
                        }`}>
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
                                title={t("video.clickToLookup", "Click to look up dictionary")}
                              >
                                {wordPart}
                              </span>
                            );
                          })}
                        </div>

                        {/* Copy button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(line.text, idx);
                          }}
                          className="absolute right-3.5 top-3.5 p-1.5 text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title={t('video.copySentence')}
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

