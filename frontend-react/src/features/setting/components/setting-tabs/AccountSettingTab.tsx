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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-base font-extrabold text-foreground">{t("profile.title")}</h2>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">{t("settings.publicProfile")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.publicProfileDesc")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditProfile}
              className="h-8.5 rounded-xl border-border/80 px-4 text-xs font-bold shadow-xs hover:bg-muted cursor-pointer shrink-0"
            >
              {t("settings.editProfile")}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">{t("settings.socialLinks")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.socialLinksDesc")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSocialLinks}
              className="h-8.5 rounded-xl border-border/80 px-4 text-xs font-bold shadow-xs hover:bg-muted cursor-pointer shrink-0"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              <span>{t("settings.socialLinks")}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-base font-extrabold text-foreground">{t("settings.security")}</h2>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">{t("auth.password")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.securityDesc")}</p>
            </div>
            { me?.hasPassword ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onChangePassword}
                className="h-8.5 rounded-xl border-border/80 px-4 text-xs font-bold shadow-xs hover:bg-muted cursor-pointer shrink-0"
              >
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                <span>{t("settings.changePassword")}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onSetPassword}
                className="h-8.5 rounded-xl border-border/80 px-4 text-xs font-bold shadow-xs hover:bg-muted cursor-pointer shrink-0"
              >
                <Key className="h-3.5 w-3.5 mr-1.5" />
                <span>{t("settings.setPassword")}</span>
              </Button>
            )
            }
          </div>

          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">{t("settings.twoFactorAuth")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.twoFactorAuthDesc")}</p>
            </div>
            <Switch
              checked={me?.isTwoFactorEnabled}
              onCheckedChange={onSetTwoFactorAuth}
              id="2fa-toggle"
              className="cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3 pt-2">
        <div className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-destructive">{t("settings.dangerZone")}</p>
            <p className="text-xs text-muted-foreground">{t("settings.dangerZoneDesc")}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteAccount}
            className="h-8.5 rounded-xl px-4 text-xs font-bold shadow-xs cursor-pointer shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>{t("settings.deleteAccount")}</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
