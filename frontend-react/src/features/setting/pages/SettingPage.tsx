import Breadcrumb from "@/shared/components/Breadcrumb";
import { SettingTab } from "@/shared/enums/SettingTab.enum";
import {
  Users,
  Bell,
  Lock,
  Edit,
  Goal,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMeQuery, useUpdateTwoFactorAuthMutation, useDisableTwoFactorAuthMutation } from "@/features/auth/api/authService";
import AccountSettingTab from "../components/setting-tabs/AccountSettingTab";
import PrivacySettingTab from "../components/setting-tabs/PrivacySettingTab";
import PreferencesSettingTab from "../components/setting-tabs/PreferencesSettingTab";
import NotificationsSettingTab from "../components/setting-tabs/NotificationsSettingTab";
import LearningSettingTab from "../components/setting-tabs/LearningSettingTab";
import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { UserSocialDialog } from "../components/UserSocialDialog";
import { useNavigate } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useDeleteAccountMutation } from "@/features/user/api/userService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { SetPasswordDialog } from "@/features/auth/components/SetPasswordDialog";
import { TwoFactorAuthDialog } from "@/features/auth/components/TwoFactorAuthDialog";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useAllowFollowMutation, useUpdateMessageScopeMutation, useUpdateFollowersTabVisibilityMutation, useUpdateFollowingTabVisibilityMutation, useUpdateFriendTabVisibilityMutation, useUpdateChatMessagesMutation, useUpdateCommentsMutation, useUpdateUpvotesMutation, useUpdateNewFollowersMutation, useUpdateActivityFromFollowedMutation, useNotificationSettingsQuery } from "../api/settingService";


import type { ScopeVisibilityType } from "@/shared/enums/ScopeVisibility.enum";


