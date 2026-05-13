import { useEffect, useState } from "react";
import { Moon, Sun, Languages, Monitor } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";
import { useTranslation, type Language } from "@/shared/hooks/useTranslation";
import { cn } from "@/shared/lib/utils";

export default function PreferencesSettingTab() {
  const { theme, setTheme } = useTheme();
  const { language, t, setLanguage } = useTranslation();
  const [displayLanguage, setDisplayLanguage] = useState<Language>(language);

  useEffect(() => {
    setDisplayLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setDisplayLanguage(lang);
    setLanguage(lang);
  };


  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Language Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 text-primary">
            <Languages className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-tight">{t("settings.displayLanguage")}</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-7.5">
            {t("settings.displayLanguageDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-7.5">
          {[
            { id: "vi", label: t("settings.vietnamese"), flag: "🇻🇳" },
            { id: "en", label: t("settings.english"), flag: "🇺🇸" },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id as Language)}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 group",
                displayLanguage === lang.id
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  : "border-muted bg-card hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              <div className="flex items-center gap-4 text-left">
                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-500">
                  {lang.flag}
                </span>
                <span className={cn(
                  "font-semibold transition-colors",
                  displayLanguage === lang.id ? "text-primary" : "text-foreground"
                )}>
                  {lang.label}
                </span>
              </div>
              {displayLanguage === lang.id && (
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Theme Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 text-primary">
            <Monitor className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-tight">{t("settings.theme")}</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-7.5">
            {t("settings.themeDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-7.5">
          {[
            { id: "light", label: t("settings.light"), icon: Sun, slogan: t("settings.brightAndFresh") },
            { id: "dark", label: t("settings.dark"), icon: Moon, slogan: t("settings.easyOnEyes") },
          ].map((item) => (

            <button
              key={item.id}
              onClick={() => setTheme(item.id as any)}
              className={cn(
                "relative flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                theme === item.id
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  : "border-muted bg-card hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              {/* Decorative background element */}
              <div className={cn(
                "absolute -right-4 -bottom-4 opacity-[0.03] transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12",
                theme === item.id ? "text-primary opacity-10" : "text-foreground"
              )}>
                <item.icon size={100} />
              </div>

              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                theme === item.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <item.icon size={20} />
              </div>
              
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className={cn(
                  "font-bold transition-colors",
                  theme === item.id ? "text-primary text-lg" : "text-foreground"
                )}>
                  {item.label}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">
                  {item.slogan}
                </span>
              </div>

              {theme === item.id && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                    {t("settings.active")}
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              )}

            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
