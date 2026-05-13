import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import i18n from "@/shared/i18n";

export type CallState =
  | "idle"
  | "calling" // outgoing call ringing
  | "incoming" // incoming call ringing
  | "connecting" // WebRTC negotiating
  | "active" // call in progress
  | "ended";

export type IncomingCallInfo = {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useVoiceCall(
  socketRef: React.RefObject<Socket | null>,
) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peerName, setPeerName] = useState<string>("");
  const [peerAvatar, setPeerAvatar] = useState<string | undefined>();
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const incomingInfoRef = useRef<IncomingCallInfo | null>(null);

  // Cleanup everything
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setCallDuration(0);
    setIsMuted(false);
  }, []);

  // Get microphone access
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      return stream;
    } catch {
      toast.error(i18n.t("chat.micAccessError"));
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    (remoteUserId: string) => {
      const socket = socketRef.current;
      if (!socket) return null;

      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            receiverId: remoteUserId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallState("active");
          setCallDuration(0);
          timerRef.current = setInterval(() => {
            setCallDuration((d) => d + 1);
          }, 1000);
        }
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          endCall();
        }
      };

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pcRef.current = pc;
      return pc;
    },
    [socketRef],
  );

  // Start outgoing call
  const startCall = useCallback(
    async (targetUserId: string, targetName: string, targetAvatar?: string) => {
      const socket = socketRef.current;
      if (!socket || callState !== "idle") return;

      const stream = await getLocalStream();
      if (!stream) return;

      setPeerId(targetUserId);
      setPeerName(targetName);
      setPeerAvatar(targetAvatar);
      setCallState("calling");

      socket.emit(
        "call-user",
        { receiverId: targetUserId },
        (res: { success: boolean; message?: string }) => {
          if (!res?.success) {
            toast.error(res?.message || i18n.t("chat.cannotCallUser")); // Need to add this key or use a generic one
            cleanup();
            setCallState("idle");
            setPeerId(null);
          }
        },
      );
    },
    [socketRef, callState, getLocalStream, cleanup],
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    const socket = socketRef.current;
    const info = incomingInfoRef.current;
    if (!socket || !info) return;

    const stream = await getLocalStream();
    if (!stream) return;

    setCallState("connecting");
    socket.emit("call-answer", { callerId: info.callerId });
  }, [socketRef, getLocalStream]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    const socket = socketRef.current;
    const info = incomingInfoRef.current;
    if (!socket || !info) return;

    socket.emit("call-reject", { callerId: info.callerId });
    cleanup();
    setCallState("idle");
    setPeerId(null);
    incomingInfoRef.current = null;
  }, [socketRef, cleanup]);

  // End active call
  const endCall = useCallback(() => {
    const socket = socketRef.current;
    if (socket && peerId) {
      socket.emit("call-end", { peerId });
    }
    cleanup();
    setCallState("idle");
    setPeerId(null);
    incomingInfoRef.current = null;
  }, [socketRef, peerId, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onIncomingCall = (data: IncomingCallInfo) => {
      if (callState !== "idle") {
        // Already in a call, auto-reject
        socket.emit("call-reject", { callerId: data.callerId });
        return;
      }
      incomingInfoRef.current = data;
      setPeerId(data.callerId);
      setPeerName(data.callerName);
      setPeerAvatar(data.callerAvatar);
      setCallState("incoming");
    };

    const onCallAnswered = async () => {
      // Caller side: callee accepted → create offer
      setCallState("connecting");
      const pc = createPeerConnection(peerId!);
      if (!pc) return;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { receiverId: peerId, offer });
      } catch (err) {
        console.error("Error creating offer:", err);
        endCall();
      }
    };

    const onCallRejected = () => {
      toast.info(i18n.t("chat.callRejected"));
      cleanup();
      setCallState("idle");
      setPeerId(null);
    };

    const onCallEnded = () => {
      toast.info(i18n.t("chat.callEnded"));
      cleanup();
      setCallState("idle");
      setPeerId(null);
      incomingInfoRef.current = null;
    };

    const onWebRTCOffer = async (data: {
      senderId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      // Callee side: received offer → create answer
      const pc = createPeerConnection(data.senderId);
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { receiverId: data.senderId, answer });
      } catch (err) {
        console.error("Error handling offer:", err);
        endCall();
      }
    };

    const onWebRTCAnswer = async (data: {
      senderId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      // Caller side: received answer
      const pc = pcRef.current;
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    };

    const onICECandidate = async (data: {
      senderId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-answered", onCallAnswered);
    socket.on("call-rejected", onCallRejected);
    socket.on("call-ended", onCallEnded);
    socket.on("webrtc-offer", onWebRTCOffer);
    socket.on("webrtc-answer", onWebRTCAnswer);
    socket.on("ice-candidate", onICECandidate);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-answered", onCallAnswered);
      socket.off("call-rejected", onCallRejected);
      socket.off("call-ended", onCallEnded);
      socket.off("webrtc-offer", onWebRTCOffer);
      socket.off("webrtc-answer", onWebRTCAnswer);
      socket.off("ice-candidate", onICECandidate);
    };
  }, [socketRef, callState, peerId, createPeerConnection, cleanup, endCall]);

  return {
    callState,
    peerId,
    peerName,
    peerAvatar,
    isMuted,
    callDuration,
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  };
}
