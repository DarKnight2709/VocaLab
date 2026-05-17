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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ────────── Appearance Section ────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Monitor className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("settings.tabs.preferences")}</h2>
        </div>

        <div className="grid gap-4">
          {/* Display Language */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.displayLanguage")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.displayLanguageDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={displayLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">
                    <div className="flex items-center gap-2">
                      <span>🇻🇳</span>
                      <span>{t("settings.vietnamese")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
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
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.theme")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={theme} onValueChange={(val) => setTheme(val as any)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-orange-500" />
                      <span>{t("settings.light")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-blue-400" />
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
