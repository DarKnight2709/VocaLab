import { useOutletContext } from "react-router";
import NotificationsSettingTab from "../components/setting-tabs/NotificationsSettingTab";
import type { SettingContext } from "./SettingPage";

export default function NotificationsSettingPage() {
  const { 
    notificationSettings,
    isLoadingNotifications,
    onUpdateChatMessages,
    onUpdateComments,
    onUpdateUpvotes,
    onUpdateNewFollowers,
    onUpdateActivityFromFollowed
  } = useOutletContext<SettingContext>();

  return (
    <NotificationsSettingTab 
      settings={notificationSettings}
      isLoading={isLoadingNotifications}
      onUpdateChatMessages={onUpdateChatMessages}
      onUpdateComments={onUpdateComments}
      onUpdateUpvotes={onUpdateUpvotes}
      onUpdateNewFollowers={onUpdateNewFollowers}
      onUpdateActivityFromFollowed={onUpdateActivityFromFollowed}
    />
  );
}
