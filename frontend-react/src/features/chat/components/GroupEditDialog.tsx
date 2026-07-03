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
import { useTranslation } from "@/shared/hooks/useTranslation";
import { LanguagePicker } from "./LanguagePicker";

export type GroupBasicInfo = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  languages?: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
  initial?: GroupBasicInfo | null;
  onUpdated?: (group: GroupBasicInfo) => void;
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<GroupBasicInfo | null>(initial || null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const groupName = useMemo(() => group?.name || "Group", [group]);
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
      setLanguages(initial.languages || []);
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
      toast.error(t("chat.groupNameEmpty"));
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmed,
      description: description,
      languages: languages,
    };
    try {
      setSaving(true);
      const result = await updateGroupMutation.mutateAsync({ groupId, payload, file: selectedFile || undefined });
      const updated = result.data;
      const basicInfo: GroupBasicInfo = {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        avatar: updated.avatar,
        languages: updated.languages,
      };
      setGroup(basicInfo);
      onUpdated?.(basicInfo);
      onOpenChange(false);
    } catch (e: any) {
      // toast is already handled by useUpdateGroupMutation
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("chat.editGroup")}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">{t("chat.loading")}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="group relative cursor-pointer overflow-hidden rounded-full border-4 border-background transition hover:opacity-80 disabled:cursor-not-allowed"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving || loading}
                title={t("chat.changePhoto")}
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatarPreview || group?.avatar || undefined} />
                  <AvatarFallback>{initials(groupName)}</AvatarFallback>
                </Avatar>
              </button>
              <div className="text-sm text-muted-foreground">
                {t("chat.clickToChangePhoto")}
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
              <div className="text-sm font-medium">{t("chat.groupName")}</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("chat.groupNamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">{t("chat.description")}</div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("chat.descriptionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">{t("chat.languagesOptional") || "Languages (Optional)"}</div>
              <LanguagePicker
                selected={languages}
                onChange={setLanguages}
                maxDisplayed={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !groupId}
              >
                {saving ? t("common.processing") : t("grammar.update")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
