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
import { useState } from "react";
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


// Cấu trúc phân nhóm Sidebar
const sidebarGroups = [
  {
    title: "General",
    items: [
      { key: SettingTab.ACCCOUNT, label: "Account", icon: User },
      { key: SettingTab.PREFERENCES, label: "Preferences", icon: Edit },
    ],
  },
  {
    title: "Security & Privacy",
    items: [
      { key: SettingTab.PRIVACY, label: "Privacy", icon: Lock },
      { key: SettingTab.NOTIFICATIONS, label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Learning & Activity",
    items: [{ key: SettingTab.LEARNING, label: "Learning", icon: Goal }],
  },
];

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>(SettingTab.ACCCOUNT);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "General",
    "Security & Privacy",
    "Learning & Activity",
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
  const logout = useAuthStore((s) => s.logout);
  const disconnect = useSocketStore((s) => s.disconnect);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
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


  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Trang cài đặt" }]} />

        <div className="pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight">Trang cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và tùy chỉnh trải nghiệm học tập của bạn.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Left */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <nav className="space-y-1">
              {sidebarGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.title);
                return (
                  <div key={group.title} className="mb-4">
                    <button
                      onClick={() => toggleGroup(group.title)}
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
          <main className="flex-1 min-h-[600px]">
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
                  {activeTab === SettingTab.PRIVACY && <PrivacySettingTab />}
                  {activeTab === SettingTab.PREFERENCES && (
                    <PreferencesSettingTab />
                  )}
                  {activeTab === SettingTab.NOTIFICATIONS && (
                    <NotificationsSettingTab />
                  )}
                  {activeTab === SettingTab.LEARNING && <LearningSettingTab />}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Không tìm thấy thông tin người dùng.
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
        title="Xóa tài khoản"
        description="Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ vô hiệu hóa tài khoản của bạn và sau 30 ngày sẽ tự động xóa vĩnh viễn. Trong 30 ngày bạn có thể khôi phục tài khoản bằng cách đăng nhập lại."
        onConfirm={handleDeleteConfirm}
        confirmText="Xóa tài khoản"
        variant="destructive"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
