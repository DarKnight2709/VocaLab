import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BookOpenText,
  Eye,
  Layers,
  Plus,
  Import,
  Pencil,
  Trash2,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  useCollectionCardsQuery,
  useDeleteCardMutation,
  type CardItem,
} from "../api/vocabularyService";
import ImportVocabularyDialog from "../components/ImportVocabularyDialog";
import EditCardDialog from "../components/EditCardDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { Button } from "@/shared/components/ui/button";

export default function VocabularyCollectionPage() {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();

  const [mode, setMode] = useState<"preview" | "learn">("preview");
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data, isLoading } = useCollectionCardsQuery(collectionId || null);
  const deleteMutation = useDeleteCardMutation(collectionId || "");

  const handleEdit = (card: CardItem) => {
    setEditingCard(card);
    setEditOpen(true);
  };

  const handleDeleteClick = (cardId: string) => {
    setDeletingCardId(cardId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCardId) {
      await deleteMutation.mutateAsync(deletingCardId);
      setDeleteConfirmOpen(false);
      setDeletingCardId(null);
    }
  };

  const cards: CardItem[] = useMemo(
    () => data?.collection.cards ?? [],
    [data?.collection.cards],
  );

  const CardFace = ({ 
    card, 
    side, 
    className, 
    useStyles = true 
  }: { 
    card: CardItem; 
    side: "front" | "back"; 
    className?: string;
    useStyles?: boolean;
  }) => {
    const fieldsById = new Map(
      (card.cardType?.fields ?? []).map((field) => [field.id, field]),
    );

    const entries = (card.values ?? [])
      .map((item) => {
        const field = item.field ?? fieldsById.get(item.fieldId);
        const normalizedSide = String(field?.side).toLowerCase();
        return {
          value: item.value,
          side: normalizedSide,
          order: field?.order ?? 0,
          color: field?.color,
          fontSize: field?.fontSize,
        };
      })
      .filter((item) => item.side === side)
      .sort((a, b) => a.order - b.order);

    return (
      <div className={className}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="whitespace-pre-line leading-snug"
            style={useStyles ? {
              color: entry.color || "inherit",
              fontSize: entry.fontSize ? Number(entry.fontSize) + "px" : "inherit",
              fontWeight: entry.fontSize ? '500' : 'inherit',
            } : {}}
          >
            {entry.value}
          </div>
        ))}
        {entries.length === 0 && <div className="text-muted-foreground italic text-xs">Trống</div>}
      </div>
    );
  };



  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Breadcrumb 
          items={[
            { label: "Từ vựng", href: "/vocabulary" },
            { label: isLoading ? "Đang tải..." : data?.collection.name || "Bộ sưu tập" }
          ]} 
        />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">
              {isLoading ? "Đang tải..." : data?.collection.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "" : data?.collection.description}
            </p>
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>{cards.length} cards</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              variant={mode === "preview" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setMode("preview")}
            >
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button
              variant={mode === "learn" ? "default" : "outline"}
              className="gap-2"
              onClick={() => {
                setMode("learn");
                setFlipped(false);
              }}
            >
              <BookOpenText className="h-4 w-4" /> Learn
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setImportOpen(true)}
            >
              <Import className="h-4 w-4" /> Import
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate(`/vocabulary/${collectionId}/add-card`)}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {mode === "preview" ? (
          <div className="space-y-2">
            {cards.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
                Collection chưa có card nào.
              </div>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="group relative rounded-xl border bg-card p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-xs text-muted-foreground mb-1">
                      {card.cardType?.name ?? "Card type"}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(card)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteClick(card.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                    <CardFace card={card} side="front" className="font-semibold" useStyles={false} />
                    <div className="w-px self-stretch bg-border" aria-hidden="true" />
                    <CardFace card={card} side="back" className="text-muted-foreground" useStyles={false} />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {cards.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
                Collection chưa có card nào để học.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div
                    className="relative h-64 [perspective:2000px] cursor-pointer group"
                    onClick={() => setFlipped((f) => !f)}
                  >
                    <div 
                      className={`relative w-full h-full duration-300 [transform-style:preserve-3d] transition-transform ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
                    >
                      {/* Front Face */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden">
                        <div className="text-center">
                          <CardFace 
                            card={cards[flashcardIdx]} 
                            side="front"
                            className="text-base font-medium"
                          />
                        </div>
                        <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          Mặt trước
                        </div>
                      </div>

                      {/* Back Face */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden border-primary/10">
                        <div className="text-center">
                          <CardFace 
                            card={cards[flashcardIdx]} 
                            side="back"
                            className="text-base font-medium"
                          />
                        </div>
                        <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary uppercase tracking-widest font-bold">
                          Mặt sau
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                    Thẻ {flashcardIdx + 1} / {cards.length} • Nhấn vào thẻ để lật
                  </div>
                </div>

                <div className="flex justify-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFlashcardIdx((i) => Math.max(0, i - 1));
                      setFlipped(false);
                    }}
                    disabled={flashcardIdx === 0}
                  >
                    ← Trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFlashcardIdx((i) => Math.min(cards.length - 1, i + 1));
                      setFlipped(false);
                    }}
                    disabled={flashcardIdx === cards.length - 1}
                  >
                    Sau →
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ImportVocabularyDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultCollectionId={collectionId}
      />

      <EditCardDialog
        card={editingCard}
        open={editOpen}
        onOpenChange={setEditOpen}
        collectionId={collectionId || ""}
      />

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Xóa thẻ từ vựng"
        description="Bạn có chắc chắn muốn xóa thẻ này khỏi bộ sưu tập? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
