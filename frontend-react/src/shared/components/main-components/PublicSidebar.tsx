import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Mail } from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Button } from "@/shared/components/ui/button";
import envConfig from "@/shared/config/envConfig";

export default function PublicSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const googleAuthUrl = useMemo(
    () => `${envConfig.VITE_API_URL}/api/v1/auth/google`,
    [],
  );

  return (
    <aside className="bg-card h-full flex flex-col min-h-0 overflow-auto overscroll-contain w-64 border-r border-border/50">
      <div className="flex-1 flex flex-col p-6 pt-12 gap-6">
        <h2 className="text-2xl font-extrabold text-center leading-tight tracking-tight text-foreground">
          {t("landing.joinNow", "Join the VocaLab community")}
        </h2>

        <div className="flex flex-col gap-3 mt-4">
          <a
            href={googleAuthUrl}
            className="flex items-center justify-center gap-3 w-full border rounded-full px-4 h-11 hover:bg-accent transition-colors shadow-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.3 1.53 8.27 3.24l6.01-5.99C34.57 3.33 29.74 1 24 1 14.9 1 7.09 6.2 3.25 13.73l7.02 5.45C12.16 13.08 17.61 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.67-.15-2.85-.47-4.08H24v7.73h12.86c-.26 2.03-1.67 5.09-4.8 7.14l7.38 5.7C44.8 35.02 46.5 29.62 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.27 28.18c-.5-1.48-.8-3.06-.8-4.68s.3-3.2.79-4.68l-7.02-5.45C1.85 16.15 1 20.17 1 23.5c0 3.33.85 7.35 2.24 10.13l7.03-5.45z"
              />
              <path
                fill="#34A853"
                d="M24 46c5.74 0 10.56-1.9 14.08-5.18l-7.38-5.7c-1.97 1.38-4.61 2.33-6.7 2.33-6.39 0-11.84-3.58-13.73-8.68l-7.02 5.45C7.09 41.8 14.9 46 24 46z"
              />
              <path fill="none" d="M1 1h46v46H1z" />
            </svg>
            <span className="font-semibold text-sm">Continue with Google</span>
          </a>

          <Button 
            variant="outline"
            className="w-full h-11 rounded-full gap-3 font-semibold shadow-sm text-sm"
            onClick={() => navigate(ROUTES.LOGIN.url)}
          >
            <Mail className="h-5 w-5" />
            Continue with Email
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed px-2">
          By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
        </p>

        <div className="mt-auto flex-1 bg-[url(/logo1.png)] bg-no-repeat bg-contain bg-bottom opacity-10 min-h-[150px]"></div>
      </div>
    </aside>
  );
}
