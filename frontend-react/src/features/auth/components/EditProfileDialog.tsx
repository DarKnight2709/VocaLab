import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

import {
  type MeResponse,
} from "@/shared/validations/AuthSchema";

import { getInitials } from "@/shared/lib/utils";
import { useUpdatePersonalInfoMutation } from "@/features/user/api/userService";
import { UpdatePersonalInfoSchema, type UpdatePersonalInfoBodyType } from "@/shared/validations/UserSchema";

export function EditProfileDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me: MeResponse | undefined | null;
  onSuccess?: (values: UpdatePersonalInfoBodyType) => void;
}) {
  const { open, onOpenChange, me, onSuccess } = props;

  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateProfileMutation = useUpdatePersonalInfoMutation();

  const displayName = useMemo(() => {
    return me?.fullName || me?.username || "User";
  }, [me]);

  const form = useForm<UpdatePersonalInfoBodyType>({
    resolver: zodResolver(UpdatePersonalInfoSchema),
    defaultValues: {
      fullName: me?.fullName || "",
      username: me?.username || "",
      email: me?.email || "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      fullName: me?.fullName || "",
      username: me?.username || "",
      email: me?.email || "",
    });
    setSelectedFile(null);
    setAvatarPreview(null);
  }, [open, me, form]);

  async function onSubmit(values: UpdatePersonalInfoBodyType) {
    if (!me) return;
    setSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        body: values,
        file: selectedFile || undefined,
      });
      onSuccess?.(values);
      onOpenChange(false);
    } catch (e: any) {
      // toast handled in hook
    } finally {
      setSaving(false);
    }
  }

  async function handlePickAvatar() {
    fileInputRef.current?.click();
  }

  function handleAvatarSelected(file?: File) {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const formState = form.formState;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông tin cá nhân</DialogTitle>
          <DialogDescription>
            Cập nhật họ tên, username, email và ảnh đại diện.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarPreview || me?.avatar || undefined} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePickAvatar}
              disabled={saving}
            >
              {selectedFile ? "Đã chọn ảnh" : "Đổi ảnh đại diện"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarSelected(e.target.files?.[0])}
            />
            <div className="text-xs text-muted-foreground">
              {selectedFile ? selectedFile.name : "PNG/JPG, chọn 1 file."}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-fullName">Họ tên</Label>
            <Input
              id="profile-fullName"
              {...form.register("fullName")}
              autoComplete="name"
            />
            {formState.errors.fullName && (
              <p className="text-sm text-destructive">
                {formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-username">Tên đăng nhập</Label>
            <Input
              id="profile-username"
              {...form.register("username")}
              autoComplete="username"
            />
            {formState.errors.username && (
              <p className="text-sm text-destructive">
                {formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              {...form.register("email")}
              autoComplete="email"
            />
            {formState.errors.email && (
              <p className="text-sm text-destructive">
                {formState.errors.email.message}
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
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
