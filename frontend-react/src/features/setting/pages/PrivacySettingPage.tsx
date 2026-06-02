import { useOutletContext } from "react-router";
import PrivacySettingTab from "../components/setting-tabs/PrivacySettingTab";
import type { SettingContext } from "./SettingPage";

export default function PrivacySettingPage() {
  const { 
    me,
    onAllowFollow,
    onUpdateMessageScope,
    onUpdateFollowersTabVisibility,
    onUpdateFollowingTabVisibility,
    onUpdateFriendTabVisibility
  } = useOutletContext<SettingContext>();

  return (
    <PrivacySettingTab 
      me={me}
      onAllowFollow={onAllowFollow}
      onUpdateMessageScope={onUpdateMessageScope}
      onUpdateFollowersTabVisibility={onUpdateFollowersTabVisibility}
      onUpdateFollowingTabVisibility={onUpdateFollowingTabVisibility}
      onUpdateFriendTabVisibility={onUpdateFriendTabVisibility}
    />
  );
}
