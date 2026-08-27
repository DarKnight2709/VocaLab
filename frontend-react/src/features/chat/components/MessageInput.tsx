import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Input } from "@/shared/components/ui/input";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { createPortal } from "react-dom";
import { Smile, Paperclip, Send, X, Eye } from "lucide-react";
import { useState, useRef } from "react";
import { GifPicker } from "./GifPicker";

type PendingFile = {
  file: File;
  previewUrl: string | null; // only set for images
};

type PendingGif = {
  url: string;
  name: string;
};

type MessageInputProps = {
  messageText: string;
  onMessageTextChange: (value: string) => void;
  onTyping: () => void;
  onSend: (files: File[], gifs?: { url: string; name: string }[]) => void;
  onEmojiClick: (emoji: string) => void;
};

export function MessageInput({
  messageText,
  onMessageTextChange,
  onTyping,
  onEmojiClick,
  onSend,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingGifs, setPendingGifs] = useState<PendingGif[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newEntries: PendingFile[] = files.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setPendingFiles((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setPendingFiles((prev) => {
      const entry = prev[index];
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleRemoveGif(index: number) {
    setPendingGifs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleClearAll() {
    pendingFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setPendingFiles([]);
    setPendingGifs([]);
  }

  function handleSend() {
    onSend(
      pendingFiles.map((p) => p.file),
      pendingGifs
    );
    handleClearAll();
  }

  return (
    <div className="border-t border-border/60 p-3.5 bg-card/60 backdrop-blur-xs shrink-0">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData: EmojiClickData) => {
              onEmojiClick(emojiData.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div className="absolute bottom-20 z-50">
          <GifPicker
            onSelect={(url, title) => {
              setPendingGifs((prev) => [...prev, { url, name: title || t("chat.gif") }]);
              setShowGifPicker(false);
            }}
          />
        </div>
      )}

      {/* Hidden file input — multiple allowed */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox modal using Portal */}
      {lightboxUrl && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title={t("common.close", { defaultValue: "Close" })}
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={lightboxUrl}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain select-none border border-white/10"
            onClick={(e) => e.stopPropagation()}
            alt="Preview"
          />
        </div>,
        document.body
      )}

      {/* File & GIF previews */}
      {(pendingFiles.length > 0 || pendingGifs.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2.5">
          {/* Files */}
          {pendingFiles.map((entry, i) => (
            <div key={i} className="relative group/chip">
              {entry.previewUrl ? (
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted">
                  <img
                    src={entry.previewUrl}
                    className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    title={entry.file.name}
                    onClick={() => setLightboxUrl(entry.previewUrl)}
                  />
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="absolute top-1 right-1 z-10 h-5 w-5 rounded-full bg-black/70 text-white hover:bg-destructive flex items-center justify-center transition-all shadow-xs"
                    title={t("chat.remove")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Click to preview indicator overlay */}
                  <div
                    onClick={() => setLightboxUrl(entry.previewUrl)}
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover/chip:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white pointer-events-none"
                  >
                    <Eye className="h-4 w-4 drop-shadow" />
                  </div>
                </div>
              ) : (
                // Non-image: pill chip
                <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-xl px-3 py-2 text-sm max-w-48 shadow-xs">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground text-xs font-medium">{entry.file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="shrink-0 ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    title={t("chat.remove")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* GIFs */}
          {pendingGifs.map((gif, i) => (
            <div key={`gif-${i}`} className="relative group/chip">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted">
                <img
                  src={gif.url}
                  className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  title={gif.name}
                  onClick={() => setLightboxUrl(gif.url)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGif(i)}
                  className="absolute top-1 right-1 z-10 h-5 w-5 rounded-full bg-black/70 text-white hover:bg-destructive flex items-center justify-center transition-all shadow-xs"
                  title={t("chat.remove")}
                >
                  <X className="h-3 w-3" />
                </button>
                <div
                  onClick={() => setLightboxUrl(gif.url)}
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover/chip:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white pointer-events-none"
                >
                  <Eye className="h-4 w-4 drop-shadow" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-2xl p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        {/* File picker */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          title={t("chat.attachFile", { defaultValue: "Attach file" })}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Emoji picker toggle */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
          }}
          className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          title="Emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* GIF picker toggle */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
          }}
          className="h-9 px-2.5 rounded-xl hover:bg-muted font-bold text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          GIF
        </Button>

        <Input
          placeholder={t("chat.typeMessage")}
          value={messageText}
          onChange={(e) => {
            onMessageTextChange(e.target.value);
            onTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-sm shadow-none placeholder:text-muted-foreground"
        />

        <Button
          type="button"
          onClick={handleSend}
          disabled={!messageText.trim() && pendingFiles.length === 0 && pendingGifs.length === 0}
          className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all flex items-center justify-center shrink-0 p-0 shadow-xs"
          title={t("chat.send")}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
