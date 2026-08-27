import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MoreVertical,
  Plus,
  BookMarked,
  Pencil,
  Trash2,
  Download,
  Settings,
  Import,
  UploadCloud,
  Globe,
  Lock,
  LayoutGrid,
  List,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { Switch } from "@/shared/components/ui/switch";
import ImportVocabularyDialog from "../components/ImportVocabularyDialog";
import ImportAnkiDialog from "../components/ImportAnkiDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { LanguagePicker } from "@/features/chat/components/LanguagePicker";
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

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("vocab_view_mode") as "grid" | "list") || "grid";
  });

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("vocab_view_mode", mode);
  };

  const [newColOpen, setNewColOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColIsPublic, setNewColIsPublic] = useState(true);
  const [newColLanguages, setNewColLanguages] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [ankiImportOpen, setAnkiImportOpen] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renamingCol, setRenamingCol] = useState<VocabCollection | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [renameIsPublic, setRenameIsPublic] = useState(true);
  const [renameLanguages, setRenameLanguages] = useState<string[]>([]);

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
      languages: newColLanguages,
    });
    setNewColOpen(false);
    setNewColName("");
    setNewColDesc("");
    setNewColIsPublic(true);
    setNewColLanguages([]);
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
        languages: renameLanguages,
      },
    });

    setRenameOpen(false);
    setRenamingCol(null);
    setRenameName("");
    setRenameDesc("");
    setRenameIsPublic(true);
    setRenameLanguages([]);
  }

  function getCardText(card: CardItem, side: "front" | "back") {
    const fieldsById = new Map(
      (card.cardType?.fields ?? []).map((field) => [field.id, field]),
    );

    const enriched = (card.values ?? []).map((item, index) => {
      const field = item.field ?? fieldsById.get(item.fieldId);
      return {
        value: item.value,
        side: (field?.side ?? (index === 0 ? "front" : "back")).toLowerCase(),
        position: field?.order ?? index,
      };
    });

    return enriched
      .filter((item) => item.side === side.toLowerCase())
      .sort((a, b) => a.position - b.position)
      .map((item) => item.value)
      .join(" | ");
  }

  async function handleExportCollection(collection: VocabCollection) {
    try {
      const res = await api.get<VocabCollectionDetail>(
        API_ROUTES.VOCABULARY.COLLECTION_DETAIL(collection.id),
      );

      const cards = res.data?.cards || [];
      if (cards.length === 0) {
        toast.info(t("vocabulary.noCardsToLearn"));
        return;
      }

      const toCsvCell = (value: string) => `"${(value || "").replaceAll('"', '""')}"`;
      const csvRows = [
        "front,back",
        ...cards.map((card: CardItem) =>
          [getCardText(card, "front"), getCardText(card, "back")]
            .map(toCsvCell)
            .join(","),
        ),
      ];

      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
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
    setRenameLanguages(collection.languages || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t("vocabulary.collectionsTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("vocabulary.collectionsDesc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setNewColOpen(true)}
            className="gap-2 font-semibold shadow-xs"
            disabled={createColMutation.isPending}
          >
            <Plus className="h-4 w-4" /> {t("vocabulary.createCollection")}
          </Button>

          <Button
            onClick={() => setImportOpen(true)}
            variant="outline"
            className="gap-2 border-border/80 hover:bg-muted/80 font-medium"
          >
            <Import className="h-4 w-4 text-primary" /> {t("vocabulary.importData")}
          </Button>

          <Button
            onClick={() => setAnkiImportOpen(true)}
            variant="outline"
            className="gap-2 border-border/80 hover:bg-muted/80 font-medium"
          >
            <UploadCloud className="h-4 w-4 text-primary" /> {t("vocabulary.importAnki", { defaultValue: "Import Anki (.apkg)" })}
          </Button>

          <Button
            onClick={() => navigate("/vocabulary/card-types")}
            variant="outline"
            className="gap-2 border-border/80 hover:bg-muted/80 font-medium"
          >
            <Settings className="h-4 w-4 text-emerald-500" /> {t("vocabulary.manageCardTypes")}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/80 shrink-0">
            <button
              type="button"
              onClick={() => handleSetViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {colsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-muted/60 animate-pulse"
            />
          ))}
        </div>
      ) : colsData?.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-card shadow-xs text-muted-foreground border border-dashed border-border">
          <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
          <p>{t("vocabulary.noCollections")}</p>
        </div>
      ) : viewMode === "list" ? (
        /* List / Row View */
        <div className="flex flex-col gap-3">
          {colsData?.map((col) => (
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
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {col.name}
                    </h3>
                    {col.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full" title={t("vocabulary.public")}>
                        <Globe className="h-3 w-3" />
                        <span>{t("vocabulary.public") || "Public"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full" title={t("vocabulary.private")}>
                        <Lock className="h-3 w-3" />
                        <span>{t("vocabulary.private") || "Private"}</span>
                      </span>
                    )}
                  </div>
                  {col.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xl">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <span className="font-semibold text-xs px-3 py-1 rounded-full bg-muted/70 text-muted-foreground">
                  {col._count?.cards ?? 0} {t("vocabulary.cards")}
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
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
                        <Pencil className="h-4 w-4 text-primary" /> {t("vocabulary.rename")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCollection(col);
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4 text-emerald-500" />{" "}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          {colsData?.map((col) => {
            return (
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
                className="group relative text-left w-full p-5 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-lg truncate flex items-center gap-2.5">
                      <div className="p-2 rounded-xl shrink-0 bg-primary/10 text-primary border border-primary/20">
                        <BookMarked className="h-4.5 w-4.5" />
                      </div>
                      <span className="truncate group-hover:text-primary transition-colors">{col.name}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground">
                        {col._count?.cards ?? 0} {t("vocabulary.cards")}
                      </span>

                      {col.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full" title={t("vocabulary.public")}>
                          <Globe className="h-3 w-3" />
                          <span>{t("vocabulary.public") || "Public"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full" title={t("vocabulary.private")}>
                          <Lock className="h-3 w-3" />
                          <span>{t("vocabulary.private") || "Private"}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {col.description || (
                        <span className="italic opacity-60">
                          {t("common.noDescription")}
                        </span>
                      )}
                    </div>

                    {col.originId && (
                      <div className="mt-2.5 text-xs text-muted-foreground flex items-center gap-1">
                        <span>{t("vocabulary.forkedFrom")} </span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(ROUTES.COLLECTION_DETAIL.url.replace(":collectionId", col.originId!));
                          }}
                          className="text-primary hover:underline font-medium transition-colors"
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
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
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
                        <Pencil className="h-4 w-4 text-primary" /> {t("vocabulary.rename")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCollection(col);
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4 text-emerald-500" />{" "}
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
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("vocabulary.newCollection")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCollection} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.collectionName")} *</Label>
              <Input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder={t("vocabulary.collectionNamePlaceholder")}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vocabulary.description")}</Label>
              <Input
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder={t("vocabulary.descriptionPlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("chat.languagesOptional") || "Languages (Optional)"}</Label>
              <LanguagePicker
                selected={newColLanguages}
                onChange={setNewColLanguages}
                maxDisplayed={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
              <div className="space-y-0.5">
                <Label className="font-semibold text-sm">{t("vocabulary.visibility")}</Label>
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
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl font-semibold"
                onClick={() => setNewColOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={createColMutation.isPending}
                className="rounded-xl font-semibold shadow-xs"
              >
                {t("vocabulary.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("vocabulary.editCollection")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameCollection} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.newName")} *</Label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder={t("vocabulary.collectionName")}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vocabulary.description")}</Label>
              <Input
                value={renameDesc}
                onChange={(e) => setRenameDesc(e.target.value)}
                placeholder={t("vocabulary.descriptionPlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("chat.languagesOptional") || "Languages (Optional)"}</Label>
              <LanguagePicker
                selected={renameLanguages}
                onChange={setRenameLanguages}
                maxDisplayed={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
              <div className="space-y-0.5">
                <Label className="font-semibold text-sm">{t("vocabulary.visibility")}</Label>
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
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl font-semibold"
                onClick={() => setRenameOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={updateColMutation.isPending}
                className="rounded-xl font-semibold shadow-xs"
              >
                {t("vocabulary.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImportVocabularyDialog open={importOpen} onOpenChange={setImportOpen} />
      <ImportAnkiDialog open={ankiImportOpen} onOpenChange={setAnkiImportOpen} />

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

