import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import ROUTES from "@/shared/lib/routes";
import { FileQuestion, Home } from "lucide-react";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20 bg-primary rounded-full" />
          <div className="relative flex justify-center">
            <div className="bg-muted p-6 rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/5">
              <FileQuestion className="w-24 h-24 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter text-primary">
            404
          </h1>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("common.pageNotFound")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            {t("common.pageNotFoundDesc")}
          </p>
        </div>

        <div className="pt-4">
          <Button asChild size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <Link to={ROUTES.HOME.url}>
              <Home className="w-4 h-4" />
              {t("common.backToHome")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
