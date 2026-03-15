import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useUpdateGroupMutation } from "@/features/chat/api/groupService";
import type { GroupItem } from "@/shared/validations/GroupSchema";

type GroupInfo = Partial<GroupItem> & { id: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
  initial?: GroupInfo | null;
  onUpdated?: (group: GroupInfo) => void;
};

function initials(name?: string) {
  const n = (name || "").trim();
  if (!n) return "?";
  return n
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function GroupEditDialog({
  open,
  onOpenChange,
  groupId,
  initial,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<GroupInfo | null>(initial || null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const groupName = useMemo(() => group?.name || "Nhóm", [group]);
  const updateGroupMutation = useUpdateGroupMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedFile(null);
    setAvatarPreview(null);

    if (initial) {
      setGroup(initial);
      setName(initial.name || "");
      setDescription(initial.description || "");
      return;
    }

    // If we don't have initial data, just show loading=false; fetching is handled by GroupInfoDialog and passed via `initial`.
    // This keeps UI simple and avoids duplicating group info fetch here.
    if (!groupId) return;
    setLoading(false);
  }, [open, groupId, initial]);

  async function handlePickFile(file?: File) {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!groupId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Tên nhóm không được để trống");
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmed,
      description: description,
    };
    try {
      setSaving(true);
      const data = await updateGroupMutation.mutateAsync({ groupId, payload, file: selectedFile || undefined });
      const updated = ((data as any)?.group as GroupInfo | undefined) || {
        id: groupId,
        name: trimmed,
        description,
        avatar: avatarPreview || group?.avatar,
      };
      setGroup(updated);
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (e: any) {
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="group relative cursor-pointer overflow-hidden rounded-full border-4 border-background transition hover:opacity-80 disabled:cursor-not-allowed"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving || loading}
                title="Đổi ảnh nhóm"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatarPreview || group?.avatar || undefined} />
                  <AvatarFallback>{initials(groupName)}</AvatarFallback>
                </Avatar>
              </button>
              <div className="text-sm text-muted-foreground">
                Bấm avatar để đổi ảnh
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handlePickFile(f);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Tên nhóm</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhóm"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Mô tả</div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !groupId}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
