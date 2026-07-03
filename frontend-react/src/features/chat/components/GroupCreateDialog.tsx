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
import { Switch } from "@/shared/components/ui/switch";
import { useFriendsQuery } from "@/features/chat/api/chatService";
import { useCreateGroupMutation } from "@/features/chat/api/groupService";
import type { FriendItem } from "@/shared/validations/ChatSchema";
import {
  getCreateGroupSchema,
  type CreateGroupInput,
} from "@/shared/validations/GroupSchema";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { getInitials } from "../utils";
import { LanguagePicker } from "./LanguagePicker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};


export function GroupCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<FriendItem[]>([]);
  const createGroupMutation = useCreateGroupMutation();

  // Fetch all users once
  const { data: friends = [], isLoading: isLoadingFriends } = useFriendsQuery(open);

  // Client-side filtering
  const filteredResults = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => `${f.fullName || ""} ${f.username || ""}`.toLowerCase().includes(q));
  }, [friends, keyword]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(getCreateGroupSchema()),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
      members: [],
      languages: [],
    },
  });

  const isPublic = watch("isPublic");

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

  function addMember(u: FriendItem) {
    if (selectedIds.has(u.id)) return;
    setSelected((prev) => [...prev, u]);
  }

  function removeMember(userId: string) {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  }

  const onSubmit = async (values: CreateGroupInput) => {
    try {
      const { data: groupData } = await createGroupMutation.mutateAsync(values);
      const groupId = groupData?.id;

      onOpenChange(false);
      if (groupId) onCreated?.();
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("chat.createGroup")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">{t("chat.groupName")}</Label>
            <Input
              id="group-name"
              {...register("name")}
              placeholder={t("chat.groupNamePlaceholder")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-desc">{t("chat.descriptionOptional")}</Label>
            <Input
              id="group-desc"
              {...register("description")}
              placeholder={t("chat.descriptionPlaceholder")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("chat.languagesOptional") || "Languages (Optional)"}</Label>
            <LanguagePicker
              selected={watch("languages") || []}
              onChange={(langs) => setValue("languages", langs, { shouldDirty: true })}
              maxDisplayed={3}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="group-public">{t("chat.groupVisibility")}</Label>
              <p className="text-xs text-muted-foreground">
                {isPublic ? t("chat.publicGroupDesc") : t("chat.privateGroupDesc")}
              </p>
            </div>
            <Switch
              id="group-public"
              checked={!!isPublic}
              onCheckedChange={(checked) =>
                setValue("isPublic", checked, { shouldDirty: true })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("chat.addMembers")}</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("chat.searchMembersPlaceholder")}
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
                    title={t("chat.clickToRemove")}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(u.fullName || u.username)
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
              {isLoadingFriends ? (
                <div className="text-sm text-muted-foreground p-2 text-center italic">
                  {t("chat.loadingUsers")}
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  {t("chat.noUsersFound")}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResults.map((u: FriendItem) => {
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
                                {getInitials(u.fullName || u.username)}
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
                          {disabled ? t("chat.selected") : t("chat.add")}
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? t("chat.creating") : t("chat.createGroup")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
