import { Button } from "@/shared/components/ui/button";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { User, Lock, Share2, Trash2, ShieldCheck, Key } from "lucide-react";

interface AccountSettingTabProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onSocialLinks: () => void;
  onDeleteAccount: () => void;
  onSetPassword: () => void;
  me: MeResponse | null | undefined;
}

export default function AccountSettingTab({
  onEditProfile,
  onChangePassword,
  onSocialLinks,
  onDeleteAccount,
  onSetPassword,
  me,
}: AccountSettingTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="font-medium">Hồ sơ công khai</p>
              <p className="text-sm text-muted-foreground">Cập nhật ảnh đại diện, tên hiển thị và tiểu sử của bạn.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onEditProfile}>
              Chỉnh sửa
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="font-medium">Mạng xã hội</p>
              <p className="text-sm text-muted-foreground">Kết nối các tài khoản mạng xã hội để hiển thị trên hồ sơ.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onSocialLinks}>
              <Share2 className="h-4 w-4 mr-2" />
              Liên kết
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Bảo mật</h2>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="font-medium">Mật khẩu</p>
              <p className="text-sm text-muted-foreground">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
            </div>
            { me?.hasPassword ? (
              <Button variant="outline" size="sm" onClick={onChangePassword}>
                <Lock className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onSetPassword}>
                <Key className="h-4 w-4 mr-2" />
                Thiết lập mật khẩu
              </Button>
            )
            }
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 opacity-60">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Xác thực 2 yếu tố (2FA)</p>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Sắp ra mắt</span>
              </div>
              <p className="text-sm text-muted-foreground">Thêm một lớp bảo mật bổ sung cho tài khoản của bạn.</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Thiết lập
            </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-6">
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-destructive">Khu vực nguy hiểm</p>
              <p className="text-sm text-muted-foreground">Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tài khoản
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
