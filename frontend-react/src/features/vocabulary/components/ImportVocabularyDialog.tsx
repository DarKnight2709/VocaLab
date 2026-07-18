import { useState, useMemo, useEffect } from "react";
import { 
  Import, 
  FileText, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  SkipForward
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  useCollectionsQuery,
  useCardTypesQuery,
  useImportVocabularyMutation,
  DuplicatePolicy,
} from "../api/vocabularyService";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface ImportVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollectionId?: string;
}

export default function ImportVocabularyDialog({
  open,
  onOpenChange,
  defaultCollectionId,
}: ImportVocabularyDialogProps) {
  const { t } = useTranslation();
  const [importMode, setImportMode] = useState<"text" | "file">("text");
  const [rawText, setRawText] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [cardTypeId, setCardTypeId] = useState("");
  const [collectionId, setCollectionId] = useState(defaultCollectionId || "");
  const [duplicatePolicy, setDuplicatePolicy] = useState<DuplicatePolicy>(DuplicatePolicy.SKIP);
  const [importResult, setImportResult] = useState<{
    summary: string;
    imported: { count: number; cards: string[] };
    updated: { count: number; cards: string[] };
    skipped: { count: number; cards: string[] };
    errors: { count: number; lines: string[] };
  } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { data: cardTypesData } = useCardTypesQuery(open);
  const { data: collectionsData } = useCollectionsQuery(open);
  const importMutation = useImportVocabularyMutation();

  // Set default card type if not set yet
  useEffect(() => {
    if (!cardTypeId && cardTypesData?.cardTypes?.length) {
      setCardTypeId(cardTypesData.cardTypes[0].id);
    }
  }, [cardTypesData, cardTypeId]);

  // Set default collection if not set yet
  useEffect(() => {
    if (!collectionId && collectionsData?.collections?.length) {
      setCollectionId(collectionsData.collections[0].id);
    }
  }, [collectionsData, collectionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const previewData = useMemo(() => {
    if (!rawText.trim()) return null;
    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    // Simple preview split
    const parts = firstLine.split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
    
    // Get field labels for the selected card type
    const selectedCardType = cardTypesData?.cardTypes.find(t => t.id === cardTypeId);
    const fields = selectedCardType?.fields || [];
    return {
      parts,
      fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0))
    };
  }, [rawText, delimiter, cardTypeId, cardTypesData]);

  const handleImport = async () => {
    if (!rawText.trim() || !cardTypeId || !collectionId) return;

    const res = await importMutation.mutateAsync({
      rawText,
      delimiter,
      cardTypeId,
      collectionId,
      duplicatePolicy,
    });

    setImportResult(res.data);
    
    // Reset state
    if (importMode === 'text') setRawText("");
    setFileName(null);
  };

  const handleClose = () => {
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {importResult ? (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">{t("vocabulary.import.completed")}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card shadow-sm flex flex-col items-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{importResult.imported.count}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("vocabulary.import.new")}</span>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-sm flex flex-col items-center gap-1">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{importResult.updated.count}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("vocabulary.import.updated")}</span>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-sm flex flex-col items-center gap-1">
                <SkipForward className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{importResult.skipped.count}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("vocabulary.import.skipped")}</span>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-sm flex flex-col items-center gap-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{importResult.errors.count}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("vocabulary.import.errors")}</span>
              </div>
            </div>

            <Tabs defaultValue="imported" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="imported" className="text-xs">{t("vocabulary.import.new")}</TabsTrigger>
                <TabsTrigger value="updated" className="text-xs">{t("vocabulary.import.updated")}</TabsTrigger>
                <TabsTrigger value="skipped" className="text-xs">{t("vocabulary.import.skipped")}</TabsTrigger>
                <TabsTrigger value="errors" className="text-xs">{t("vocabulary.import.errors")}</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 rounded-xl overflow-hidden bg-muted/20 shadow-sm">
                <div className="max-h-50 overflow-y-auto p-2 custom-scrollbar">
                  <TabsContent value="imported" className="m-0 space-y-1">
                    {importResult.imported.cards.length > 0 ? (
                      importResult.imported.cards.map((line, i) => (
                        <div key={i} className="px-3 py-2 text-xs bg-card border rounded-lg">{line}</div>
                      ))
                    ) : <p className="text-center py-4 text-xs text-muted-foreground italic">{t("vocabulary.import.noItems")}</p>}
                  </TabsContent>
                  
                  <TabsContent value="updated" className="m-0 space-y-1">
                    {importResult.updated.cards.length > 0 ? (
                      importResult.updated.cards.map((line, i) => (
                        <div key={i} className="px-3 py-2 text-xs bg-card border rounded-lg">{line}</div>
                      ))
                    ) : <p className="text-center py-4 text-xs text-muted-foreground italic">{t("vocabulary.import.noItems")}</p>}
                  </TabsContent>
                  
                  <TabsContent value="skipped" className="m-0 space-y-1">
                    {importResult.skipped.cards.length > 0 ? (
                      importResult.skipped.cards.map((line, i) => (
                        <div key={i} className="px-3 py-2 text-xs bg-card border rounded-lg">{line}</div>
                      ))
                    ) : <p className="text-center py-4 text-xs text-muted-foreground italic">{t("vocabulary.import.noItems")}</p>}
                  </TabsContent>
                  
                  <TabsContent value="errors" className="m-0 space-y-1">
                    {importResult.errors.lines.length > 0 ? (
                      importResult.errors.lines.map((line, i) => (
                        <div key={i} className="px-3 py-2 text-xs bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg">{line}</div>
                      ))
                    ) : <p className="text-center py-4 text-xs text-muted-foreground italic">{t("vocabulary.import.noItems")}</p>}
                  </TabsContent>
                </div>
              </div>
            </Tabs>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                {t("vocabulary.import.close")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Import className="h-5 w-5 text-primary" />
                {t("vocabulary.import.title")}
              </DialogTitle>
              <DialogDescription>
                {t("vocabulary.import.desc")}
              </DialogDescription>
            </DialogHeader>

        <div className="grid gap-6 py-4">
          <Tabs value={importMode} onValueChange={(v) => setImportMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="gap-2">
                <FileText className="h-4 w-4" /> {t("vocabulary.import.pasteText")}
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" /> {t("vocabulary.import.uploadFile")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raw-text">{t("vocabulary.import.textContent")}</Label>
                  <Textarea
                  id="raw-text"
                  placeholder={t("vocabulary.import.placeholder")}
                  className="min-h-50 font-mono text-sm"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-4 space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg p-10 bg-muted/30 shadow-sm hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt,.csv"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">{t("vocabulary.import.supportFormat")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("vocabulary.import.dragDrop")}
                </p>
                {fileName && (
                  <div className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {fileName}
                  </div>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 text-sm text-blue-600 dark:text-blue-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{t("vocabulary.import.encodingAlert")}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("vocabulary.import.delimiter")}</Label>
              <Input
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                placeholder={t("vocabulary.import.delimiterPlaceholder")}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("vocabulary.import.duplicatePolicy")}</Label>
              <Select
                value={duplicatePolicy}
                onValueChange={(v) => setDuplicatePolicy(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DuplicatePolicy.SKIP}>{t("vocabulary.import.policy.skip")}</SelectItem>
                  <SelectItem value={DuplicatePolicy.UPDATE}>{t("vocabulary.import.policy.update")}</SelectItem>
                  <SelectItem value={DuplicatePolicy.DUPLICATE}>{t("vocabulary.import.policy.duplicate")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("vocabulary.import.cardType")}</Label>
              <Select value={cardTypeId} onValueChange={setCardTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("vocabulary.import.selectCardType")} />
                </SelectTrigger>
                <SelectContent>
                  {cardTypesData?.cardTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("vocabulary.import.collection")}</Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("vocabulary.import.selectCollection")} />
                </SelectTrigger>
                <SelectContent>
                  {collectionsData?.collections.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {previewData && (
            <div className="space-y-3">
              <Label className="text-primary font-bold">{t("vocabulary.import.preview")}</Label>
              <div className="rounded-xl p-4 bg-muted/20 shadow-sm">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {previewData.fields.map((field, idx) => (
                    <div key={field.id} className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {t("vocabulary.import.fieldLabel", { label: field.label, key: field.key })}
                      </span>
                      <div className="p-2 border rounded-md bg-background min-h-10 flex items-center text-sm">
                        {previewData.parts[idx] || (
                          <span className="text-muted-foreground italic">{t("vocabulary.import.empty")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {previewData.parts.length > previewData.fields.length && (
                  <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t("vocabulary.import.fieldMismatch", { count: previewData.parts.length, fieldsCount: previewData.fields.length })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!rawText.trim() || !cardTypeId || !collectionId || importMutation.isPending}
            className="min-w-25"
          >
            {importMutation.isPending ? t("vocabulary.import.processing") : t("vocabulary.import.importNow")}
          </Button>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
