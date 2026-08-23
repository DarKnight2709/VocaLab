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
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  useCollectionDetailQuery,
  useDeleteCardMutation,
  useUpdateCollectionMutation,
  useCollectionDueCardsQuery,
  useReviewCardMutation,
  useCollectionsQuery,
  useDeleteManyCardsMutation,
  type CardItem,
} from "../api/vocabularyService";
import type { SrsRating } from "@/shared/enums/SrsRating.enum";
import ImportVocabularyDialog from "../components/ImportVocabularyDialog";
import EditCardDialog from "../components/EditCardDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { useCollectionStatsQuery } from "@/features/stats/api/statsService";
import { HeatMapChart } from "@/features/stats/components/HeatMapChart";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useTranslation } from "@/shared/hooks/useTranslation";
import ROUTES from "@/shared/lib/routes";
import PracticeMode from "../components/PracticeMode";
import FormattedFieldValue from "../components/FormattedFieldValue";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

export default function VocabularyCollectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { collectionId } = useParams<{ collectionId: string }>();
  const { isFocusMode, setIsFocusMode } = useLayoutStore();

  const [mode, setMode] = useState<"preview" | "learn" | "practice">("preview");
  const [isStudying, setIsStudying] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const [sessionCards, setSessionCards] = useState<CardItem[]>([]);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const { data, isLoading } = useCollectionDetailQuery(collectionId || null);
  const { data: statsData } = useCollectionStatsQuery(collectionId || "");
  const { data: collections } = useCollectionsQuery(true);
  const deleteMutation = useDeleteCardMutation(collectionId || "");
  const deleteManyMutation = useDeleteManyCardsMutation(collectionId || "");
  const updateCollectionMutation = useUpdateCollectionMutation();

  const currentIndex = collections?.findIndex((c) => c.id === collectionId) ?? -1;
  const previousCollection = currentIndex > 0 ? collections?.[currentIndex - 1] : null;
  const nextCollection = currentIndex !== -1 && currentIndex < (collections?.length ?? 0) - 1 ? collections?.[currentIndex + 1] : null;

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



  useEffect(() => {
    return () => {
      setIsFocusMode(false);
    };
  }, [setIsFocusMode]);

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
    setIsDeletingBulk(false);
    setDeletingCardId(cardId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeletingBulk && selectedCardIds.size > 0) {
      await deleteManyMutation.mutateAsync(Array.from(selectedCardIds));
      setSelectedCardIds(new Set());
      setDeleteConfirmOpen(false);
      setIsDeletingBulk(false);
    } else if (deletingCardId) {
      await deleteMutation.mutateAsync(deletingCardId);
      setDeleteConfirmOpen(false);
      setDeletingCardId(null);
    }
  };

  const handleToggleCardSelection = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && cards) {
      setSelectedCardIds(new Set(cards.map(c => c.id)));
    } else {
      setSelectedCardIds(new Set());
    }
  };

  const cards: CardItem[] = useMemo(
    () => data?.cards ?? [],
    [data?.cards],
  );

  // Clear stale selections when cards data refreshes
  useEffect(() => {
    if (cards.length === 0) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds((prev) => {
        const currentIds = new Set(cards.map(c => c.id));
        const filtered = new Set([...prev].filter(id => currentIds.has(id)));
        return filtered.size === prev.size ? prev : filtered;
      });
    }
  }, [cards]);

  return (
    <div className="space-y-6">
      {!isFocusMode && (
        <Breadcrumb 
          items={[
            { label: t("vocabulary.title"), href: "/vocabulary" },
            { label: isLoading ? t("vocabulary.loading") : data?.name || t("vocabulary.collectionsTitle") }
          ]} 
        />
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {!isFocusMode && (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                disabled={!previousCollection}
                onClick={() => previousCollection && navigate(`/vocabulary/${previousCollection.id}`)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold truncate">
                {isLoading ? t("vocabulary.loading") : data?.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                disabled={!nextCollection}
                onClick={() => nextCollection && navigate(`/vocabulary/${nextCollection.id}`)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              {!isLoading && data && (
                <button
                  type="button"
                  onClick={handleToggleVisibility}
                  disabled={updateCollectionMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer disabled:opacity-50 ${
                    data.isPublic 
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20" 
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20"
                  }`}
                  title={data.isPublic ? t("vocabulary.makePrivate") : t("vocabulary.publish")}
                >
                  {data.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {data.isPublic ? t("vocabulary.public") : t("vocabulary.private")}
                </button>
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
        )}

        <div className={`flex flex-wrap items-center gap-2 justify-end ${isFocusMode ? "w-full" : ""}`}>
          {!isFocusMode && (
            <>
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
              <span className={`ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full leading-none flex items-center justify-center ${
                mode === "learn" 
                  ? "bg-primary-foreground text-primary" 
                  : "bg-primary text-primary-foreground"
              }`}>
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
          
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

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
            </>
          )}

          <Button
            variant={isFocusMode ? "default" : "outline"}
            className="gap-2"
            onClick={() => setIsFocusMode(!isFocusMode)}
            title={isFocusMode ? (t("vocabulary.exitFocusMode") || "Exit Focus Mode") : (t("vocabulary.enterFocusMode") || "Enter Focus Mode")}
          >
            {isFocusMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mode === "practice" ? (
        <PracticeMode cards={cards} collectionId={collectionId} />
      ) : mode === "preview" ? (
        <div className="space-y-2 relative pb-2">
          {cards.length === 0 ? (
              <div className="rounded-xl bg-card shadow-sm p-10 text-center text-muted-foreground">
              {t("vocabulary.noCards")}
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className={`group relative rounded-xl bg-card shadow-sm p-4 transition-all cursor-pointer ${
                  selectedCardIds.has(card.id) 
                    ? "ring-2 ring-primary/50 bg-primary/[0.03]" 
                    : "hover:bg-muted/40"
                }`}
                onClick={(e) => {
                  // Don't toggle if clicking on buttons or links
                  if ((e.target as HTMLElement).closest("button, a, input")) return;
                  handleToggleCardSelection(card.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCardIds.has(card.id)}
                      onCheckedChange={() => handleToggleCardSelection(card.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-xs text-muted-foreground">
                      {card.cardType?.name ?? t("vocabulary.cardType")}
                    </div>
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
                  <CardFace card={card} side="front" className={`font-semibold ${isFocusMode ? "text-xl md:text-2xl" : ""}`} useStyles={false} isFocusMode={isFocusMode} />
                  <div className="w-px self-stretch bg-border" aria-hidden="true" />
                  <CardFace card={card} side="back" className={`text-muted-foreground ${isFocusMode ? "text-xl md:text-2xl" : ""}`} useStyles={false} isFocusMode={isFocusMode} />
                </div>
              </div>
            ))
          )}

          {/* Floating action bar */}
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
            selectedCardIds.size > 0 
              ? "translate-y-0 opacity-100" 
              : "translate-y-4 opacity-0 pointer-events-none"
          }`}>
            <div className="flex items-center gap-3 bg-foreground text-background px-5 py-2.5 rounded-full shadow-2xl">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCardIds.size === cards.length && cards.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-background/50 accent-background"
                />
                <span className="text-sm font-medium">
                  {selectedCardIds.size} {t("vocabulary.selected") || "selected"}
                </span>
              </div>
              <div className="w-px h-5 bg-background/20" />
              <button
                className="text-sm text-background/70 hover:text-background transition-colors"
                onClick={() => setSelectedCardIds(new Set())}
              >
                {t("vocabulary.clearSelection") || "Clear"}
              </button>
              <div className="w-px h-5 bg-background/20" />
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                disabled={deleteManyMutation.isPending}
                onClick={() => { setIsDeletingBulk(true); setDeleteConfirmOpen(true); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("vocabulary.delete") || "Delete"}
              </button>
            </div>
          </div>
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
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-card shadow-sm space-y-4 max-w-md mx-auto">
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
            <div className={`${isFocusMode ? "max-w-none px-0 md:px-12" : "max-w-3xl"} w-full mx-auto space-y-6 pb-12`}>
              <div 
                className={`relative w-full perspective-[2000px] cursor-pointer group ${isFocusMode ? "min-h-[65vh]" : "min-h-[350px]"}`} 
                onClick={() => setFlipped((f) => !f)}
              >
                <div className={`relative w-full h-full ${isFocusMode ? "min-h-[65vh]" : "min-h-[350px]"} transform-3d transition-transform ${flipped ? 'transform-[rotateY(180deg)]' : ''}`}>
                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-card shadow-sm flex items-center justify-center shadow-sm p-6 overflow-hidden">
                    <div className="text-center w-full max-w-4xl px-4">
                      <CardFace card={sessionCards[flashcardIdx]} side="front" className={`leading-tight font-medium ${isFocusMode ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl'}`} isFocusMode={isFocusMode} />
                    </div>
                    <div className="absolute bottom-4 text-xs text-muted-foreground animate-pulse">
                      {t("vocabulary.clickToFlip") || "Click card to flip"}
                    </div>
                    <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {t("vocabulary.frontFace")}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] rounded-2xl bg-card shadow-sm flex items-center justify-center shadow-sm p-6 overflow-hidden border-primary/10">
                    <div className="text-center w-full max-w-4xl px-4">
                      <CardFace card={sessionCards[flashcardIdx]} side="back" className={`leading-tight font-medium text-muted-foreground ${isFocusMode ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl'}`} isFocusMode={isFocusMode} />
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
        isLoading={isDeletingBulk ? deleteManyMutation.isPending : deleteMutation.isPending}
        title={isDeletingBulk ? (t("vocabulary.deleteSelectedTitle") || "Delete Selected Cards") : t("vocabulary.deleteCardTitle")}
        description={isDeletingBulk ? (t("vocabulary.deleteSelectedDescription") || "Are you sure you want to delete these cards? This action cannot be undone.") : t("vocabulary.deleteCardDescription")}
      />
    </div>

  );
}

function CardFace({
  card,
  side,
  className,
  useStyles = true,
  isFocusMode = false,
}: {
  card: CardItem;
  side: "front" | "back";
  className?: string;
  useStyles?: boolean;
  isFocusMode?: boolean;
}) {
  const { t } = useTranslation();
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
          style={
            useStyles
              ? {
                  color: entry.color || "inherit",
                  fontSize: entry.fontSize
                    ? isFocusMode
                      ? Number(entry.fontSize) * 1.5 + "px"
                      : Number(entry.fontSize) + "px"
                    : "inherit",
                  fontWeight: entry.fontSize ? "500" : "inherit",
                }
              : {}
          }
        >
          <FormattedFieldValue text={entry.value} />
        </div>
      ))}
      {entries.length === 0 && (
        <div className="text-muted-foreground italic text-xs">
          {t("vocabulary.emptyFieldValue")}
        </div>
      )}
    </div>
  );
}
