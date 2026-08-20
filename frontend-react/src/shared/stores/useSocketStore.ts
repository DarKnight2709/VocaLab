// stores/socketStore.ts

// This file creates a global Zustand store:
// - manages a single Socket.IO instance to avoid duplicate connections
// - tracks connection state (isConnected, isConnecting, error)
// - connects automatically using HttpOnly cookies
// - handles reconnects, connection errors, and auth errors
// - shows user-facing errors with Sonner toast
// - prevents repeated connect calls while already connecting
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { create } from "zustand";
import envConfig from "../config/envConfig";
import i18n from "@/shared/i18n";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

interface SocketState {
  socket: Socket | null; // current socket instance
  isConnected: boolean;
  isConnecting: boolean; // true while connecting to prevent duplicate calls
  error: string | null;
  connect: () => void; // connect, disconnect, manual setters
  handleSocketError: (error: any, retry?: () => void) => Promise<void>;
  disconnect: () => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setConnecting: (connecting: boolean) => void;
}

let _isRefreshing = false;
let _refreshQueue: (() => void)[] = [];

export const useSocketStore = create<SocketState>()((set, get) => ({
  // default state before any connection is established
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: () => {
    const { socket, isConnected } = get();

    // already connected, nothing to do
    if (socket && isConnected) {
      return;
    }

    // currently connecting, do not reconnect
    if (get().isConnecting) {
      return;
    }

    // mark the connection attempt as in progress
    set({ isConnecting: true, error: null });

    try {
      // create the socket instance
      const newSocket = io(`${envConfig.VITE_SOCKET_URL}`, {
        withCredentials: true,
        transports: ["websocket"], // websocket only, no polling fallback
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // successful connection
      newSocket.on("connect", () => {
        set({
          isConnected: true,
          isConnecting: false,
          error: null,
          socket: newSocket,
        });
      });

      // disconnected
      newSocket.on("disconnect", (reason: any) => {
        set({
          isConnected: false,
          isConnecting: false,
          error:
            reason === "io server disconnect"
              ? i18n.t("socket.serverDisconnected")
              : null,
        });
      });

      // connection error
      newSocket.on("connect_error", (err: any) => {
        if (err?.message === "auth_error") {
          set({
            isConnected: false,
            isConnecting: false,
            error: i18n.t("socket.authFailed"),
          });
          return;
        }

        toast.error(i18n.t("socket.connectionFailed"), {
          description: i18n.t("socket.checkInternet"),
        });
        set({
          isConnected: false,
          isConnecting: false,
          error: i18n.t("socket.connectionFailed"),
        });
      });

      set({ socket: newSocket });
    } catch {
      toast.error(i18n.t("socket.connectionFailed"), {
        description: i18n.t("socket.checkInternet"),
      });
      set({
        isConnecting: false,
        error: i18n.t("socket.connectionFailed"),
      });
    }
  },

  handleSocketError: async (error: any, retry?: () => void) => {
    const message = typeof error === "string" ? error : error?.message;
    if (message === "INVALID_TOKEN" || message === "UNAUTHORIZED") {

      if (_isRefreshing) {
        if (retry) _refreshQueue.push(retry);
        return;
      }

      _isRefreshing = true;

      try {
        await api.post(API_ROUTES.AUTH.REFRESH_TOKEN);
        get().disconnect();
        get().connect();

        const onConnect = () => {
          if (retry) retry();
          _refreshQueue.forEach((r) => r());
          _refreshQueue = [];
          _isRefreshing = false;
        };

        const newSocket = get().socket;
        if (newSocket) {
          if (newSocket.connected) {
            onConnect();
          } else {
            newSocket.once("connect", onConnect);
          }
        } else {
          _isRefreshing = false;
        }
      } catch (err) {
        useAuthStore.getState().logout();
        _isRefreshing = false;
        _refreshQueue = [];
      }
    }
  },

  // use this on logout, account switch, or when leaving the app
  disconnect: () => {
    const { socket } = get();

    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    }
  },

  // manual setters for components that need direct state updates
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setError: (error: string | null) => set({ error }),
  setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),
}));
