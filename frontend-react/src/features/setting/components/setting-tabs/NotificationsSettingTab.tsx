import { useTranslation } from "@/shared/hooks/useTranslation";

export default function NotificationsSettingTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{t("settings.notificationsTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("settings.notificationsDescription")}</p>
    </div>
  )
}