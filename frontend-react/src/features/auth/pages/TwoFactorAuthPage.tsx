import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useLoginTwoFaMutation } from "@/features/auth/api/authService";
import {
  TwoFactorLoginSchema,
  type TwoFactorLoginBodyType,
} from "@/shared/validations/AuthSchema";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import ROUTES from "@/shared/lib/routes";
import { toast } from "sonner";

function TwoFactorAuthPage() {
  const tempToken = useAuthStore((state) => state.tempToken?.tempToken);
  const logout = useAuthStore((state) => state.logout);
  
  const navigate = useNavigate();
  const loginTwoFaMutation = useLoginTwoFaMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorLoginBodyType>({
    resolver: zodResolver(TwoFactorLoginSchema),
    defaultValues: {
      tempToken: tempToken || "",
      code: "",
    },
  });

  const onSubmit = async (data: TwoFactorLoginBodyType) => {
    try {
      await loginTwoFaMutation.mutateAsync(data);
      navigate(ROUTES.HOME.url, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    logout();
    navigate(ROUTES.LOGIN.url, { replace: true });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-muted">
      <div className="w-full max-w-md bg-card border text-card-foreground rounded-xl shadow-xl overflow-hidden p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Xác thực 2 yếu tố</h1>
          <p className="text-sm text-muted-foreground">
            Vui lòng nhập mã OTP từ ứng dụng xác thực của bạn để tiếp tục.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("tempToken")} />
          
          <div className="space-y-2">
            <Label htmlFor="code">Mã xác thực</Label>
            <Input
              id="code"
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              {...register("code")}
              autoFocus
              autoComplete="one-time-code"
            />
            {errors.code && (
              <p className="text-sm text-destructive text-center font-medium">
                {errors.code.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting || loginTwoFaMutation.isPending}
          >
            {isSubmitting || loginTwoFaMutation.isPending
              ? "Đang xác thực..."
              : "Xác nhận"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleCancel}
          >
            Quay lại đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}

export default TwoFactorAuthPage;