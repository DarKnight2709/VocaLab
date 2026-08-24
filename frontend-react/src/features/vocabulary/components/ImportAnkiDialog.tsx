import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { UploadCloud, FileArchive, X, Loader2, CheckCircle2 } from "lucide-react";
import { useImportAnkiMutation } from "../api/vocabularyService";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { toast } from "sonner";

interface ImportAnkiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportAnkiDialog({ open, onOpenChange }: ImportAnkiDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const importMutation = useImportAnkiMutation();

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".apkg") && !file.name.toLowerCase().endsWith(".colpkg")) {
      toast.error(t("vocabulary.invalidAnkiFile", { defaultValue: "Please select an Anki package (.apkg or .colpkg)" }));
      return;
    }
    setSelectedFile(file);
    // Autofill collection name from file name if empty
    if (!collectionName) {
      const defaultName = file.name.replace(/\.(apkg|colpkg)$/i, "");
      setCollectionName(defaultName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importMutation.mutateAsync({
        file: selectedFile,
        name: collectionName.trim() || undefined,
      });

      onOpenChange(false);
      // Reset state
      setSelectedFile(null);
      setCollectionName("");

      // Navigate to the newly imported collection
      if (result?.collectionId) {
        navigate(`/vocabulary/${result.collectionId}`);
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!importMutation.isPending) {
          onOpenChange(val);
          if (!val) {
            setSelectedFile(null);
            setCollectionName("");
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="h-5 w-5 text-primary" />
            <span>{t("vocabulary.importAnkiTitle", { defaultValue: "Import Anki Deck (.apkg)" })}</span>
          </DialogTitle>
          <DialogDescription>
            {t(
              "vocabulary.importAnkiDescription",
              { defaultValue: "Upload your Anki package to import flashcards, note types, and embedded images automatically." }
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".apkg,.colpkg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileArchive className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {t("vocabulary.dropAnkiHere", { defaultValue: "Drag and drop your Anki file here" })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("vocabulary.orClickToBrowse", { defaultValue: "or click to browse from your device (.apkg)" })}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileArchive className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>

              {!importMutation.isPending && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                  onClick={() => setSelectedFile(null)}
                  title={t("common.clear", { defaultValue: "Remove" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Optional Collection Name Override */}
          <div className="space-y-1.5">
            <Label htmlFor="anki-collection-name" className="text-sm font-medium">
              {t("vocabulary.collectionName", { defaultValue: "Collection Name" })}
              <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                ({t("vocabulary.optionalDefaultsToDeck", { defaultValue: "Optional, defaults to Anki deck name" })})
              </span>
            </Label>
            <Input
              id="anki-collection-name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder={t("vocabulary.enterCollectionName", { defaultValue: "e.g. Japanese Core 2000" })}
              disabled={importMutation.isPending}
            />
          </div>

          {importMutation.isPending && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-3 text-xs text-primary font-medium">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>{t("vocabulary.importingAnkiProgress", { defaultValue: "Importing cards and media, please wait..." })}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importMutation.isPending}
          >
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
            className="cursor-pointer gap-2"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("vocabulary.importing", { defaultValue: "Importing..." })}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{t("vocabulary.importAction", { defaultValue: "Import Deck" })}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImportAnkiDialog;
