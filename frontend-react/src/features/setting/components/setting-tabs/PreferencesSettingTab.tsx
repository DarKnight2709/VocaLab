import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";
import { useTranslation, type Language } from "@/shared/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function PreferencesSettingTab() {
  const { theme, setTheme } = useTheme();
  const { language, t, setLanguage } = useTranslation();
  const [displayLanguage, setDisplayLanguage] = useState<Language>(language);

  useEffect(() => {
    setDisplayLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (lang: string) => {
    const typedLang = lang as Language;
    setDisplayLanguage(typedLang);
    setLanguage(typedLang);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Appearance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Monitor className="h-4 w-4" />
          </div>
          <h2 className="text-base font-extrabold text-foreground">{t("settings.tabs.preferences")}</h2>
        </div>

        <div className="grid gap-3">
          {/* Display Language */}
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{t("settings.displayLanguage")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.displayLanguageDesc")}</p>
            </div>
            <div className="w-[160px] sm:w-[180px] shrink-0">
              <Select value={displayLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-9 rounded-xl border-border/80 bg-background text-xs font-bold shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/80 shadow-md">
                  <SelectItem value="vi" className="text-xs font-semibold rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>🇻🇳</span>
                      <span>{t("settings.vietnamese")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en" className="text-xs font-semibold rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>{t("settings.english")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme selection */}
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{t("settings.theme")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.themeDesc")}</p>
            </div>
            <div className="w-[160px] sm:w-[180px] shrink-0">
              <Select value={theme} onValueChange={(val) => setTheme(val as any)}>
                <SelectTrigger className="h-9 rounded-xl border-border/80 bg-background text-xs font-bold shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/80 shadow-md">
                  <SelectItem value="light" className="text-xs font-semibold rounded-xl">
                    <div className="flex items-center gap-2">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span>{t("settings.light")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="text-xs font-semibold rounded-xl">
                    <div className="flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5 text-sky-400" />
                      <span>{t("settings.dark")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
