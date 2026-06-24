import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { BookOpenText, Eye, Layers, Pencil, Copy } from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  useCollectionDetailPublicQuery,
  useForkCollectionMutation,
  type CardItem,
} from "../api/vocabularyService";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

export default function PublicCollectionDetailPage() {
  const { t } = useTranslation();
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.userId);

  const [mode, setMode] = useState<"preview" | "learn">("preview");
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyName, setCopyName] = useState("");
  const [copyDescription, setCopyDescription] = useState("");
  const [isCopyPublic, setIsCopyPublic] = useState(false);

  const { data, isLoading } = useCollectionDetailPublicQuery(
    collectionId || null,
  );

  const forkMutation = useForkCollectionMutation();

  const isMine = !!data && data.userId === currentUserId;

  const handleOpenCopyDialog = () => {
    if (!data) return;

    setCopyName(`${data.name} (Copy)`);
    setCopyDescription(data.description || "");
    setIsCopyPublic(false);
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = async () => {
    if (!data) return;
    setCopyDialogOpen(false);
    const newCollection = await forkMutation.mutateAsync({
      originalCollectionId: data.id,
      name: copyName,
      description: copyDescription,
      isPublic: isCopyPublic,
    });
    console.log("New collection created: ", newCollection);
    navigate(`/vocabulary/${newCollection.id}`);
  };

  const cards: CardItem[] = useMemo(() => data?.cards ?? [], [data?.cards]);

  const CardFace = ({
    card,
    side,
    className,
    useStyles = true,
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
            style={
              useStyles
                ? {
                    color: entry.color || "inherit",
                    fontSize: entry.fontSize
                      ? Number(entry.fontSize) + "px"
                      : "inherit",
                    fontWeight: entry.fontSize ? "500" : "inherit",
                  }
                : {}
            }
          >
            {entry.value}
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-muted-foreground italic text-xs">
            {t("vocabulary.emptyFieldValue")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: t("search.title"), href: "/search" },
            {
              label: isLoading
                ? t("vocabulary.loading")
                : data?.name || t("vocabulary.collectionsTitle"),
            },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold truncate">
                {isLoading ? t("vocabulary.loading") : data?.name}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "" : data?.description}
            </p>
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>
                {cards.length} {t("vocabulary.cards")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
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
                setFlipped(false);
              }}
            >
              <BookOpenText className="h-4 w-4" /> {t("vocabulary.learn")}
            </Button>
            {isMine ? (
              <Button
                className="gap-2"
                onClick={() => navigate(`/vocabulary/${collectionId}`)}
              >
                <Pencil className="h-4 w-4" /> {t("vocabulary.edit") || "Edit"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenCopyDialog}
                >
                  <Copy className="h-4 w-4" /> Save as Copy
                </Button>
                {/* <Button
                variant="outline"
                className="gap-2"
                onClick={handleBookmark}
              >
                <Bookmark className="h-4 w-4" /> Bookmark
              </Button> */}
              </>
            )}
          </div>
        </div>

        {mode === "preview" ? (
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
                  </div>

                  <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                    <CardFace
                      card={card}
                      side="front"
                      className="font-semibold"
                      useStyles={false}
                    />
                    <div
                      className="w-px self-stretch bg-border"
                      aria-hidden="true"
                    />
                    <CardFace
                      card={card}
                      side="back"
                      className="text-muted-foreground"
                      useStyles={false}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {cards.length === 0 ? (
              <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
                {t("vocabulary.noCardsToLearn")}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div
                    className="relative h-64 perspective-[2000px] cursor-pointer group"
                    onClick={() => setFlipped((f) => !f)}
                  >
                    <div
                      className={`relative w-full h-full duration-300 transform-3d transition-transform ${flipped ? "transform-[rotateY(180deg)]" : ""}`}
                    >
                      {/* Front Face */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden">
                        <div className="text-center">
                          <CardFace
                            card={cards[flashcardIdx]}
                            side="front"
                            className="text-base font-medium"
                          />
                        </div>
                        <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {t("vocabulary.frontFace")}
                        </div>
                      </div>

                      {/* Back Face */}
                      <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] rounded-2xl border bg-card flex items-center justify-center shadow-sm p-6 overflow-hidden border-primary/10">
                        <div className="text-center">
                          <CardFace
                            card={cards[flashcardIdx]}
                            side="back"
                            className="text-base font-medium"
                          />
                        </div>
                        <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary uppercase tracking-widest font-bold">
                          {t("vocabulary.backFace")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                    {t("vocabulary.flashcardProgress")
                      .replace("{current}", String(flashcardIdx + 1))
                      .replace("{total}", String(cards.length))}
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
                    {t("vocabulary.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFlashcardIdx((i) => Math.min(cards.length - 1, i + 1));
                      setFlipped(false);
                    }}
                    disabled={flashcardIdx === cards.length - 1}
                  >
                    {t("vocabulary.next")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("vocabulary.saveAsCopy") || "Save as Copy"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="copy-name">
                {t("vocabulary.collectionName") || "Name"}
              </Label>
              <Input
                id="copy-name"
                value={copyName}
                onChange={(e) => setCopyName(e.target.value)}
                placeholder="Collection name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copy-desc">
                {t("vocabulary.collectionDesc") || "Description"}
              </Label>
              <Textarea
                id="copy-desc"
                value={copyDescription}
                onChange={(e) => setCopyDescription(e.target.value)}
                placeholder="Description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="copy-public">
                {t("vocabulary.public") || "Public"}
              </Label>
              <Switch
                id="copy-public"
                checked={isCopyPublic}
                onCheckedChange={setIsCopyPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmCopy}
              disabled={!copyName.trim() || forkMutation.isPending}
            >
              {t("common.confirm") || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
