import { useState, useMemo } from 'react';
import { Search, ListVideo, Youtube, Play, BookOpen, Volume2, Repeat, Clock, Mic, Atom, GraduationCap, Briefcase, Film } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/shared/hooks/useTranslation';
import Breadcrumb from '@/shared/components/Breadcrumb';

interface RecommendVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  level: string;
  categories: ('talks' | 'science' | 'learning' | 'business' | 'story')[];
  thumbnail: string;
}

const CATEGORY_IDS: { id: string; icon?: typeof Mic }[] = [
  { id: 'all' },
  { id: 'talks', icon: Mic },
  { id: 'science', icon: Atom },
  { id: 'learning', icon: GraduationCap },
  { id: 'business', icon: Briefcase },
  { id: 'story', icon: Film },
];

const FEATURED_VIDEOS: RecommendVideo[] = [
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address",
    channel: "Stanford",
    duration: "15:04",
    level: "Intermediate",
    categories: ["talks", "learning", "business"],
    thumbnail: "https://img.youtube.com/vi/UF8uR6Z6KLc/hqdefault.jpg",
  },
  {
    id: "c0KYU2j0TM4",
    title: "The power of introverts | Susan Cain",
    channel: "TED",
    duration: "19:04",
    level: "Upper-Int",
    categories: ["talks", "learning"],
    thumbnail: "https://img.youtube.com/vi/c0KYU2j0TM4/hqdefault.jpg",
  },
  {
    id: "arj7oStGLkU",
    title: "Inside the mind of a master procrastinator | Tim Urban",
    channel: "TED",
    duration: "14:03",
    level: "Intermediate",
    categories: ["talks", "learning", "story"],
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg",
  },
  {
    id: "eIho2S0ZahI",
    title: "How to speak so that people want to listen | Julian Treasure",
    channel: "TED",
    duration: "09:58",
    level: "Intermediate",
    categories: ["talks", "learning"],
    thumbnail: "https://img.youtube.com/vi/eIho2S0ZahI/hqdefault.jpg",
  },
  {
    id: "8KkKuTCFvzI",
    title: "What makes a good life? Lessons from the longest study on happiness",
    channel: "TED",
    duration: "12:46",
    level: "Intermediate",
    categories: ["talks", "learning", "business"],
    thumbnail: "https://img.youtube.com/vi/8KkKuTCFvzI/hqdefault.jpg",
  },
  {
    id: "7XFLTDQ4JMk",
    title: "Getting stuck in the negatives (and how to get unstuck)",
    channel: "TEDx",
    duration: "21:39",
    level: "Intermediate",
    categories: ["talks", "learning"],
    thumbnail: "https://img.youtube.com/vi/7XFLTDQ4JMk/hqdefault.jpg",
  },
  {
    id: "H14bBuluwB8",
    title: "Grit: the power of passion and perseverance | Angela Lee Duckworth",
    channel: "TED",
    duration: "06:12",
    level: "Intermediate",
    categories: ["talks", "learning", "business"],
    thumbnail: "https://img.youtube.com/vi/H14bBuluwB8/hqdefault.jpg",
  },
  {
    id: "D9Ihs241zeg",
    title: "The danger of a single story | Chimamanda Ngozi Adichie",
    channel: "TED",
    duration: "18:36",
    level: "Intermediate",
    categories: ["talks", "business", "story"],
    thumbnail: "https://img.youtube.com/vi/D9Ihs241zeg/hqdefault.jpg",
  },
  {
    id: "KM4Xe6Dlp0Y",
    title: "Looks aren't everything. Believe me, I'm a model. | Cameron Russell",
    channel: "TED",
    duration: "09:37",
    level: "Intermediate",
    categories: ["talks", "learning"],
    thumbnail: "https://img.youtube.com/vi/KM4Xe6Dlp0Y/hqdefault.jpg",
  },
  {
    id: "qp0HIF3SfI4",
    title: "How great leaders inspire action | Simon Sinek",
    channel: "TED",
    duration: "18:04",
    level: "Intermediate",
    categories: ["talks", "business"],
    thumbnail: "https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg",
  },
  {
    id: "rrkrvAUbU9Y",
    title: "The puzzle of motivation | Dan Pink",
    channel: "TED",
    duration: "11:59",
    level: "Intermediate",
    categories: ["talks", "business"],
    thumbnail: "https://img.youtube.com/vi/rrkrvAUbU9Y/hqdefault.jpg",
  },
  {
    id: "16p9YRF0l-g",
    title: "How to build your creative confidence | David Kelley",
    channel: "TED",
    duration: "06:40",
    level: "Intermediate",
    categories: ["talks", "business"],
    thumbnail: "https://img.youtube.com/vi/16p9YRF0l-g/hqdefault.jpg",
  },
  {
    id: "w-HYZv6HzAs",
    title: "The skill of self confidence | Dr. Ivan Joseph",
    channel: "TEDx",
    duration: "15:20",
    level: "Intermediate",
    categories: ["talks", "learning", "business"],
    thumbnail: "https://img.youtube.com/vi/w-HYZv6HzAs/hqdefault.jpg",
  },
  {
    id: "75d_29QWELk",
    title: "Change Your Life – One Tiny Step at a Time",
    channel: "Kurzgesagt",
    duration: "11:28",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/75d_29QWELk/hqdefault.jpg",
  },
  {
    id: "9P6rdqiybaw",
    title: "Wormholes Explained – Breaking Spacetime",
    channel: "Kurzgesagt",
    duration: "11:06",
    level: "Upper-Int",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/9P6rdqiybaw/hqdefault.jpg",
  },
  {
    id: "hOfRN0KihOU",
    title: "How Evolution Works",
    channel: "Kurzgesagt",
    duration: "11:53",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/hOfRN0KihOU/hqdefault.jpg",
  },
  {
    id: "zQGOcOUBi6s",
    title: "The Immune System Explained – Bacteria Infection",
    channel: "Kurzgesagt",
    duration: "07:31",
    level: "Upper-Int",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/zQGOcOUBi6s/hqdefault.jpg",
  },
  {
    id: "gedoSfZvBgE",
    title: "The benefits of a good night's sleep",
    channel: "TED-Ed",
    duration: "04:34",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/gedoSfZvBgE/hqdefault.jpg",
  },
  {
    id: "wUEl8KrMz14",
    title: "Why sitting is bad for you",
    channel: "TED-Ed",
    duration: "04:56",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/wUEl8KrMz14/hqdefault.jpg",
  },
  {
    id: "MBRqu0YOH14",
    title: "Optimistic Nihilism",
    channel: "Kurzgesagt",
    duration: "06:12",
    level: "Upper-Int",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/MBRqu0YOH14/hqdefault.jpg",
  },
  {
    id: "1AElONvi9WQ",
    title: "Why Blue Whales Don't Get Cancer - Peto's Paradox",
    channel: "Kurzgesagt",
    duration: "08:30",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/1AElONvi9WQ/hqdefault.jpg",
  },
  {
    id: "d6iQrh2TK98",
    title: "Why is this number everywhere?",
    channel: "Veritasium",
    duration: "10:15",
    level: "Intermediate",
    categories: ["science", "story"],
    thumbnail: "https://img.youtube.com/vi/d6iQrh2TK98/hqdefault.jpg",
  },
  {
    id: "F3QpgXBtDeo",
    title: "How The Stock Exchange Works",
    channel: "Kurzgesagt",
    duration: "07:15",
    level: "Intermediate",
    categories: ["science", "business"],
    thumbnail: "https://img.youtube.com/vi/F3QpgXBtDeo/hqdefault.jpg",
  },
  {
    id: "L4N1q4RNi9I",
    title: "Why the secret to success is setting the right goals",
    channel: "TED",
    duration: "11:50",
    level: "Upper-Int",
    categories: ["science", "business"],
    thumbnail: "https://img.youtube.com/vi/L4N1q4RNi9I/hqdefault.jpg",
  },
  {
    id: "8COaMKbNrX0",
    title: "Are athletes really getting faster, better, stronger?",
    channel: "TED",
    duration: "05:55",
    level: "Intermediate",
    categories: ["science", "business"],
    thumbnail: "https://img.youtube.com/vi/8COaMKbNrX0/hqdefault.jpg",
  },
  {
    id: "juKd26qkNAw",
    title: "Learn English in 30 Minutes - ALL the English Basics You Need",
    channel: "EnglishClass101",
    duration: "29:30",
    level: "Beginner",
    categories: ["learning"],
    thumbnail: "https://img.youtube.com/vi/juKd26qkNAw/hqdefault.jpg",
  },
  {
    id: "d0yGdNEWdn0",
    title: "How to learn any language in six months | Chris Lonsdale",
    channel: "TEDx",
    duration: "18:02",
    level: "Intermediate",
    categories: ["learning"],
    thumbnail: "https://img.youtube.com/vi/d0yGdNEWdn0/hqdefault.jpg",
  },
];

