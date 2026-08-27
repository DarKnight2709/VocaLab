import { useState } from "react";
import {
  useGrammarListQuery,
  useGrammarCategoriesQuery,
  useCreateGrammarMutation,
  useDeleteGrammarMutation,
  useUpdateGrammarMutation,
  type GrammarItem,
  type CreateGrammarBody,
} from "../api/grammarService";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  BookOpen,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";


const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20",
  A2: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-500/20",
  B1: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-500/20",
  B2: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20",
  C1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20",
  C2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-500/20",
};

const emptyForm: CreateGrammarBody & { examples_text: string } = {
  title: "",
  structure: "",
  explanation: "",
  examples_text: "",
  category: "",
  level: "",
};

export default function GrammarPage() {
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("grammar_view_mode") as "grid" | "list") || "grid";
  });

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("grammar_view_mode", mode);
  };

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<GrammarItem | null>(null);
  const [editItem, setEditItem] = useState<GrammarItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<GrammarItem | null>(null);

  const { data, isLoading } = useGrammarListQuery({
    page,
    limit: 12,
    search,
    category: category || undefined,
    level: level || undefined,
  });
  const { data: categoriesData } = useGrammarCategoriesQuery();
  const createMutation = useCreateGrammarMutation();
  const updateMutation = useUpdateGrammarMutation();
  const deleteMutation = useDeleteGrammarMutation();

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: GrammarItem) {
    setEditItem(item);
    setForm({
      title: item.title,
      structure: item.structure,
      explanation: item.explanation,
      examples_text: (item.examples ?? []).join("\n"),
      category: item.category ?? "",
      level: item.level ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: CreateGrammarBody = {
      title: form.title,
      structure: form.structure,
      explanation: form.explanation,
      examples: form.examples_text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      category: form.category || undefined,
      level: form.level || undefined,
    };
    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, body });
    } else {
      await createMutation.mutateAsync(body);
    }
    setDialogOpen(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    await deleteMutation.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        <Breadcrumb items={[{ label: t("common.grammar") }]} />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("grammar.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("grammar.subtitle")}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            {t("grammar.addStructure")}
          </Button>
        </div>

        {/* Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("grammar.searchPlaceholder")}
                className="pl-9 rounded-xl border-border/80"
              />
            </div>
            <Button type="submit" variant="outline" className="rounded-xl border-border/80">
              {t("grammar.search")}
            </Button>
          </form>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48 rounded-xl border-border/80">
              <SelectValue placeholder={t("grammar.filterTopic")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("grammar.allTopics")}</SelectItem>
              {categoriesData?.categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={level}
            onValueChange={(v) => {
              setLevel(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 rounded-xl border-border/80">
              <SelectValue placeholder={t("grammar.level")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("grammar.all")}</SelectItem>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

        {/* Content: Loading / Empty / List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-card shadow-xs text-muted-foreground border border-dashed border-border">
            <p className="text-base font-medium">{t("grammar.noResults") || "No grammar structures found."}</p>
          </div>
        ) : viewMode === "list" ? (
          /* List / Row View */
          <div className="flex flex-col gap-3">
            {data?.items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailItem(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetailItem(item);
                  }
                }}
                className="group relative flex flex-col justify-between gap-3 p-5 sm:px-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
              >
                {/* Top Header: Title + Metadata Badges + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.level && (
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${LEVEL_COLORS[item.level] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {item.level}
                      </span>
                    )}
                    {item.category && (
                      <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </Badge>
                    )}
                    {item.isDefault && (
                      <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {t("grammar.default")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(item);
                      }}
                      className="h-8 w-8 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={t("grammar.edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item);
                      }}
                      className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t("grammar.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Structure Syntax Formula */}
                <div>
                  <code className="text-xs sm:text-sm bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl font-mono text-primary font-bold inline-block">
                    {item.structure}
                  </code>
                </div>

                {/* Explanation & Example */}
                <div className="space-y-2 pt-0.5 text-sm">
                  <p className="text-foreground/85 leading-relaxed font-normal">
                    {item.explanation}
                  </p>

                  {item.examples && item.examples.length > 0 && (
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-1.5 border border-border/40 max-w-full">
                      <span className="font-semibold text-primary shrink-0">e.g.</span>
                      <span className="italic truncate">{item.examples[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {data?.items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailItem(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetailItem(item);
                  }
                }}
                className="rounded-3xl p-5 bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 group flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {item.level && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${LEVEL_COLORS[item.level] ?? "bg-muted text-muted-foreground"}`}
                          >
                            {item.level}
                          </span>
                        )}
                        {item.category && (
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full">
                            {item.category}
                          </Badge>
                        )}
                        {item.isDefault && (
                          <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full">
                            {t("grammar.default")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(item);
                        }}
                        className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        aria-label={t("grammar.edit")}
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(item);
                        }}
                        className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label={t("grammar.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <code className="text-xs bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg font-mono text-primary font-semibold inline-block">
                      {item.structure}
                    </code>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {item.examples && item.examples.length > 0 && (
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground/80 italic line-clamp-1">
                      <span className="font-semibold text-primary not-italic mr-1">e.g.</span>
                      {item.examples[0]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("grammar.page")} {page} / {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.meta.totalPages, p + 1))
              }
              disabled={page === data.meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? t("grammar.editStructure") : t("grammar.addGrammarStructure")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("grammar.structureName")} *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="E.g. Present Perfect Simple"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("grammar.formula")} *</Label>
              <Input
                value={form.structure}
                onChange={(e) =>
                  setForm((f) => ({ ...f, structure: e.target.value }))
                }
                placeholder="E.g. S + have/has + V3"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("grammar.explanation")} *</Label>
              <Textarea
                value={form.explanation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, explanation: e.target.value }))
                }
                placeholder="Explain the meaning and usage..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("grammar.examples")}</Label>
              <Textarea
                value={form.examples_text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, examples_text: e.target.value }))
                }
                placeholder={
                  "I have eaten breakfast.\nShe has finished her work."
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("grammar.topic")}</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="E.g. Present tense"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("grammar.level")}</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("grammar.selectLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("grammar.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editItem ? t("grammar.update") : t("grammar.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("grammar.deleteConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span dangerouslySetInnerHTML={{ 
              __html: t("grammar.deleteConfirmDesc", { title: deleteConfirm?.title }) 
            }} />
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t("grammar.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {t("grammar.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grammar Structure Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl p-6 sm:p-7">
          {detailItem && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {detailItem.level && (
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${LEVEL_COLORS[detailItem.level] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {detailItem.level}
                      </span>
                    )}
                    {detailItem.category && (
                      <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {detailItem.category}
                      </Badge>
                    )}
                    {detailItem.isDefault && (
                      <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {t("grammar.default")}
                      </Badge>
                    )}
                  </div>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {detailItem.title}
                </DialogTitle>
              </div>

              {/* Formula Structure Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("grammar.formula")}
                </span>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <code className="text-base sm:text-lg font-mono font-bold text-primary break-all">
                    {detailItem.structure}
                  </code>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("grammar.explanation")}
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed p-4 rounded-2xl bg-muted/40 border border-border/50 whitespace-pre-line font-normal">
                  {detailItem.explanation}
                </p>
              </div>

              {/* Examples List */}
              {detailItem.examples && detailItem.examples.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("grammar.examples")}
                  </span>
                  <div className="space-y-2">
                    {detailItem.examples.map((example, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-card border border-border/70 text-sm shadow-xs"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <p className="text-foreground/90 italic pt-0.5 leading-relaxed font-normal">
                          {example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons in Footer */}
              <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={() => {
                    const item = detailItem;
                    setDetailItem(null);
                    openEdit(item);
                  }}
                >
                  <Pencil className="h-4 w-4 text-primary" />
                  {t("grammar.edit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-xl text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const item = detailItem;
                    setDetailItem(null);
                    setDeleteConfirm(item);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("grammar.delete")}
                </Button>
                <Button
                  type="button"
                  className="rounded-xl font-semibold shadow-xs ml-auto"
                  onClick={() => setDetailItem(null)}
                >
                  {t("grammar.close")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
