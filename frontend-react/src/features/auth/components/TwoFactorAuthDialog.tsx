import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useVerifyTwoFactorAuthMutation } from "@/features/auth/api/authService";


interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string | null;
  onSuccess?: () => void;
}

export function TwoFactorAuthDialog({
  open,
  onOpenChange,
  qrCode,
  onSuccess,
}: TwoFactorAuthDialogProps) {
  const [otp, setOtp] = useState("");
  const verifyMutation = useVerifyTwoFactorAuthMutation();


  const handleVerify = async () => {
    if (!otp || otp.length < 6) return;
    
    try {
      await verifyMutation.mutateAsync(otp);

      setOtp("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("2FA Verification error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-90 p-0 overflow-hidden">
        <div className="p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Thiết lập 2FA</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Sử dụng <b>Google Authenticator</b> hoặc <b>Authy</b> để quét mã QR và bảo mật tài khoản.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4">
            {qrCode ? (
              <div className="p-2 rounded-lg shadow-inner border bg-muted/20">
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 select-none"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center px-4">
                  Đang tạo mã...
                </p>
              </div>
            )}

            <div className="w-full space-y-2">
              <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span>
                  <p className="text-muted-foreground">Mở ứng dụng xác thực (Google Authenticator, Authy,...) trên điện thoại.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</span>
                  <p className="text-muted-foreground">Chọn quét mã QR và quét hình ảnh trên.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">3</span>
                  <div className="space-y-3 flex-1">
                    <p className="text-muted-foreground">Nhập mã xác thực từ ứng dụng và nhấn xác nhận.</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã 6 số"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="text-center font-mono tracking-[0.5em] text-lg h-10"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleVerify}
                        disabled={otp.length < 6 || verifyMutation.isPending}
                        className="h-10"
                      >
                        {verifyMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Xác nhận"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
