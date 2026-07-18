import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BookOpenText,
  Eye,
  Layers,
  Plus,
  Import,
  Pencil,
  Trash2,
  Globe,
  Lock,
  PenLine,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  useCollectionDetailQuery,
  useDeleteCardMutation,
  useUpdateCollectionMutation,
  useCollectionDueCardsQuery,
  useReviewCardMutation,
  type CardItem,
} from "../api/vocabularyService";
import type { SrsRating } from "@/shared/enums/SrsRating.enum";
import ImportVocabularyDialog from "../components/ImportVocabularyDialog";
import EditCardDialog from "../components/EditCardDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { useCollectionStatsQuery } from "@/features/stats/api/statsService";
import { HeatMapChart } from "@/features/stats/components/HeatMapChart";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import ROUTES from "@/shared/lib/routes";
import PracticeMode from "../components/PracticeMode";

export default function VocabularyCollectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { collectionId } = useParams<{ collectionId: string }>();

  const [mode, setMode] = useState<"preview" | "learn" | "practice">("preview");
  const [isStudying, setIsStudying] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [sessionCards, setSessionCards] = useState<CardItem[]>([]);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const { data, isLoading } = useCollectionDetailQuery(collectionId || null);
  const { data: statsData } = useCollectionStatsQuery(collectionId || "");
  const deleteMutation = useDeleteCardMutation(collectionId || "");
  const updateCollectionMutation = useUpdateCollectionMutation();

  const { data: dueCardsData } = useCollectionDueCardsQuery(
    collectionId || "",
    mode === "learn"
  );
  const reviewMutation = useReviewCardMutation();

  useEffect(() => {
    if (mode === "learn" && dueCardsData && !sessionInitialized) {
      setSessionCards(dueCardsData);
      setFlashcardIdx(0);
      setFlipped(false);
      setSessionInitialized(true);
    }
  }, [mode, dueCardsData, sessionInitialized]);

  const handleRating = async (rating: SrsRating) => {
    const currentCard = sessionCards[flashcardIdx];
    if (!currentCard || !collectionId) return;

    // Mutate backend
    reviewMutation.mutate({
      cardId: currentCard.id,
      collectionId,
      rating,
    });

    // Update local study queue
    if (rating === "AGAIN") {
      // Forgotten: move card to the end of the session queue
      setSessionCards((prev) => {
        const next = [...prev];
        next.splice(flashcardIdx, 1);
        next.push(currentCard);
        return next;
      });
      setFlipped(false);
    } else {
      // Recalled: remove it from the session queue
      setSessionCards((prev) => {
        const next = [...prev];
        next.splice(flashcardIdx, 1);
        return next;
      });
      // Adjust index if we were on the last card
      if (flashcardIdx >= sessionCards.length - 1) {
        setFlashcardIdx(Math.max(0, sessionCards.length - 2));
      }
      setFlipped(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (data && collectionId) {
      await updateCollectionMutation.mutateAsync({
        id: collectionId,
        body: { isPublic: !data.isPublic },
      });
    }
  };

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
    () => data?.cards ?? [],
    [data?.cards],
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
        {entries.length === 0 && <div className="text-muted-foreground italic text-xs">{t("vocabulary.emptyFieldValue")}</div>}
      </div>
    );
  };



  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          { label: isLoading ? t("vocabulary.loading") : data?.name || t("vocabulary.collectionsTitle") }
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">
              {isLoading ? t("vocabulary.loading") : data?.name}
            </h1>
            {!isLoading && data && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                data.isPublic 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
                {data.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {data.isPublic ? t("vocabulary.public") : t("vocabulary.private")}
              </span>
            )}
          </div>
          <div className="flex flex-col mt-1">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "" : data?.description}
            </p>
            {data?.originId && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 bg-muted/40 w-fit px-2 py-1 rounded-md border">
                <span>{t("vocabulary.forkedFrom")} </span>
                <button 
                  type="button"
                  onClick={() => navigate(ROUTES.COLLECTION_DETAIL.url.replace(":collectionId", data.originId!))}
                  className="text-blue-500 hover:underline hover:text-blue-600 transition-colors font-medium"
                >
                  {data.origin ? `${data.origin.user.username}/${data.origin.name}` : t("vocabulary.originalCollection")}
                </button>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              <span>{cards.length} {t("vocabulary.cards")}</span>
            </div>
            {!isLoading && data && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{data.newCount + data.dueCount} {t("vocabulary.total") || "Total"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>{data.newCount} {t("vocabulary.new") || "New"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{data.dueCount} {t("vocabulary.due") || "Due"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {!isLoading && data && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleToggleVisibility}
              disabled={updateCollectionMutation.isPending}
            >
              {data.isPublic ? (
                <>
                  <Lock className="h-4 w-4" /> {t("vocabulary.makePrivate")}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" /> {t("vocabulary.publish")}
                </>
              )}
            </Button>
          )}
          <Button
            variant={mode === "preview" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setMode("preview")}
          >
            <Eye className="h-4 w-4" /> {t("vocabulary.preview")}
          </Button>
          <Button
            variant={mode === "learn" ? "default" : "outline"}
            className="gap-2"
            onClick={() => {
              setMode("learn");
              setIsStudying(false);
              setFlipped(false);
              setSessionInitialized(false);
            }}
          >
            <BookOpenText className="h-4 w-4" /> {t("vocabulary.learn")}
            {!isLoading && data && data.dueCount + data.newCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full leading-none">
                {data.dueCount + data.newCount}
              </span>
            )}
          </Button>
          <Button
            variant={mode === "practice" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setMode("practice")}
          >
            <PenLine className="h-4 w-4" /> {t("vocabulary.practice") || "Practice"}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setImportOpen(true)}
          >
            <Import className="h-4 w-4" /> {t("vocabulary.importData")}
          </Button>
          <Button
            className="gap-2"
            onClick={() => navigate(`/vocabulary/${collectionId}/add-card`)}
          >
            <Plus className="h-4 w-4" /> {t("vocabulary.addCard")}
          </Button>
        </div>
      </div>

      {mode === "practice" ? (
        <PracticeMode cards={cards} />
      ) : mode === "preview" ? (
        <div className="space-y-2">
          {cards.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
              {t("vocabulary.noCards")}
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="group relative rounded-xl border bg-card p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs text-muted-foreground mb-1">
                    {card.cardType?.name ?? t("vocabulary.cardType")}
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
        <div className="mt-4">
          {!isStudying ? (
            <div className="flex flex-col items-center max-w-4xl mx-auto space-y-10 py-10">
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 px-4">
                <div className="space-y-1.5 text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("vocabulary.today") || "Today"}
                  </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-emerald-500">{(data?.newCount || 0) + (data?.dueCount || 0)}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-blue-500">{data?.newCount || 0}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">New</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-rose-500">{data?.dueCount || 0}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Due</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="h-12 px-8 rounded-full bg-black hover:bg-black/90 text-white font-semibold shadow-sm dark:bg-white dark:text-black dark:hover:bg-white/90"
                    onClick={() => setIsStudying(true)}
                  >
                    Learn now
                  </Button>
                </div>
              </div>
              
              <div className="w-full px-4">
                <HeatMapChart history={statsData?.history || []} />
              </div>
            </div>
          ) : sessionCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border bg-card shadow-sm space-y-4 max-w-md mx-auto">
              <div className="text-4xl animate-bounce">🎉</div>
              <h2 className="text-xl font-bold">{t("vocabulary.reviewDoneTitle") || "Review Session Completed!"}</h2>
              <p className="text-sm text-muted-foreground">
                {t("vocabulary.reviewDoneDesc") || "All caught up! You have completed all due reviews for this collection."}
              </p>
              <Button variant="default" onClick={() => setMode("preview")}>
                {t("vocabulary.backToPreview") || "Back to Preview"}
              </Button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-12">
              <div 
                className="relative min-h-[350px] w-full perspective-[2000px] cursor-pointer group" 
                onClick={() => setFlipped((f) => !f)}
              >
                <div className={`relative w-full h-full min-h-[350px] duration-300 transform-3d transition-transform ${flipped ? 'transform-[rotateY(180deg)]' : ''}`}>
                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden">
                    <div className="text-center">
                      <CardFace card={sessionCards[flashcardIdx]} side="front" className="text-xl font-medium" />
                    </div>
                    <div className="absolute bottom-4 text-xs text-muted-foreground animate-pulse">
                      {t("vocabulary.clickToFlip") || "Click card to flip"}
                    </div>
                    <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {t("vocabulary.frontFace")}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden border-primary/10">
                    <div className="text-center">
                      <CardFace card={sessionCards[flashcardIdx]} side="back" className="text-xl font-medium text-muted-foreground" />
                    </div>
                    <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary uppercase tracking-widest font-bold">
                      {t("vocabulary.backFace")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {t("vocabulary.remainingCards") || "Remaining"}: {sessionCards.length}
              </div>

              <div className="flex justify-center gap-3">
                {!flipped ? (
                  <Button size="lg" className="w-44" onClick={() => setFlipped(true)}>
                    {t("vocabulary.revealAnswer") || "Reveal Answer"}
                  </Button>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-24 gap-1 font-semibold"
                      disabled={reviewMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("AGAIN");
                      }}
                    >
                      Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-24 gap-1 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold"
                      disabled={reviewMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("HARD");
                      }}
                    >
                      Hard
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="w-24 gap-1 font-semibold"
                      disabled={reviewMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("GOOD");
                      }}
                    >
                      Good
                    </Button>
                    <Button
                      size="sm"
                      className="w-24 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      disabled={reviewMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating("EASY");
                      }}
                    >
                      Easy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
        title={t("vocabulary.deleteCardTitle")}
        description={t("vocabulary.deleteCardDescription")}
      />
    </div>

  );
}
