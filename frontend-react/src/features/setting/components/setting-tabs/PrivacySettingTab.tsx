import { useTranslation } from "@/shared/hooks/useTranslation";

export default function PrivacySettingTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{t("settings.privacyTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("settings.privacyDescription")}</p>
    </div>
  )
}