import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useMemo } from "react";

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

import { useSetPasswordMutation } from "@/features/auth/api/authService";
import { getSetPasswordSchema } from "@/shared/validations/AuthSchema";
import type { MeResponse } from "@/shared/validations/AuthSchema";

// Schema mở rộng cho Form để có thêm Confirm Password
// Schema definition moved inside component
type SetPasswordFormValues = z.infer<ReturnType<typeof getSetPasswordSchema>> & {
  confirmPassword: string;
};

export function SetPasswordDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me?: MeResponse | undefined | null;
  onSuccess?: () => void;
}) {
  const { open, onOpenChange, onSuccess } = props;
  const { t } = useTranslation();

  const SetPasswordFormSchema = useMemo(() => 
    getSetPasswordSchema().extend({
      confirmPassword: z.string().trim().min(1, t("auth.reenterPassword")),
    }).refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    }), [t]
  );

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const setPasswordMutation = useSetPasswordMutation();

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(SetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [open, form]);

  async function onSubmit(values: SetPasswordFormValues) {
    setSaving(true);
    try {
      // Gọi mutation đặt mật khẩu mới
      await setPasswordMutation.mutateAsync({
        password: values.password,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      // Lỗi đã được xử lý trong hook bằng toast
    } finally {
      setSaving(false);
    }
  }

  const formState = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.setPassword")}</DialogTitle>
          <DialogDescription>
            {t("auth.setPasswordDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-new">{t("auth.newPassword")}</Label>
            <div className="relative">
              <Input
                id="password-new"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder={t("auth.enterPasswordMin6")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formState.errors.password && (
              <p className="text-sm text-destructive">
                {formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-confirm">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="password-confirm"
                type={showConfirmPassword ? "text" : "password"}
                {...form.register("confirmPassword")}
                placeholder={t("auth.confirmPasswordPlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("auth.processing") : t("auth.setPassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
