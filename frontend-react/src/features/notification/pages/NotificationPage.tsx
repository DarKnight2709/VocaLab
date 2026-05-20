import { useTranslation } from "@/shared/hooks/useTranslation";
import { Bell, CheckCheck } from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";

export default function NotificationPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Breadcrumb items={[{ label: t("notifications.title") }]} />

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("notifications.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("notifications.description")}
            </p>
          </div>
          
          <button 
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            {t("notifications.markAllAsRead")}
          </button>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">{t("notifications.empty")}</p>
            <p className="text-sm mt-1">{t("notifications.emptyHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
