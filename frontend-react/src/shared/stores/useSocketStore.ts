// stores/socketStore.ts

// This file creates a global Zustand store:
// - manages a single Socket.IO instance to avoid duplicate connections
// - tracks connection state (isConnected, isConnecting, error)
// - connects with a JWT token
// - handles reconnects, connection errors, and auth errors
// - shows user-facing errors with Sonner toast
// - prevents repeated connect calls while already connecting
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { create } from 'zustand'
import envConfig from '../config/envConfig'
import i18n from '@/shared/i18n'

const getAccessTokenFromAuthStorage = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-vocalab-storage')
    if (!raw) return null

    const parsed = JSON.parse(raw) as { state?: { token?: { accessToken?: string } } }
    return parsed?.state?.token?.accessToken ?? null
  } catch {
    return null
  }
}

interface SocketState {
  socket: Socket | null  // current socket instance
  isConnected: boolean
  isConnecting: boolean  // true while connecting to prevent duplicate calls
  error: string | null
  connect: (token?: string) => void  // connect, disconnect, manual setters
  disconnect: () => void
  setConnected: (connected: boolean) => void
  setError: (error: string | null) => void
  setConnecting: (connecting: boolean) => void
}

// set: updates the store state
// get: reads the current store state before connecting
export const useSocketStore = create<SocketState>()((set, get) => ({
  // default state before any connection is established
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: (accessToken?: string) => {
    const { socket, isConnected } = get()

    // already connected, nothing to do
    if (socket && isConnected) {
      return
    }

    // currently connecting, do not reconnect
    if (get().isConnecting) {
      return
    }

    // mark the connection attempt as in progress
    set({ isConnecting: true, error: null })

    try {
      const token = accessToken ?? getAccessTokenFromAuthStorage()

      if (!token) {
        toast.error(i18n.t('socket.missingToken'), {
          description: i18n.t('socket.signInToContinue')
        })
        set({ isConnecting: false, error: i18n.t('socket.missingToken') })
        return
      }

      // create the socket instance
      const newSocket = io(`${envConfig.VITE_SOCKET_URL}`, {
        auth: { token: token }, // send the access token for server auth
        transports: ['websocket'], // websocket only, no polling fallback
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })


      // successful connection
      newSocket.on('connect', () => {
        set({
          isConnected: true,
          isConnecting: false,
          error: null,
          socket: newSocket
        })
      })


      // disconnected
      newSocket.on('disconnect', (reason: any) => {
        set({
          isConnected: false,
          isConnecting: false,
          error: reason === 'io server disconnect' ? i18n.t('socket.serverDisconnected') : null
        })
      })


      // connection error
      newSocket.on('connect_error', (err: any) => {
        // Backend rejects the handshake with Error('auth_error') when JWT is missing or invalid.
        if (err?.message === 'auth_error') {
          toast.error(i18n.t('socket.authFailed'), {
            description: i18n.t('socket.checkSignInDetails')
          })
          set({
            isConnected: false,
            isConnecting: false,
            error: i18n.t('socket.authFailed')
          })
          return
        }

        toast.error(i18n.t('socket.connectionFailed'), {
          description: i18n.t('socket.checkInternet')
        })
        set({
          isConnected: false,
          isConnecting: false,
          error: i18n.t('socket.connectionFailed')
        })
      })

      set({ socket: newSocket })
    } catch {
      toast.error(i18n.t('socket.connectionFailed'), {
        description: i18n.t('socket.checkInternet')
      })
      set({
        isConnecting: false,
        error: i18n.t('socket.connectionFailed')
      })
    }
  },

  // use this on logout, account switch, or when leaving the app
  disconnect: () => {
    const { socket } = get()

    if (socket) {
      socket.disconnect()
      set({
        socket: null,
        isConnected: false,
        isConnecting: false,
        error: null
      })
    }
  },

  // manual setters for components that need direct state updates
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setError: (error: string | null) => set({ error }),
  setConnecting: (connecting: boolean) => set({ isConnecting: connecting })
}))
