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
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";


const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  A2: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  B1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  B2: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  C1: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  C2: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
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

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("grammar.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
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
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-36">
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
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(item)}
                      className="h-6 w-6 p-0.5"
                      aria-label={t("grammar.edit")}
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(item)}
                      className="h-6 w-6 p-0.5"
                      aria-label={t("grammar.delete")}
                    >
                       <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
                <div className="mb-3">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-primary">
                    {item.structure}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.explanation}
                </p>
                {item.examples && item.examples.length > 0 && (
                  <p className="text-xs text-muted-foreground italic line-clamp-1">
                    e.g. {item.examples[0]}
                  </p>
                )}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {item.level && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[item.level] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.level}
                    </span>
                  )}
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                  {item.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      {t("grammar.default")}
                    </Badge>
                  )}
                </div>
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
    </div>
  );
}
