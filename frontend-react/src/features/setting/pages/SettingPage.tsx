import Breadcrumb from "@/shared/components/Breadcrumb";
import { SettingTab } from "@/shared/enums/SettingTab.enum";
import { Users, Bell, Lock, Edit, Goal, User } from "lucide-react";
import { useState } from "react";
import { useMeQuery } from "@/features/auth/api/authService";
import AccountSettingTab from "../components/setting-tabs/AccountSettingTab";
import PrivacySettingTab from "../components/setting-tabs/PrivacySettingTab";
import PreferencesSettingTab from "../components/setting-tabs/PreferencesSettingTab";
import NotificationsSettingTab from "../components/setting-tabs/NotificationsSettingTab";
import LearningSettingTab from "../components/setting-tabs/LearningSettingTab";
import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";


const settingTab: Array<{
  key: SettingTab;
  label: string;
  icon: typeof Users;
}> = [
  { key: SettingTab.ACCCOUNT, label: "Account", icon: User },
  { key: SettingTab.PRIVACY, label: "Privacy", icon: Lock },
  { key: SettingTab.PREFERENCES, label: "Preferences", icon: Edit },
  { key: SettingTab.NOTIFICATIONS, label: "Notifications", icon: Bell },
  { key: SettingTab.LEARNING, label: "Learning", icon: Goal },
];

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>(SettingTab.ACCCOUNT);

  const { data: me } = useMeQuery();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Trang cài đặt" }]} />
        <div>
          <h1 className="text-2xl font-bold">Trang cài đặt</h1>
        </div>
        <section className="mt-10 border-t pt-5">
          {/* Tab nav */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-1">
            <div className="flex items-center gap-1 overflow-x-auto">
              {settingTab.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                    }}
                    className={[
                      "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-base font-medium transition-colors",
                      isActive
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-8 min-h-80">
            {me?.id ? (
              <>
                {activeTab === SettingTab.ACCCOUNT && (
                  <AccountSettingTab
                    onEditProfile={() => setProfileOpen(true)}
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
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy người dùng.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <EditProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        me={me}
        onSuccess={(values) => {
          console.log(values);
          // const nextName =
          //   values.fullName ?? me?.fullName ?? me?.username ?? "user";
          // const nextProfileUrl = ROUTES.PROFILE.url.replace(
          //   ":username",
          //   encodeURIComponent(nextName),
          // );
          // navigate(nextProfileUrl, { replace: true });
        }}
      />
    </div>
  );
}
