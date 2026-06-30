import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { BookOpenText, Eye, Layers, Pencil, Copy, CheckCircle2 } from "lucide-react";
import { UpdateCardType } from "@/shared/enums/UpdateCardType.enum";
import { UpdateCard } from "@/shared/enums/UpdateCard.enum";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { formatTimeAgo } from "@/shared/lib/utils";
import {
  useCollectionDetailPublicQuery,
  useForkCollectionMutation,
  type CardItem,
} from "../api/vocabularyService";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import ROUTES from "@/shared/lib/routes";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
  const [copyMergeCardType, setCopyMergeCardType] = useState(false);
  const [copyUpdateCardType, setCopyUpdateCardType] = useState<UpdateCardType>(UpdateCardType.NEWER);
  const [copyUpdateCard, setCopyUpdateCard] = useState<UpdateCard>(UpdateCard.NEWER);
  const [copySuccessResult, setCopySuccessResult] = useState<{ createdCards: string[]; updatedCards: string[]; skippedCards: string[]; newCollectionId: string } | null>(null);

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
    setCopyMergeCardType(false);
    setCopyUpdateCardType(UpdateCardType.NEWER);
    setCopyUpdateCard(UpdateCard.NEWER);
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = async () => {
    if (!data) return;
    setCopyDialogOpen(false);
    const result = await forkMutation.mutateAsync({
      originalCollectionId: data.id,
      name: copyName,
      description: copyDescription,
      isPublic: isCopyPublic,
      mergeCardType: copyMergeCardType,
      updateCardType: copyUpdateCardType,
      updateCard: copyUpdateCard,
    });
    setCopySuccessResult({
      createdCards: result.createdCards || [],
      updatedCards: result.updatedCards || [],
      skippedCards: result.skippedCards || [],
      newCollectionId: result.id,
    });
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
            
            {data?.user && (
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <div 
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-1.5 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.PROFILE.url.replace(":username", data.user!.username));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(ROUTES.PROFILE.url.replace(":username", data.user!.username));
                    }
                  }}
                >
                  <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                    {data.user.avatar ? (
                      <img
                        src={data.user.avatar}
                        alt={data.user.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
                        {data.user.fullName[0]}
                      </div>
                    )}
                  </div>
                  <span className="truncate font-medium text-foreground">
                    {data.user.fullName}
                  </span>
                </div>
                <span aria-hidden>·</span>
                <span className="shrink-0">
                  {formatTimeAgo(data.createdAt, t)}
                </span>
              </div>
            )}

            <div className="flex flex-col mt-2">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="copy-merge">
                  {t("vocabulary.mergeCardType")}
                </Label>
                <div className="text-xs text-muted-foreground">
                  {t("vocabulary.mergeCardTypeDesc")}
                </div>
              </div>
              <Switch
                id="copy-merge"
                checked={copyMergeCardType}
                onCheckedChange={setCopyMergeCardType}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("vocabulary.updateCardType")}</Label>
              <Select
                value={copyUpdateCardType}
                onValueChange={(v) => setCopyUpdateCardType(v as UpdateCardType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UpdateCardType.NEWER}>{t("vocabulary.newer")}</SelectItem>
                  <SelectItem value={UpdateCardType.ALWAYS}>{t("vocabulary.always")}</SelectItem>
                  <SelectItem value={UpdateCardType.NEVER}>{t("vocabulary.never")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("vocabulary.updateCard")}</Label>
              <Select
                value={copyUpdateCard}
                onValueChange={(v) => setCopyUpdateCard(v as UpdateCard)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UpdateCard.NEWER}>{t("vocabulary.newer")}</SelectItem>
                  <SelectItem value={UpdateCard.ALWAYS}>{t("vocabulary.always")}</SelectItem>
                  <SelectItem value={UpdateCard.NEVER}>{t("vocabulary.never")}</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Fork Success Dialog */}
      <Dialog open={!!copySuccessResult} onOpenChange={(open) => !open && setCopySuccessResult(null)}>
        <DialogContent className="w-[90vw] max-w-[90vw] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-b from-green-500/10 to-transparent px-6 py-8 flex flex-col items-center justify-center border-b">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />
            <div className="relative flex flex-col items-center z-10">
              <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                {t("vocabulary.copyCompleted", "Collection Copied Successfully!")}
              </h2>
              <div className="mt-8 flex gap-4">
                <div className="bg-background/50 backdrop-blur-md px-8 py-3 rounded-2xl border shadow-sm flex flex-col items-center">
                  <span className="text-4xl font-black text-green-600">{copySuccessResult?.createdCards.length ?? 0}</span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground mt-1">Created</span>
                </div>
                <div className="bg-background/50 backdrop-blur-md px-8 py-3 rounded-2xl border shadow-sm flex flex-col items-center">
                  <span className="text-4xl font-black text-blue-600">{copySuccessResult?.updatedCards.length ?? 0}</span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground mt-1">Updated</span>
                </div>
                <div className="bg-background/50 backdrop-blur-md px-8 py-3 rounded-2xl border shadow-sm flex flex-col items-center">
                  <span className="text-4xl font-black text-amber-600">{copySuccessResult?.skippedCards.length ?? 0}</span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground mt-1">Skipped</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-auto p-6 bg-muted/10">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {t("vocabulary.details", "Details")}
            </h3>

            {copySuccessResult && (copySuccessResult.createdCards.length > 0 || copySuccessResult.updatedCards.length > 0 || copySuccessResult.skippedCards.length > 0) ? (
              <div className="rounded-xl border bg-background shadow-sm overflow-hidden relative">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                      <tr>
                        <th className="px-6 py-4 w-16 text-center">#</th>
                        <th className="px-6 py-4 w-32">Status</th>
                        <th className="px-6 py-4">Fields</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ...(copySuccessResult.createdCards.map((c) => ({ term: c, status: 'Created', color: 'bg-green-500/10 text-green-600 ring-green-500/20' }))),
                        ...(copySuccessResult.updatedCards.map((c) => ({ term: c, status: 'Updated', color: 'bg-blue-500/10 text-blue-600 ring-blue-500/20' }))),
                        ...(copySuccessResult.skippedCards.map((c) => ({ term: c, status: 'Skipped', color: 'bg-amber-500/10 text-amber-600 ring-amber-500/20' }))),
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-3 text-center text-muted-foreground/70 font-medium">{idx + 1}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${item.color}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors break-words max-w-lg leading-relaxed">
                            {item.term.split(',').map((part, i, arr) => (
                              <span key={i} className="inline-block">
                                <span className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground/80">{part.trim()}</span>
                                {i < arr.length - 1 && <span className="text-muted-foreground/40 mx-1.5">,</span>}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-xl border-dashed bg-background/50">
                <Layers className="h-8 w-8 mb-3 opacity-20" />
                <p>{t("vocabulary.noCards", "No cards were added.")}</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-background border-t">
            <Button variant="outline" onClick={() => setCopySuccessResult(null)} className="px-8" size="lg">
              {t("common.close", "Close")}
            </Button>
            <Button onClick={() => { setCopySuccessResult(null); navigate(`/vocabulary/${copySuccessResult?.newCollectionId}`); }} className="px-8" size="lg">
              {t("vocabulary.goToCollection", "Go to Collection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
