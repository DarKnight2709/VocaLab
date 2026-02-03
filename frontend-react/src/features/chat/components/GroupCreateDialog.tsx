import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useUsersQuery } from "@/features/chat/api/chatService";
import { useCreateGroupMutation } from "@/features/chat/api/groupService";
import { toast } from "sonner";
import type { UserItem } from "@/shared/validations/ChatSchema";
import {
  CreateGroupSchema,
  type CreateGroupInput,
  type GroupItem,
} from "@/shared/validations/GroupSchema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: { groupId: string; memberIds: string[] }) => void;
};

function initials(name?: string) {
  const n = (name || "").trim();
  if (!n) return "?";
  return n
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function GroupCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<UserItem[]>([]);
  const createGroupMutation = useCreateGroupMutation();

  // Fetch all users once
  const { data: users = [], isLoading: loadingUsers } = useUsersQuery();

  // Client-side filtering
  const filteredResults = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.fullName || ""} ${u.username || ""}`.toLowerCase().includes(q));
  }, [users, keyword]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    // reset on open
    reset();
    setKeyword("");
    setSelected([]);
  }, [open, reset]);

  // Sync selected users with form 'members' field
  useEffect(() => {
    setValue(
      "members",
      selected.map((u) => u.id),
      { shouldDirty: true },
    );
  }, [selected, setValue]);

  const selectedIds = useMemo(
    () => new Set(selected.map((u) => u.id)),
    [selected],
  );

  function addMember(u: UserItem) {
    if (selectedIds.has(u.id)) return;
    setSelected((prev) => [...prev, u]);
  }

  function removeMember(userId: string) {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  }

  const onSubmit = async (values: CreateGroupInput) => {
    try {
      const data = await createGroupMutation.mutateAsync(values);

      const groupId = (data as GroupItem)?.id as string | undefined;
      toast.success("Tạo nhóm thành công");
      onOpenChange(false);
      if (groupId) onCreated?.({ groupId, memberIds: values.members });
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Tạo nhóm thất bại",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo nhóm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Tên nhóm</Label>
            <Input
              id="group-name"
              {...register("name")}
              placeholder="Nhập tên nhóm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-desc">Mô tả (tuỳ chọn)</Label>
            <Input
              id="group-desc"
              {...register("description")}
              placeholder="Nhập mô tả nhóm"
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Thêm thành viên</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm thành viên..."
            />
            {errors.members && (
              <p className="text-xs text-destructive">
                {errors.members.message}
              </p>
            )}

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selected.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => removeMember(u.id)}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-muted"
                    title="Bấm để xoá"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        initials(u.fullName || u.username)
                      )}
                    </span>
                    <span className="max-w-45 truncate">
                      {u.fullName || u.username}
                    </span>
                    <span className="text-muted-foreground ml-1">×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-lg border p-2 max-h-64 overflow-auto mt-2">
              {loadingUsers ? (
                <div className="text-sm text-muted-foreground p-2 text-center italic">
                  Đang tải danh sách người dùng...
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  Không tìm thấy người dùng nào
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResults.map((u: UserItem) => {
                    const disabled = selectedIds.has(u.id);
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt=""
                                className="h-9 w-9 object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {initials(u.fullName || u.username)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {u.fullName || u.username}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              @{u.username || ""}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={disabled ? "secondary" : "default"}
                          disabled={disabled}
                          onClick={() => addMember(u)}
                        >
                          {disabled ? "Đã chọn" : "Thêm"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? "Đang tạo..." : "Tạo nhóm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
