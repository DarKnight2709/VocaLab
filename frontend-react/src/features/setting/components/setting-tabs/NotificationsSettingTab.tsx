import { useState, useEffect } from "react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Bell, Mail, BellOff, MessageSquare, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { NotificationChannel } from "@/shared/enums/NotificationChannel.enum";

interface NotificationsSettingTabProps {
  settings?: any;
  isLoading?: boolean;
  onUpdateChatMessages: (value: string) => void;
  onUpdateComments: (value: string) => void;
  onUpdateUpvotes: (value: string) => void;
  onUpdateNewFollowers: (value: string) => void;
  onUpdateActivityFromFollowed: (value: string) => void;
}

export default function NotificationsSettingTab({
  settings,
  onUpdateChatMessages,
  onUpdateComments,
  onUpdateUpvotes,
  onUpdateNewFollowers,
  onUpdateActivityFromFollowed,
}: NotificationsSettingTabProps) {
  const { t } = useTranslation();

  /* ── 1. Local States for Notifications ── */
  const [chatMessages, setChatMessages] = useState<string>(settings?.chatMessages ?? NotificationChannel.INBOX);
  const [comments, setComments] = useState<string>(settings?.comments ?? NotificationChannel.INBOX);
  const [upvotes, setUpvotes] = useState<string>(settings?.upvotes ?? NotificationChannel.INBOX);
  const [newFollowers, setNewFollowers] = useState<string>(settings?.newFollowers ?? NotificationChannel.INBOX);
  const [activityFromFollowed, setActivityFromFollowed] = useState<string>(settings?.activityFromFollowed ?? NotificationChannel.INBOX);

  /* ── 2. Sync Local State with Server Data ── */
  useEffect(() => {
    if (settings) {
      if (settings.chatMessages) setChatMessages(settings.chatMessages);
      if (settings.comments) setComments(settings.comments);
      if (settings.upvotes) setUpvotes(settings.upvotes);
      if (settings.newFollowers) setNewFollowers(settings.newFollowers);
      if (settings.activityFromFollowed) setActivityFromFollowed(settings.activityFromFollowed);
    }
  }, [settings]);

  const handleSettingChange = (key: string, value: string) => {
    switch (key) {
      case "chatMessages":
        setChatMessages(value);
        onUpdateChatMessages(value);
        break;
      case "comments":
        setComments(value);
        onUpdateComments(value);
        break;
      case "upvotes":
        setUpvotes(value);
        onUpdateUpvotes(value);
        break;
      case "newFollowers":
        setNewFollowers(value);
        onUpdateNewFollowers(value);
        break;
      case "activityFromFollowed":
        setActivityFromFollowed(value);
        onUpdateActivityFromFollowed(value);
        break;
    }
  };

  const notificationStates = {
    chatMessages,
    comments,
    upvotes,
    newFollowers,
    activityFromFollowed,
  };

  const NotificationItem = ({
    titleKey,
    descKey,
    settingKey,
  }: {
    titleKey: string;
    descKey: string;
    settingKey: keyof typeof notificationStates;
  }) => (
    <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
      <div className="space-y-0.5 flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{t(titleKey)}</p>
        <p className="text-xs text-muted-foreground">{t(descKey)}</p>
      </div>
      <div className="w-[150px] sm:w-[170px] shrink-0">
        <Select
          value={notificationStates[settingKey]}
          onValueChange={(val) => handleSettingChange(settingKey, val)}
        >
          <SelectTrigger className="h-9 rounded-xl border-border/80 bg-background text-xs font-bold shadow-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/80 shadow-md">
            <SelectItem value="EMAIL" className="text-xs font-semibold rounded-xl">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>{t("settings.notifications.options.email")}</span>
              </div>
            </SelectItem>
            <SelectItem value="INBOX" className="text-xs font-semibold rounded-xl">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-amber-500" />
                <span>{t("settings.notifications.options.inbox")}</span>
              </div>
            </SelectItem>
            <SelectItem value="OFF" className="text-xs font-semibold rounded-xl">
              <div className="flex items-center gap-2">
                <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("settings.notifications.options.off")}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-6">
        <div className="space-y-1 pb-2 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">
              {t("settings.notificationsTitle")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground ml-10.5">
            {t("settings.notificationsDescription")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Messages Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>{t("settings.notifications.messages")}</span>
            </h3>
            <div className="grid gap-3">
              <NotificationItem
                titleKey="settings.notifications.chatMessages"
                descKey="settings.notifications.chatMessagesDesc"
                settingKey="chatMessages"
              />
            </div>
          </section>

          {/* Activity Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>{t("settings.notifications.activity")}</span>
            </h3>
            <div className="grid gap-3">
              <NotificationItem
                titleKey="settings.notifications.comments"
                descKey="settings.notifications.commentsDesc"
                settingKey="comments"
              />
              <NotificationItem
                titleKey="settings.notifications.upvotes"
                descKey="settings.notifications.upvotesDesc"
                settingKey="upvotes"
              />
              <NotificationItem
                titleKey="settings.notifications.newFollowers"
                descKey="settings.notifications.newFollowersDesc"
                settingKey="newFollowers"
              />
              <NotificationItem
                titleKey="settings.notifications.activityFromFollowed"
                descKey="settings.notifications.activityFromFollowedDesc"
                settingKey="activityFromFollowed"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



