import { Link, useNavigate } from "react-router";
import { 
  ArrowRight, 
  BookOpen, 
  BrainCircuit, 
  Users
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Button } from "@/shared/components/ui/button";
import ROUTES from "@/shared/lib/routes";

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4.5rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            {t("landing.heroTitle", "Master English,")} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              {t("landing.heroTitleHighlight", "Your Way")}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            {t("landing.heroDescription")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-xl shadow-primary/20 gap-2 transition-transform hover:scale-105"
              onClick={() => navigate(ROUTES.LOGIN.url)}
            >
              {t("landing.startLearning")}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-muted/80 transition-colors"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t("landing.exploreContent")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold">{t("landing.featureVocabulary")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("landing.featureVocabularyDesc")}
            </p>
            <Button variant="link" className="px-0 text-primary text-base font-semibold gap-2" onClick={() => navigate(`${ROUTES.SEARCH.url}?type=collections`)}>
              Explore vocabulary sets <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative border rounded-3xl shadow-2xl aspect-[4/3] flex items-center justify-center overflow-hidden bg-white">
              <img src="/images/smart_flashcards_demo.png" alt="Flashcards feature" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mt-32">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative border rounded-3xl shadow-2xl aspect-[4/3] flex items-center justify-center overflow-hidden bg-white">
               <img src="/images/interactive_grammar_demo.png" alt="Grammar feature" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold">{t("landing.featureGrammar")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("landing.featureGrammarDesc")}
            </p>
            <Button variant="link" className="px-0 text-blue-500 text-base font-semibold gap-2" onClick={() => navigate(ROUTES.GRAMMAR.url)}>
              Explore grammar lessons <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mt-32">
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold">{t("landing.featureBlog")} & {t("landing.featureChat")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("landing.featureBlogDesc")} {t("landing.featureChatDesc")}
            </p>
            <Button variant="link" className="px-0 text-purple-500 text-base font-semibold gap-2" onClick={() => navigate(ROUTES.BLOG.url)}>
              Read the community blog <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative border rounded-3xl shadow-2xl aspect-[4/3] flex items-center justify-center overflow-hidden bg-white">
               <img src="/images/community_chat_demo.png" alt="Community Chat feature" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-20 py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("landing.readyToStart")}</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl">
            {t("landing.readyToStartDesc")}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg h-14 px-10 rounded-full shadow-2xl transition-transform hover:scale-105"
            onClick={() => navigate(ROUTES.LOGIN.url)}
          >
            {t("landing.joinNow")}
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-background py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <img src="/logo1.png" alt="VocaLab Logo" className="w-8 h-8 grayscale opacity-50" />
             <span className="font-semibold text-muted-foreground">VocaLab © 2026</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
