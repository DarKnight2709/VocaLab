import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { SearchCollectionResult as CollectionResult } from "@/shared/validations/SearchSchema";
import { Layers, MoreHorizontal, Copy, CheckCircle2 } from "lucide-react";
import { formatTimeAgo } from "@/shared/lib/utils";
import { useForkCollectionMutation } from "@/features/vocabulary/api/vocabularyService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";

export function CollectionCard({ collection }: { collection: CollectionResult }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const forkMutation = useForkCollectionMutation();
  const currentUserId = useAuthStore((state) => state.userId);

  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySuccessResult, setCopySuccessResult] = useState<{ count: number; cards: string[] } | null>(null);
  const [copyName, setCopyName] = useState("");
  const [copyDescription, setCopyDescription] = useState("");
  const [isCopyPublic, setIsCopyPublic] = useState(false);

  const isOwner = collection.userId === currentUserId;

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyName(`${collection.name} (Copy)`);
    setCopyDescription(collection.description || "");
    setIsCopyPublic(false);
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = () => {
    forkMutation.mutate(
      {
        originalCollectionId: collection.id,
        name: copyName,
        description: copyDescription || undefined,
        isPublic: isCopyPublic,
      },
      {
        onSuccess: (data: any) => {
          setCopyDialogOpen(false);
          setCopySuccessResult({ count: collection._count?.cards ?? 0, cards: data.copiedCards || [] });
        },
      }
    );
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/collections/${collection.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/collections/${collection.id}`);
          }
        }}
        className="relative text-left w-full p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="min-w-0 w-full flex flex-col gap-2">
            {collection.user && (
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                  {collection.user.avatar ? (
                    <img
                      src={collection.user.avatar}
                      alt={collection.user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
                      {collection.user.fullName[0]}
                    </div>
                  )}
                </div>
                <span className="truncate font-medium text-foreground">
                  {collection.user.fullName}
                </span>
                <span aria-hidden>·</span>
                <span className="shrink-0">
                  {formatTimeAgo(collection.createdAt, t)}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold truncate text-foreground">{collection.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {collection.description}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>
            {collection._count?.cards ?? 0} {t("vocabulary.cards")}
          </span>
        </div>

        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleFork} disabled={forkMutation.isPending}>
                <Copy className="mr-2 h-4 w-4" />
                <span>{t("vocabulary.saveAsCopy", "Save as copy")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("vocabulary.saveAsCopy", "Save as Copy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`copy-name-${collection.id}`}>
                {t("vocabulary.collectionName", "Name")}
              </Label>
              <Input
                id={`copy-name-${collection.id}`}
                value={copyName}
                onChange={(e) => setCopyName(e.target.value)}
                placeholder="Collection name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`copy-desc-${collection.id}`}>
                {t("vocabulary.collectionDesc", "Description")}
              </Label>
              <Textarea
                id={`copy-desc-${collection.id}`}
                value={copyDescription}
                onChange={(e) => setCopyDescription(e.target.value)}
                placeholder="Description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`copy-public-${collection.id}`}>
                {t("vocabulary.public", "Public")}
              </Label>
              <Switch
                id={`copy-public-${collection.id}`}
                checked={isCopyPublic}
                onCheckedChange={setIsCopyPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleConfirmCopy}
              disabled={!copyName.trim() || forkMutation.isPending}
            >
              {t("common.confirm", "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!copySuccessResult} onOpenChange={(open) => !open && setCopySuccessResult(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                  <span className="text-4xl font-black text-foreground">{copySuccessResult?.count}</span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground mt-1">
                    {t("vocabulary.cardsAdded", "Cards Added")}
                  </span>
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
            
            {copySuccessResult?.cards && copySuccessResult.cards.length > 0 ? (
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
                      {copySuccessResult.cards.map((cardString, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-3 text-center text-muted-foreground/70 font-medium">{idx + 1}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold text-green-600 ring-1 ring-inset ring-green-500/20">
                              Added
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors break-words max-w-lg leading-relaxed">
                            {cardString.split(',').map((part, i, arr) => (
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
            <Button onClick={() => setCopySuccessResult(null)} className="w-full sm:w-auto px-8" size="lg">
              {t("common.continue", "Continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
