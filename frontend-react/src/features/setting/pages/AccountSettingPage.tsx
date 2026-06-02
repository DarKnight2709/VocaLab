import { useOutletContext } from "react-router";
import AccountSettingTab from "../components/setting-tabs/AccountSettingTab";
import type { SettingContext } from "./SettingPage";

export default function AccountSettingPage() {
  const { 
    onEditProfile, 
    onChangePassword, 
    onSocialLinks, 
    onDeleteAccount, 
    onSetPassword, 
    onSetTwoFactorAuth, 
    me 
  } = useOutletContext<SettingContext>();

  return (
    <AccountSettingTab 
      onEditProfile={onEditProfile}
      onChangePassword={onChangePassword}
      onSocialLinks={onSocialLinks}
      onDeleteAccount={onDeleteAccount}
      onSetPassword={onSetPassword}
      onSetTwoFactorAuth={onSetTwoFactorAuth}
      me={me}
    />
  );
}
