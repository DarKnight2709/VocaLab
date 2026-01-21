import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type MessageInputProps = {
  messageText: string;
  onMessageTextChange: (value: string) => void;
  onTyping: () => void;
  onSend: () => void;
};

export function MessageInput({
  messageText,
  onMessageTextChange,
  onTyping,
  onSend,
}: MessageInputProps) {
  return (
    <div className="border-t p-4 bg-card">
      <div className="flex gap-2">
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
              onSend();
            }
          }}
        />
        <Button
          onClick={onSend}
          disabled={!messageText.trim()}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}


