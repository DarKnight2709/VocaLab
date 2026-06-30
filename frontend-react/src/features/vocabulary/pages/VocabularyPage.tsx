import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MoreVertical,
  Plus,
  BookMarked,
  Layers,
  Pencil,
  Trash2,
  Download,
  Settings,
  Import,
  Globe,
  Lock,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { Switch } from "@/shared/components/ui/switch";
import ImportVocabularyDialog from "../components/ImportVocabularyDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { toast } from "sonner";
import {
  useCollectionsQuery,
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useUpdateCollectionMutation,
  type CardItem,
  type VocabCollection,
  type VocabCollectionDetail,
} from "../api/vocabularyService";
import { api, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import ROUTES from "@/shared/lib/routes";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function VocabularyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newColOpen, setNewColOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColIsPublic, setNewColIsPublic] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renamingCol, setRenamingCol] = useState<VocabCollection | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [renameIsPublic, setRenameIsPublic] = useState(true);

  const { data: colsData, isLoading: colsLoading } = useCollectionsQuery(true);
  const createColMutation = useCreateCollectionMutation();
  const deleteColMutation = useDeleteCollectionMutation();
  const updateColMutation = useUpdateCollectionMutation();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingColId, setDeletingColId] = useState<string | null>(null);

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    await createColMutation.mutateAsync({
      name: newColName,
      description: newColDesc || undefined,
      isPublic: newColIsPublic,
    });
    setNewColOpen(false);
    setNewColName("");
    setNewColDesc("");
    setNewColIsPublic(true);
  }

  async function handleRenameCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingCol) return;

    await updateColMutation.mutateAsync({
      id: renamingCol.id,
      body: {
        name: renameName,
        description: renameDesc || undefined,
        isPublic: renameIsPublic,
      },
    });

    setRenameOpen(false);
    setRenamingCol(null);
    setRenameName("");
    setRenameDesc("");
    setRenameIsPublic(true);
  }

  function getCardText(card: CardItem, side: "front" | "back") {
    const fieldsById = new Map(
      (card.cardType?.fields ?? []).map((field) => [field.id, field]),
    );

    const enriched = (card.values ?? []).map((item, index) => {
      const field = item.field ?? fieldsById.get(item.fieldId);
      return {
        value: item.value,
        side: field?.side ?? (index === 0 ? "front" : "back"),
        position: field?.order ?? index,
      };
    });

    return enriched
      .filter((item) => item.side === side)
      .sort((a, b) => a.position - b.position)
      .map((item) => item.value)
      .join(" | ");
  }

  async function handleExportCollection(collection: VocabCollection) {
    try {
      const res = await api.get<{ collection: VocabCollectionDetail }>(
        API_ROUTES.VOCABULARY.COLLECTION_DETAIL(collection.id),
      );

      const cards = res.data.collection.cards || [];
      if (cards.length === 0) {
        toast.info(t("vocabulary.noCardsToLearn"));
        return;
      }

      const toCsvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
      const csvRows = [
        "front,back",
        ...cards.map((card) =>
          [getCardText(card, "front"), getCardText(card, "back")]
            .map(toCsvCell)
            .join(","),
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeName = collection.name
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
      anchor.href = url;
      anchor.download = `${safeName || t("vocabulary.downloadFileName")}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success(t("vocabulary.csvExportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("vocabulary.csvExportFailed")));
    }
  }

  function openRenameDialog(collection: VocabCollection) {
    setRenamingCol(collection);
    setRenameName(collection.name);
    setRenameDesc(collection.description || "");
    setRenameIsPublic(collection.isPublic ?? true);
    setRenameOpen(true);
  }

  function openDeleteConfirm(id: string) {
    setDeletingColId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingColId) return;
    try {
      await deleteColMutation.mutateAsync(deletingColId);
      setDeleteConfirmOpen(false);
      setDeletingColId(null);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">

      <Breadcrumb items={[{ label: t("vocabulary.title") }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t("vocabulary.collectionsTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("vocabulary.collectionsDesc")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setNewColOpen(true)}
            className="gap-2"
            disabled={createColMutation.isPending}
          >
            <Plus className="h-4 w-4" /> {t("vocabulary.createCollection")}
          </Button>

          <Button
            onClick={() => setImportOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Import className="h-4 w-4" /> {t("vocabulary.importData")}
          </Button>

          <Button
            onClick={() => navigate("/vocabulary/card-types")}
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" /> {t("vocabulary.manageCardTypes")}
          </Button>
        </div>
      </div>

      {colsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {colsData?.collections.length === 0 && (
            <div className="col-span-full text-center py-16 border rounded-2xl bg-card text-muted-foreground">
              <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t("vocabulary.noCollections")}</p>
            </div>
          )}

          {colsData?.collections.map((col) => (
            <div
              key={col.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/vocabulary/${col.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/vocabulary/${col.id}`);
                }
              }}
              className="text-left w-full p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {col.name}
                    {col.isPublic ? (
                      <span title={t("vocabulary.public")}>
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      </span>
                    ) : (
                      <span title={t("vocabulary.private")}>
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {col.description}
                  </div>
                  {col.originId && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <span>{t("vocabulary.forkedFrom")} </span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(ROUTES.COLLECTION_DETAIL.url.replace(":collectionId", col.originId!));
                        }}
                        className="text-blue-500 hover:underline hover:text-blue-600 transition-colors"
                      >
                        {col.origin ? `${col.origin.user.username}/${col.origin.name}` : t("vocabulary.originalCollection")}
                      </button>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(col);
                      }}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" /> {t("vocabulary.rename")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCollection(col);
                      }}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />{" "}
                      {t("vocabulary.exportCsv")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm(col.id);
                      }}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> {t("vocabulary.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>
                  {col._count?.cards ?? 0} {t("vocabulary.cards")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("vocabulary.newCollection")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCollection} className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.collectionName")} *</Label>
              <Input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder={t("vocabulary.collectionNamePlaceholder")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vocabulary.description")}</Label>
              <Input
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder={t("vocabulary.descriptionPlaceholder")}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label>{t("vocabulary.visibility")}</Label>
                <div className="text-xs text-muted-foreground">
                  {newColIsPublic
                    ? t("vocabulary.publicDesc")
                    : t("vocabulary.privateDesc")}
                </div>
              </div>
              <Switch
                checked={newColIsPublic}
                onCheckedChange={setNewColIsPublic}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewColOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createColMutation.isPending}>
                {t("vocabulary.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("vocabulary.editCollection")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameCollection} className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.newName")} *</Label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder={t("vocabulary.collectionName")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vocabulary.description")}</Label>
              <Input
                value={renameDesc}
                onChange={(e) => setRenameDesc(e.target.value)}
                placeholder={t("vocabulary.descriptionPlaceholder")}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label>{t("vocabulary.visibility")}</Label>
                <div className="text-xs text-muted-foreground">
                  {renameIsPublic
                    ? t("vocabulary.publicDesc")
                    : t("vocabulary.privateDesc")}
                </div>
              </div>
              <Switch
                checked={renameIsPublic}
                onCheckedChange={setRenameIsPublic}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={updateColMutation.isPending}>
                {t("vocabulary.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImportVocabularyDialog open={importOpen} onOpenChange={setImportOpen} />

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteColMutation.isPending}
        title={t("vocabulary.deleteCollectionTitle")}
        description={t("vocabulary.deleteCollectionDesc")}
      />
    </div>
  );
}

