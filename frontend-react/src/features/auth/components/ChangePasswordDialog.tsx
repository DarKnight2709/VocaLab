import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { useChangePasswordMutation } from "@/features/auth/api/authService";
import { ChangePasswordSchema } from "@/shared/validations/AuthSchema";
import type { MeResponse } from "@/shared/validations/AuthSchema";

const ChangePasswordFormSchema = ChangePasswordSchema.extend({
  confirmPassword: z.string().trim().min(1, "Vui lòng nhập lại mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof ChangePasswordFormSchema>;

export function ChangePasswordDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me?: MeResponse | undefined | null;
  onSuccess?: () => void;
}) {
  const { open, onOpenChange, onSuccess } = props;

  const [saving, setSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const changePasswordMutation = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [open, form]);

  async function onSubmit(values: ChangePasswordFormValues) {
    setSaving(true);
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      // toast handled in hook
    } finally {
      setSaving(false);
    }
  }

  const formState = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Cập nhật mật khẩu mới cho tài khoản của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-old">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                id="password-old"
                type={showOldPassword ? "text" : "password"}
                {...form.register("oldPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formState.errors.oldPassword && (
              <p className="text-sm text-destructive">
                {formState.errors.oldPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-new">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password-new"
                type={showNewPassword ? "text" : "password"}
                {...form.register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formState.errors.newPassword && (
              <p className="text-sm text-destructive">
                {formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-confirm">Nhập lại mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password-confirm"
                type={showConfirmPassword ? "text" : "password"}
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
