import { useState } from "react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Bell, Mail, BellOff, MessageSquare, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function NotificationsSettingTab() {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState({
    chatMessages: "inbox",
    commentsOnPosts: "inbox",
    upvotesOnPosts: "off",
    upvotesOnComments: "off",
    repliesToComments: "inbox",
    newFollowers: "inbox",
    activityFromFollowed: "off"
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const NotificationItem = ({ 
    titleKey, 
    descKey, 
    settingKey,
    hideEmail = false
  }: { 
    titleKey: string; 
    descKey: string; 
    settingKey: keyof typeof settings;
    hideEmail?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
      <div className="flex-1 pr-4">
        <p className="font-medium">{t(titleKey)}</p>
        <p className="text-sm text-muted-foreground">{t(descKey)}</p>
      </div>
      <div className="w-[180px]">
        <Select 
          value={settings[settingKey]} 
          onValueChange={(val) => handleSettingChange(settingKey, val)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {!hideEmail && (
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>{t("settings.notifications.options.email")}</span>
                </div>
              </SelectItem>
            )}
            <SelectItem value="inbox">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <span>{t("settings.notifications.options.inbox")}</span>
              </div>
            </SelectItem>
            <SelectItem value="off">
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
          <h2 className="text-xl font-semibold">{t("settings.notificationsTitle")}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{t("settings.notificationsDescription")}</p>
        
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
                hideEmail
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
                titleKey="settings.notifications.commentsOnPosts" 
                descKey="settings.notifications.commentsOnPostsDesc" 
                settingKey="commentsOnPosts" 
              />
              <NotificationItem 
                titleKey="settings.notifications.upvotesOnPosts" 
                descKey="settings.notifications.upvotesOnPostsDesc" 
                settingKey="upvotesOnPosts" 
              />
              <NotificationItem 
                titleKey="settings.notifications.upvotesOnComments" 
                descKey="settings.notifications.upvotesOnCommentsDesc" 
                settingKey="upvotesOnComments" 
              />
              <NotificationItem 
                titleKey="settings.notifications.repliesToComments" 
                descKey="settings.notifications.repliesToCommentsDesc" 
                settingKey="repliesToComments" 
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