export default function SettingPage() {
  const { t } = useTranslation();
  const sidebarGroups = useMemo(
    () => [
      {
        id: "general",
        title: t("settings.tabs.general"),
        items: [
          { key: SettingTab.ACCCOUNT, label: t("settings.tabs.account"), icon: User },
          { key: SettingTab.PREFERENCES, label: t("settings.tabs.preferences"), icon: Edit },
        ],
      },
      {
        id: "security",
        title: t("settings.tabs.securityAndPrivacy"),
        items: [
          { key: SettingTab.PRIVACY, label: t("settings.tabs.privacy"), icon: Lock },
          { key: SettingTab.NOTIFICATIONS, label: t("settings.tabs.notifications"), icon: Bell },
        ],
      },
      {
        id: "learning",
        title: t("settings.tabs.learningAndActivity"),
        items: [{ key: SettingTab.LEARNING, label: t("settings.tabs.learning"), icon: Goal }],
      },
    ],
    [t],
  );

  const [activeTab, setActiveTab] = useState<SettingTab>(SettingTab.ACCCOUNT);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "general",
    "security",
    "learning",
  ]);

  const { data: me } = useMeQuery();
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);



  const navigate = useNavigate();
  const deleteAccountMutation = useDeleteAccountMutation();
  const updateTwoFactorAuthMutation = useUpdateTwoFactorAuthMutation();
  const disableTwoFactorAuthMutation = useDisableTwoFactorAuthMutation();
  const allowFollowMutation = useAllowFollowMutation();
  const updateMessageScopeMutation = useUpdateMessageScopeMutation();
  const updateFollowersTabVisibilityMutation = useUpdateFollowersTabVisibilityMutation();
  const updateFollowingTabVisibilityMutation = useUpdateFollowingTabVisibilityMutation();
  const updateFriendTabVisibilityMutation = useUpdateFriendTabVisibilityMutation();
  const updateChatMessagesMutation = useUpdateChatMessagesMutation();
  const updateCommentsMutation = useUpdateCommentsMutation();
  const updateUpvotesMutation = useUpdateUpvotesMutation();
  const updateNewFollowersMutation = useUpdateNewFollowersMutation();
  const updateActivityFromFollowedMutation = useUpdateActivityFromFollowedMutation();

  const logout = useAuthStore((s) => s.logout);
  const disconnect = useSocketStore((s) => s.disconnect);
  const { data: notificationSettings, isLoading: isLoadingNotifications } = useNotificationSettingsQuery();


  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      disconnect();
      logout();
      navigate(ROUTES.LOGIN.url);
    } catch (e) {
      // toast handled in mutation
    }
  };

  const handleTwoFactorAuthToggle = async () => {
    try {
      if (me?.isTwoFactorEnabled) {
        // Tắt 2FA
        await disableTwoFactorAuthMutation.mutateAsync();
      } else {
        // Bật 2FA
        const { data } = await updateTwoFactorAuthMutation.mutateAsync();
        if (data.qrCode) {
          setQrCode(data.qrCode);
          setTwoFactorOpen(true);
        }
      }
    } catch (error) {
      console.error("2FA Toggle error:", error);
    }
  };
  const handleAllowFollowToggle = async (allowFollow: boolean) => {
    try {
      await allowFollowMutation.mutateAsync(allowFollow);
    } catch (error) {
      console.error("Allow follow toggle error:", error);
    }
  };

  const handleUpdateMessageScope = async (scope: ScopeVisibilityType) => {
    try {
      await updateMessageScopeMutation.mutateAsync(scope);
    } catch (error) {
      console.error("Update message scope error:", error);
    }
  };

  const handleUpdateFollowersTabVisibility = async (scope: ScopeVisibilityType) => {
    try {
      await updateFollowersTabVisibilityMutation.mutateAsync(scope);
    } catch (error) {
      console.error("Update followers tab visibility error:", error);
    }
  };

  const handleUpdateFollowingTabVisibility = async (scope: ScopeVisibilityType) => {
    try {
      await updateFollowingTabVisibilityMutation.mutateAsync(scope);
    } catch (error) {
      console.error("Update following tab visibility error:", error);
    }
  };

  const handleUpdateFriendTabVisibility = async (scope: ScopeVisibilityType) => {
    try {
      await updateFriendTabVisibilityMutation.mutateAsync(scope);
    } catch (error) {
      console.error("Update friend tab visibility error:", error);
    }
  };

  const handleUpdateChatMessages = async (value: string) => {
    try {
      await updateChatMessagesMutation.mutateAsync(value);
    } catch (error) {
      console.error("Update chat messages error:", error);
    }
  };

  const handleUpdateComments = async (value: string) => {
    try {
      await updateCommentsMutation.mutateAsync(value);
    } catch (error) {
      console.error("Update comments error:", error);
    }
  };

  const handleUpdateUpvotes = async (value: string) => {
    try {
      await updateUpvotesMutation.mutateAsync(value);
    } catch (error) {
      console.error("Update upvotes error:", error);
    }
  };

  const handleUpdateNewFollowers = async (value: string) => {
    try {
      await updateNewFollowersMutation.mutateAsync(value);
    } catch (error) {
      console.error("Update new followers error:", error);
    }
  };

  const handleUpdateActivityFromFollowed = async (value: string) => {
    try {
      await updateActivityFromFollowedMutation.mutateAsync(value);
    } catch (error) {
      console.error("Update activity from followed error:", error);
    }
  };




  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: t("common.settingsPage") }]} />

        <div className="pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight">{t("common.settingsPage")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("settings.displayLanguageDesc")}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Left */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <nav className="space-y-1">
              {sidebarGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                return (
                  <div key={group.id} className="mb-4">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <span className="uppercase tracking-wider text-xs">
                        {group.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                      ) : (
                        <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 space-y-1">
                        {group.items.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.key;
                          return (
                            <button
                              key={tab.key}
                              onClick={() => setActiveTab(tab.key)}
                              className={[
                                "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                                isActive
                                  ? "bg-secondary text-secondary-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                              ].join(" ")}
                            >
                              <Icon
                                className={[
                                  "h-4.5 w-4.5",
                                  isActive ? "text-primary" : "",
                                ].join(" ")}
                              />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Content Right */}
          <main className="flex-1 min-h-150">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              {me?.id ? (
                <>
                  {activeTab === SettingTab.ACCCOUNT && (
                    <AccountSettingTab
                      onEditProfile={() => setProfileOpen(true)}
                      onChangePassword={() => setChangePasswordOpen(true)}
                      onSocialLinks={() => setSocialOpen(true)}
                      onDeleteAccount={() => setDeleteOpen(true)}
                      onSetPassword={() => setSetPasswordOpen(true)}
                      onSetTwoFactorAuth={handleTwoFactorAuthToggle}
                      me={me}
                    />
                  )}
                  {activeTab === SettingTab.PRIVACY && (
                    <PrivacySettingTab
                      onAllowFollow={handleAllowFollowToggle}
                      onUpdateMessageScope={handleUpdateMessageScope}
                      onUpdateFollowersTabVisibility={handleUpdateFollowersTabVisibility}
                      onUpdateFollowingTabVisibility={handleUpdateFollowingTabVisibility}
                      onUpdateFriendTabVisibility={handleUpdateFriendTabVisibility}
                      me={me}
                    />
                  )}
                  {activeTab === SettingTab.PREFERENCES && (
                    <PreferencesSettingTab />
                  )}
                  {activeTab === SettingTab.NOTIFICATIONS && (
                    <NotificationsSettingTab 
                      settings={notificationSettings}
                      isLoading={isLoadingNotifications}
                      onUpdateChatMessages={handleUpdateChatMessages}
                      onUpdateComments={handleUpdateComments}
                      onUpdateUpvotes={handleUpdateUpvotes}
                      onUpdateNewFollowers={handleUpdateNewFollowers}
                      onUpdateActivityFromFollowed={handleUpdateActivityFromFollowed}
                    />
                  )}


                  {activeTab === SettingTab.LEARNING && <LearningSettingTab />}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {t("profile.userNotFound")}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        me={me}
        onSuccess={(values) => console.log(values)}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        me={me}
        onSuccess={() => navigate(ROUTES.LOGIN.url)}
      />
      <SetPasswordDialog
        open={setPasswordOpen}
        onOpenChange={setSetPasswordOpen}
        me={me}
        onSuccess={() => navigate(ROUTES.LOGIN.url)}
      />
      <UserSocialDialog open={socialOpen} onOpenChange={setSocialOpen} />
      <TwoFactorAuthDialog
        open={twoFactorOpen}
        onOpenChange={setTwoFactorOpen}
        qrCode={qrCode}
      />
      <ConfirmModal

        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("common.confirm")}
        description={t("common.helpSoon")}
        onConfirm={handleDeleteConfirm}
        confirmText={t("common.confirm")}
        variant="destructive"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