export const VideoPage = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleExtractUrl = (inputUrl: string) => {
    if (!inputUrl) return;
    
    // Extract video ID from YouTube URL
    const match = inputUrl.match(/[?&]v=([^&]+)/) || inputUrl.match(/youtu\.be\/([^?]+)/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      setError(t('video.invalidYouTubeUrl'));
      return;
    }

    // Navigate to the extracted video page
    navigate(`/video/${videoId}`);
  };

  const handleExtract = () => {
    handleExtractUrl(url);
  };

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'all') return FEATURED_VIDEOS;
    return FEATURED_VIDEOS.filter((v) => v.categories.includes(selectedCategory as any));
  }, [selectedCategory]);

  const categories = useMemo(() => CATEGORY_IDS.map((cat) => ({
    ...cat,
    label: t(`video.category${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`),
  })), [t]);

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-10 pb-16">
        <Breadcrumb items={[{ label: t("common.video", "Video") }]} />

        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-linear-to-br from-primary/10 via-card to-background border border-border/80 p-8 sm:p-12 shadow-xs text-center flex flex-col items-center space-y-6 overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold shadow-xs">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube Interactive Transcript & Vocabulary</span>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {t("video.heroTitle", "Học từ vựng qua Video thông minh")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("video.heroSubtitle", "Dán liên kết video YouTube bất kỳ để khám phá phụ đề đồng bộ trực tiếp, nghe lặp lại từng câu và tra cứu từ vựng 1 chạm.")}
            </p>
          </div>

          {/* Search / Extract Input Bar */}
          <div className="w-full max-w-2xl space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-3xl bg-card border border-border/80 shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  placeholder={t('video.pasteYouTubeUrl')}
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <button
                onClick={handleExtract}
                disabled={!url.trim()}
                className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer shrink-0"
              >
                <ListVideo className="w-4 h-4" />
                <span>{t('video.extract')}</span>
              </button>
            </div>

            {error && (
              <p className="text-xs font-semibold text-destructive text-left px-4">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Categorized Video Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("video.featuredVideos", "Video đề xuất theo chủ đề")}
            </h2>
            <span className="text-xs font-medium text-muted-foreground">
              {t('video.readyToLearn', { count: filteredVideos.length })}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs scale-102"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVideos.map((vid) => (
              <div
                key={vid.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/video/${vid.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/video/${vid.id}`);
                  }
                }}
                className="group flex flex-col overflow-hidden rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="h-11 w-11 rounded-2xl bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs">
                    <Clock size={11} />
                    {vid.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-1 flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                      {vid.level}
                    </span>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {vid.title}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground font-semibold pt-1 border-t border-border/60">
                    {vid.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-xs space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {t('video.feature1Title')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('video.feature1Desc')}
            </p>
          </div>

          <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-xs space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {t('video.feature2Title')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('video.feature2Desc')}
            </p>
          </div>

          <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-xs space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {t('video.feature3Title')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('video.feature3Desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

