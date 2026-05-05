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

import { useSetPasswordMutation } from "@/features/auth/api/authService";
import { SetPasswordSchema } from "@/shared/validations/AuthSchema";
import type { MeResponse } from "@/shared/validations/AuthSchema";

// Schema mở rộng cho Form để có thêm Confirm Password
const SetPasswordFormSchema = SetPasswordSchema.extend({
  confirmPassword: z.string().trim().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type SetPasswordFormValues = z.infer<typeof SetPasswordFormSchema>;

export function SetPasswordDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me?: MeResponse | undefined | null;
  onSuccess?: () => void;
}) {
  const { open, onOpenChange, onSuccess } = props;

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
          <DialogTitle>Thiết lập mật khẩu</DialogTitle>
          <DialogDescription>
            Vì bạn đăng nhập bằng Google, hãy thiết lập mật khẩu để có thể đăng nhập bằng Email sau này.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-new">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password-new"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder="Nhập mật khẩu ít nhất 6 ký tự"
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
            <Label htmlFor="password-confirm">Nhập lại mật khẩu</Label>
            <div className="relative">
              <Input
                id="password-confirm"
                type={showConfirmPassword ? "text" : "password"}
                {...form.register("confirmPassword")}
                placeholder="Xác nhận lại mật khẩu"
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
              {saving ? "Đang xử lý..." : "Thiết lập mật khẩu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
