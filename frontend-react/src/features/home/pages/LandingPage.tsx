import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Users,
  Volume2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Button } from "@/shared/components/ui/button";
import ROUTES from "@/shared/lib/routes";

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* ────────── 1. Hero Section ────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-primary/20 via-sky-500/15 to-indigo-500/20 rounded-full blur-[130px] opacity-70 pointer-events-none" />
        <div className="absolute top-12 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Main Headline (Preserved original keys) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.15] max-w-4xl">
            {t("landing.heroTitle", "Master English,")} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-500 to-indigo-600">
              {t("landing.heroTitleHighlight", "Your Way")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-medium">
            {t("landing.heroDescription")}
          </p>

          {/* Dual CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-13 px-8 rounded-2xl font-bold shadow-lg shadow-primary/25 gap-2 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate(ROUTES.LOGIN.url)}
            >
              <span>{t("landing.startLearning")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-13 px-7 rounded-2xl font-bold bg-card/60 backdrop-blur-md border-border/80 hover:bg-muted/80 transition-all cursor-pointer shadow-xs"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{t("landing.exploreContent")}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ────────── 2. Live Feature Showcase Section ────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-24 sm:space-y-32">
        {/* Feature 1: Vocabulary & Spaced Repetition */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t("landing.featureVocabulary")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                {t("landing.featureVocabularyDesc")}
              </p>
            </div>

            <Button
              variant="link"
              className="px-0 text-primary text-sm sm:text-base font-bold gap-2 hover:underline cursor-pointer"
              onClick={() => navigate(`${ROUTES.SEARCH.url}?type=collections`)}
            >
              <span>Explore vocabulary sets</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Interactive Mockup: Flashcard Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-sky-500/10 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-extrabold uppercase tracking-wider">
                  Mastered
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Card 14 / 30
                </span>
              </div>

              <div className="space-y-1 text-center py-3">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Serendipity
                  </h3>
                  <button type="button" className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  /ˌser.ənˈdɪp.ə.t̬i/ • (noun)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  The occurrence of finding valuable or agreeable things not sought for.
                </p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "Finding this book in an old bookstore was a pure moment of serendipity."
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="py-2 rounded-xl bg-destructive/10 text-destructive text-center text-xs font-bold border border-destructive/20">
                  Again
                </div>
                <div className="py-2 rounded-xl bg-amber-500/10 text-amber-500 text-center text-xs font-bold border border-amber-500/20">
                  Hard
                </div>
                <div className="py-2 rounded-xl bg-blue-500/10 text-blue-500 text-center text-xs font-bold border border-blue-500/20">
                  Good
                </div>
                <div className="py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-center text-xs font-bold border border-emerald-500/20">
                  Easy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Grammar */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tl from-sky-500/20 via-indigo-500/10 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-[11px] font-extrabold uppercase tracking-wider">
                  B2 • Upper-Intermediate
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Lesson 08: Third Conditional
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Grammar Rule & Structure
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground font-mono bg-background/80 p-2.5 rounded-xl border border-border/60">
                  If + S + had + V3/ed, S + would have + V3/ed
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Practice Example:
                </p>
                <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-foreground">
                    "If she <span className="text-primary font-bold underline">had studied</span> harder, she would have passed."
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t("landing.featureGrammar")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                {t("landing.featureGrammarDesc")}
              </p>
            </div>

            <Button
              variant="link"
              className="px-0 text-sky-500 text-sm sm:text-base font-bold gap-2 hover:underline cursor-pointer"
              onClick={() => navigate(ROUTES.GRAMMAR.url)}
            >
              <span>Explore grammar lessons</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Feature 3: Blog & Community Chat */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t("landing.featureBlog")} & {t("landing.featureChat")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                {t("landing.featureBlogDesc")} {t("landing.featureChatDesc")}
              </p>
            </div>

            <Button
              variant="link"
              className="px-0 text-purple-500 text-sm sm:text-base font-bold gap-2 hover:underline cursor-pointer"
              onClick={() => navigate(ROUTES.BLOG.url)}
            >
              <span>Read the community blog</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border/70">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">
                  VQ
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    Alex Rivers
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    2 hours ago • Study Tips & Experience
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-extrabold">
                  Featured
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                "How I scored 8.0 in IELTS Reading with 20 minutes of daily spaced repetition on VocaLab!"
              </p>

              <div className="flex items-center justify-between pt-2 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-rose-500">
                    ❤️ 128
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> 34 comments
                  </span>
                </div>
                <span className="text-primary font-bold">#IELTS #Vocabulary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── 3. CTA Section ────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white p-8 sm:p-14 shadow-2xl overflow-hidden text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t("landing.readyToStart")}
            </h2>
            <p className="text-sm sm:text-lg text-white/80 font-medium leading-relaxed">
              {t("landing.readyToStartDesc")}
            </p>

            <div className="pt-2">
              <Button
                size="lg"
                className="h-12 sm:h-13 px-8 rounded-2xl bg-white text-zinc-950 hover:bg-white/90 font-extrabold text-sm sm:text-base shadow-xl hover:scale-105 transition-all cursor-pointer"
                onClick={() => navigate(ROUTES.LOGIN.url)}
              >
                <span>{t("landing.joinNow")}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── 4. Footer ────────── */}
      <footer className="border-t border-border/80 bg-card py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs">
              V
            </div>
            <span className="font-extrabold text-foreground text-sm">VocaLab © 2026</span>
          </div>

          <div className="flex gap-6 text-xs sm:text-sm font-semibold text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
