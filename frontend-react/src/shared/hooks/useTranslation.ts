import { useTranslation as useI18nTranslation } from "react-i18next";

export type Language = "vi" | "en";

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const setLanguage = (language: Language) => {
    i18n.changeLanguage(language);
  };

  return {
    language: (i18n.language || "vi") as Language,
    setLanguage,
    t,
    i18n,
  };
};