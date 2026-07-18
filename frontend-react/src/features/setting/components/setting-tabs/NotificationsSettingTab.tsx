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
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 shadow-sm">
      <div className="flex-1 pr-4">
        <p className="font-medium">{t(titleKey)}</p>
        <p className="text-sm text-muted-foreground">{t(descKey)}</p>
      </div>
      <div className="w-[180px]">
        <Select
          value={notificationStates[settingKey]}
          onValueChange={(val) => handleSettingChange(settingKey, val)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMAIL">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{t("settings.notifications.options.email")}</span>
              </div>
            </SelectItem>
            <SelectItem value="INBOX">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <span>{t("settings.notifications.options.inbox")}</span>
              </div>
            </SelectItem>
            <SelectItem value="OFF">
              <div className="flex items-center gap-2">
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <span>{t("settings.notifications.options.off")}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {t("settings.notificationsTitle")}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {t("settings.notificationsDescription")}
        </p>

        <div className="space-y-6 mt-4">
          {/* Messages Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary/80" />
              {t("settings.notifications.messages")}
            </h3>
            <div className="grid gap-4">
              <NotificationItem
                titleKey="settings.notifications.chatMessages"
                descKey="settings.notifications.chatMessagesDesc"
                settingKey="chatMessages"
              />
            </div>
          </section>

          {/* Activity Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary/80" />
              {t("settings.notifications.activity")}
            </h3>
            <div className="grid gap-4">
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



