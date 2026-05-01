import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Link,
  Plus,
  X,
  Edit2,
  Globe,
  Loader2,
} from "lucide-react";
import {
  useMySocialsQuery,
  useCreateSocialMutation,
  useUpdateSocialMutation,
  useDeleteSocialMutation,
} from "@/features/user/api/userService";
import {
  type UserSocialItem,
  CreateUserSocialSchema,
  type CreateUserSocialBody,
} from "@/shared/validations/UserSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SocialPlatform } from "@/shared/enums/SocialPlatform";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface UserSocialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  [SocialPlatform.FACEBOOK]: <Facebook className="w-4 h-4 text-blue-600" />,
  [SocialPlatform.INSTAGRAM]: <Instagram className="w-4 h-4 text-pink-600" />,
  [SocialPlatform.TWITTER]: <Twitter className="w-4 h-4 text-sky-500" />,
  [SocialPlatform.YOUTUBE]: <Youtube className="w-4 h-4 text-red-600" />,
  [SocialPlatform.TIKTOK]: <Globe className="w-4 h-4 text-black" />,
  [SocialPlatform.LINKEDIN]: <Linkedin className="w-4 h-4 text-blue-700" />,
  [SocialPlatform.CUSTOM]: <Link className="w-4 h-4 text-gray-600" />,
};

export const UserSocialDialog: React.FC<UserSocialDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: socials, isLoading } = useMySocialsQuery();
  const socialResult = socials?.data;
  console.log()
  const createMutation = useCreateSocialMutation();
  const updateMutation = useUpdateSocialMutation();
  const deleteMutation = useDeleteSocialMutation();

  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserSocialBody>({
    resolver: zodResolver(CreateUserSocialSchema),
    defaultValues: {
      platform: SocialPlatform.FACEBOOK,
      name: "",
      link: "",
    },
  });

  const onSubmit = (values: CreateUserSocialBody) => {
    if (mode === "add") {
      createMutation.mutate(values, {
        onSuccess: () => {
          setMode("list");
          reset();
        },
      });
    } else if (mode === "edit" && editingId) {
      updateMutation.mutate(
        { id: editingId, body: values },
        {
          onSuccess: () => {
            setMode("list");
            setEditingId(null);
            reset();
          },
        },
      );
    }
  };

  const handleEdit = (social: UserSocialItem) => {
    reset({
      platform: social.platform,
      name: social.name || "",
      link: social.link,
    });
    setEditingId(social.id);
    setMode("edit");
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "list"
              ? "Liên kết mạng xã hội"
              : mode === "add"
              ? "Thêm liên kết mới"
              : "Chỉnh sửa liên kết"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" ? (
          <div className="py-4 space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : socialResult?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có liên kết nào.
                </div>
              ) : (
                socialResult?.map((social: UserSocialItem) => (
                  <div
                    key={social.id}
                    className="flex items-center justify-between p-3 rounded-lg border group hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {PLATFORM_ICONS[social.platform] || PLATFORM_ICONS[SocialPlatform.CUSTOM]}
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium leading-none truncate">
                          {social.name || social.platform}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {social.link}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(social)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(social.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending && editingId === social.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                reset({
                  platform: SocialPlatform.FACEBOOK,
                  name: "",
                  link: "",
                });
                setMode("add");
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm liên kết mới
            </Button>

            <DialogFooter>
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Nền tảng <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nền tảng" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SocialPlatform).map((p) => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            {PLATFORM_ICONS[p]}
                            <span>{p}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.platform && (
                <p className="text-xs font-medium text-destructive">
                  {errors.platform.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="social-name">Tên hiển thị</Label>
              <Input
                id="social-name"
                placeholder="Ví dụ: Portfolio của tôi"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="social-link">
                Đường dẫn (URL) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="social-link"
                placeholder="https://..."
                {...register("link")}
              />
              {errors.link && (
                <p className="text-xs font-medium text-destructive">
                  {errors.link.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode("list");
                  setEditingId(null);
                }}
              >
                Quay lại
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "add" ? "Thêm vào danh sách" : "Cập nhật"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
