import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getInitials } from "../utils";
import type { CallState } from "../hooks/useVoiceCall";
import { useTranslation } from "@/shared/hooks/useTranslation";

type CallOverlayProps = {
  callState: CallState;
  peerName: string;
  peerAvatar?: string;
  isMuted: boolean;
  callDuration: number;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CallOverlay({
  callState,
  peerName,
  peerAvatar,
  isMuted,
  callDuration,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
}: CallOverlayProps) {
  const { t } = useTranslation();
  if (callState === "idle") return null;

  const statusText: Record<Exclude<CallState, "idle">, string> = {
    calling: t("chat.calling"),
    incoming: t("chat.incomingCall"),
    connecting: t("chat.connecting"),
    active: formatDuration(callDuration),
    ended: t("chat.callEnded"),
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-card p-8 shadow-2xl border min-w-75">
        {/* Avatar */}
        <Avatar className="h-24 w-24">
          <AvatarImage src={peerAvatar} />
          <AvatarFallback className="text-2xl font-bold">
            {getInitials(peerName || "User")}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <div className="text-center">
          <div className="text-xl font-semibold">{peerName}</div>
          <div
            className={`text-sm mt-1 ${callState === "active" ? "text-green-500 font-mono" : "text-muted-foreground"}`}
          >
            {statusText[callState]}
          </div>
        </div>

        {/* Pulse animation for ringing states */}
        {(callState === "calling" || callState === "incoming") && (
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Incoming call: Accept + Reject */}
          {callState === "incoming" && (
            <>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={onReject}
                title={t("chat.reject")}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 text-white"
                onClick={onAccept}
                title={t("chat.accept")}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Calling (outgoing ringing): Cancel */}
          {callState === "calling" && (
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14"
              onClick={onEnd}
              title={t("chat.cancelCall")}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}

          {/* Active or connecting: Mute + End */}
          {(callState === "active" || callState === "connecting") && (
            <>
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={onToggleMute}
                title={isMuted ? t("chat.unmute") : t("chat.mute")}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14"
                onClick={onEnd}
                title={t("chat.endCall")}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hidden audio element for remote stream */}
      <audio id="remote-call-audio" autoPlay className="hidden" />
    </div>
  );
}
