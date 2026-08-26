import React, { useState, useRef, useMemo, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { uploadFileRequest } from "@/shared/hooks/useUpload";
import { isImageUrl } from "./FormattedFieldValue";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface CardFieldInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const testImageLoad = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

function parseFieldValue(val: string): { images: string[]; currentText: string } {
  if (!val) return { images: [], currentText: "" };

  const lines = val.split("\n");
  const extractedImages: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed && isImageUrl(trimmed)) {
      extractedImages.push(trimmed);
      continue;
    }

    // Markdown image: ![alt](url)
    const mdMatch = trimmed ? trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)$/i) : null;
    if (mdMatch) {
      extractedImages.push(mdMatch[2]);
      continue;
    }

    // HTML img tag: <img src="..." />
    const htmlMatch = trimmed ? trimmed.match(/^<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>$/i) : null;
    if (htmlMatch) {
      extractedImages.push(htmlMatch[1]);
      continue;
    }

    // Space-separated images in a single line
    const tokens = trimmed ? trimmed.split(/\s+/) : [];
    if (tokens.length > 1 && tokens.every(isImageUrl)) {
      extractedImages.push(...tokens);
      continue;
    }

    // Plain text (preserves spaces and line breaks)
    textLines.push(line);
  }

  return {
    images: extractedImages,
    currentText: textLines.join("\n"),
  };
}

export function CardFieldInput({
  id,
  label,
  value,
  onChange,
  isRequired = false,
  placeholder,
  disabled = false,
}: CardFieldInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string>(value);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Parse value into images array and remaining plain text
  const { images, currentText } = useMemo(() => {
    return parseFieldValue(value);
  }, [value]);

  const updateCombinedValue = (newImages: string[], newText: string) => {
    const parts = [...newImages];
    if (newText.length > 0) {
      parts.push(newText);
    }
    const combined = parts.join("\n");
    valueRef.current = combined;
    onChange(combined);
  };

  const handleUploadFiles = async (files: File[]) => {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    setIsUploading(true);

    const newUrls: string[] = [];

    for (const file of validImageFiles) {
      try {
        const res = await uploadFileRequest(file);
        if (res?.url) {
          const isAccessible = await testImageLoad(res.url);
          if (isAccessible) {
            newUrls.push(res.url);
            continue;
          }
        }
      } catch (err) {
        console.warn("Server upload failed, using base64 fallback", err);
      }

      // Convert to base64 Data URL
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

      if (base64) {
        newUrls.push(base64);
      }
    }

    if (newUrls.length > 0) {
      const currentParsed = parseFieldValue(valueRef.current);
      updateCombinedValue([...currentParsed.images, ...newUrls], currentParsed.currentText);
    }

    setIsUploading(false);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement | HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Stop event bubbling so paste handler is never called twice
    e.stopPropagation();

    const imageFiles: File[] = [];

    // 1. Check clipboardData.files first
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        }
      }
    } else if (clipboardData.items) {
      // 2. Browser clipboard items (take 1 image per single clipboard copy to avoid browser duplicates)
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
            break;
          }
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      await handleUploadFiles(imageFiles);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentParsed = parseFieldValue(valueRef.current);
    const nextImages = currentParsed.images.filter((_, idx) => idx !== indexToRemove);
    updateCombinedValue(nextImages, currentParsed.currentText);
  };

  const handleTextChange = (newText: string) => {
    const currentParsed = parseFieldValue(valueRef.current);
    updateCombinedValue(currentParsed.images, newText);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {isRequired && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      {/* Bordered field container matching standard input style */}
      <div
        tabIndex={-1}
        onClick={() => inputRef.current?.focus()}
        onPaste={handlePaste}
        className={`min-h-10 w-full rounded-md border border-input bg-background px-2.5 py-1.5 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors cursor-text ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Render big image previews side-by-side */}
        {images.map((imgSrc, idx) => (
          <div
            key={idx}
            className="relative group shrink-0 rounded-md overflow-hidden bg-muted/20 p-1 flex items-center justify-center"
          >
            <img
              src={imgSrc}
              alt={`Pasted image ${idx + 1}`}
              className="h-28 w-auto max-w-[180px] object-contain rounded"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(idx);
              }}
              className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-background/80 hover:bg-destructive hover:text-white shadow-xs flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
              title={t("common.clear", "Remove")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Text Input for typing or pasting more images */}
        <input
          ref={inputRef}
          id={id}
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            images.length === 0
              ? placeholder ||
                t("vocabulary.enterFieldPlaceholder", {
                  label: label.toLowerCase(),
                })
              : ""
          }
          disabled={disabled || isUploading}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />

        {isUploading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto shrink-0">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[11px]">{t("vocabulary.uploadingImage", "Uploading...")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardFieldInput;
