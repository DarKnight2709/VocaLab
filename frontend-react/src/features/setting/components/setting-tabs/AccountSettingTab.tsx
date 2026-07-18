import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";

import type { MeResponse } from "@/shared/validations/AuthSchema";
import { User, Lock, Share2, Trash2, ShieldCheck, Key } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface AccountSettingTabProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onSocialLinks: () => void;
  onDeleteAccount: () => void;
  onSetPassword: () => void;
  onSetTwoFactorAuth: () => void;
  me: MeResponse | null | undefined;
}

export default function AccountSettingTab({
  onEditProfile,
  onChangePassword,
  onSocialLinks,
  onDeleteAccount,
  onSetPassword,
  onSetTwoFactorAuth,
  me,
}: AccountSettingTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("profile.title")}</h2>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 shadow-sm">
            <div>
              <p className="font-medium">{t("settings.publicProfile")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.publicProfileDesc")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onEditProfile}>
              {t("settings.editProfile")}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 shadow-sm">
            <div>
              <p className="font-medium">{t("settings.socialLinks")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.socialLinksDesc")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onSocialLinks}>
              <Share2 className="h-4 w-4 mr-2" />
              {t("settings.socialLinks")}
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("settings.security")}</h2>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 shadow-sm">
            <div>
              <p className="font-medium">{t("auth.password")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.securityDesc")}</p>
            </div>
            { me?.hasPassword ? (
              <Button variant="outline" size="sm" onClick={onChangePassword}>
                <Lock className="h-4 w-4 mr-2" />
                {t("settings.changePassword")}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onSetPassword}>
                <Key className="h-4 w-4 mr-2" />
                {t("settings.setPassword")}
              </Button>
            )
            }
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{t("settings.twoFactorAuth")}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t("settings.twoFactorAuthDesc")}</p>
            </div>
            <Switch
              checked={me?.isTwoFactorEnabled}
              onCheckedChange={onSetTwoFactorAuth}
              id="2fa-toggle"
            />

          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-6">
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-destructive">{t("settings.dangerZone")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.dangerZoneDesc")}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("settings.deleteAccount")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
