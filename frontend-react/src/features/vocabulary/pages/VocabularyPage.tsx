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
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
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

export default function VocabularyPage() {
  const navigate = useNavigate();

  const [newColOpen, setNewColOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renamingCol, setRenamingCol] = useState<VocabCollection | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");

  const { data: colsData, isLoading: colsLoading } = useCollectionsQuery();
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
    });
    setNewColOpen(false);
    setNewColName("");
    setNewColDesc("");
  }

  async function handleRenameCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!renamingCol) return;

    await updateColMutation.mutateAsync({
      id: renamingCol.id,
      body: {
        name: renameName,
        description: renameDesc || undefined,
      },
    });

    setRenameOpen(false);
    setRenamingCol(null);
    setRenameName("");
    setRenameDesc("");
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
        position: field?.position ?? field?.order ?? index,
      };
    });

    return enriched
      .filter((item) => item.side === side)
      .sort((a, b) => b.position - a.position)
      .map((item) => item.value)
      .join(" | ");
  }

  async function handleExportCollection(collection: VocabCollection) {
    try {
      const res = await api.get<{ collection: VocabCollectionDetail }>(
        API_ROUTES.VOCABULARY.COLLECTION_CARDS(collection.id),
      );

      const cards = res.data.collection.cards || [];
      if (cards.length === 0) {
        toast.info("Collection này chưa có card để xuất");
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
      anchor.download = `${safeName || "vocabulary-collection"}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success("Xuất CSV thành công");
    } catch (error) {
      toast.error(getErrorMessage(error, "Xuất CSV thất bại"));
    }
  }

  function openRenameDialog(collection: VocabCollection) {
    setRenamingCol(collection);
    setRenameName(collection.name);
    setRenameDesc(collection.description || "");
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
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[{ label: "Từ vựng" }]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bộ sưu tập từ vựng</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Chọn một bộ sưu tập để mở trang học riêng của bộ đó.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setNewColOpen(true)}
              className="gap-2"
              disabled={createColMutation.isPending}
            >
              <Plus className="h-4 w-4" /> Tạo collection
            </Button>

            <Button
              onClick={() => setImportOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Import className="h-4 w-4" /> Nhập dữ liệu
            </Button>

            <Button
              onClick={() => navigate('/vocabulary/card-types')}
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" /> Quản lý kiểu thẻ
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
                <p>Chưa có collection nào</p>
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
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{col.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {col.description}
                    </div>
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
                        <Pencil className="h-4 w-4" /> Đổi tên
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCollection(col);
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" /> Xuất CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(col.id);
                        }}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>{col._count?.cards ?? 0} cards</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tạo collection mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCollection} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tên collection *</Label>
              <Input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="VD: IELTS Vocabulary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder="Mô tả ngắn..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewColOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createColMutation.isPending}>
                Tạo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi tên collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameCollection} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tên mới *</Label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="Tên collection"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input
                value={renameDesc}
                onChange={(e) => setRenameDesc(e.target.value)}
                placeholder="Mô tả ngắn..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateColMutation.isPending}>
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImportVocabularyDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteColMutation.isPending}
        title="Xóa bộ sưu tập"
        description="Toàn bộ thẻ trong bộ sưu tập này sẽ bị xóa vĩnh viễn và không thể khôi phục."
      />
    </div>
  );
}
