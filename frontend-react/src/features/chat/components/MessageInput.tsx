import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Smile, Paperclip } from "lucide-react";
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
    <div className="border-t p-4 bg-card">
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
              setPendingGifs((prev) => [...prev, { url, name: title || "GIF" }]);
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

      {/* Lightbox modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          tabIndex={-1}
        >
          <img
            src={lightboxUrl}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* File & GIF previews */}
      {(pendingFiles.length > 0 || pendingGifs.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {/* Files */}
          {pendingFiles.map((entry, i) => (
            <div key={i} className="relative">
              {entry.previewUrl ? (
                // Image chip: clickable to preview, remove button at top-right
                <div className="relative h-20 w-20 rounded-xl overflow-visible">
                  <img
                    src={entry.previewUrl}
                    className="h-20 w-20 object-cover rounded-xl border shadow-sm cursor-pointer"
                    title={entry.file.name}
                    onClick={() => setLightboxUrl(entry.previewUrl)}
                  />
                  {/* Always-visible top-right remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="absolute -top-2 -right-2 z-10 h-5 w-5 rounded-full bg-background border border-border shadow flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    title="Xóa"
                  >
                    <span className="text-sm leading-none">&times;</span>
                  </button>
                </div>
              ) : (
                // Non-image: pill chip
                <div className="flex items-center gap-1.5 bg-muted border rounded-full px-3 py-1.5 text-sm max-w-45">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">{entry.file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="shrink-0 ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Xóa"
                  >
                    <span className="text-base font-light leading-none">&times;</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* GIFs */}
          {pendingGifs.map((gif, i) => (
            <div key={`gif-${i}`} className="relative">
              {/* Image chip: clickable to preview, remove button at top-right */}
              <div className="relative h-20 w-20 rounded-xl overflow-visible">
                <img
                  src={gif.url}
                  className="h-20 w-20 object-cover rounded-xl border shadow-sm cursor-pointer"
                  title={gif.name}
                  onClick={() => setLightboxUrl(gif.url)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGif(i)}
                  className="absolute -top-2 -right-2 z-10 h-5 w-5 rounded-full bg-background border border-border shadow flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  title="Xóa"
                >
                  <span className="text-sm leading-none">&times;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {/* File picker */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
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
        >
          <Smile className="h-5 w-5" />
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
          className="font-bold text-muted-foreground"
        >
          GIF
        </Button>

        <Input
          placeholder="Nhập tin nhắn..."
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
        />

        <Button
          type="button"
          onClick={handleSend}
          disabled={!messageText.trim() && pendingFiles.length === 0 && pendingGifs.length === 0}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}
