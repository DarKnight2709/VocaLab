// src/features/notification/hooks/usePushNotifications.ts
import { useEffect } from "react";
import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/shared/config/firebase";
import envConfig from "@/shared/config/envConfig";
import API_ROUTES from "@/shared/lib/api-routes";
import { api, getErrorMessage } from "@/shared/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/shared/i18n";
import { create } from "zustand";

// ── Global Zustand Store for FCM State ────────────────────────
interface FcmState {
  fcmToken: string | null;
  permissionStatus: NotificationPermission;
  setToken: (token: string | null) => void;
  revokeToken: (authToken?: string) => Promise<boolean>;
  setPermission: (status: NotificationPermission) => void;
}

// ── Standalone API Calls (Keeps store actions clean) 

const unregisterTokenOnBackend = (token: string, authToken?: string) => {
  const config: any = { data: { fcmToken: token } };
  if (authToken) {
    config.headers = { Authorization: `Bearer ${authToken}` };
  }
  return api.delete(API_ROUTES.DEVICES.UNREGISTER, config);
};

export const useFcmStore = create<FcmState>((set, get) => ({
  fcmToken: null,
  permissionStatus:
    typeof window !== "undefined" ? Notification.permission : "default",
  setToken: (token) => set({ fcmToken: token }),
  revokeToken: async (authToken?: string) => {
    try {
      // Use standard getToken to grab current token reference or use stored state
      const tokenToDelete =
        get().fcmToken || (await getToken(messaging).catch(() => null));
      if (!tokenToDelete) return true;

      await unregisterTokenOnBackend(tokenToDelete, authToken);
      await deleteToken(messaging);

      set({ fcmToken: null });
      return true;
    } catch (error) {
      console.error("Failed to revoke token:", error);
      return false;
    }
  },
  setPermission: (status) => set({ permissionStatus: status }),
}));

// ── Helper functions ──────────────────────────────────────────

const fetchToken = async (mutateAsync: (variables: string) => Promise<any>) => {
  const swRegistration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );

  await navigator.serviceWorker.ready;

  const fcmToken = await getToken(messaging, {
    vapidKey: envConfig.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  });
  console.log(fcmToken);

  if (fcmToken) {
    await mutateAsync(fcmToken);
    return fcmToken;
  } else {
    console.warn(
      "No registration token available. Request permission to generate one.",
    );
    return null;
  }
};

const getNotificationPermissionAndFcmToken = async (
  mutateAsync: (variables: string) => Promise<any>,
) => {
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return await fetchToken(mutateAsync);
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken(mutateAsync);
    }
  }

  return null;
};

// ── Main Setup Hook (Only Call in MainLayout) ───────────────
export const useFcmToken = () => {
  const setToken = useFcmStore((state) => state.setToken);
  const setPermission = useFcmStore((state) => state.setPermission);

  const { mutateAsync: saveTokenMutation } = useMutation({
    mutationFn: (token: string) =>
      api.post(API_ROUTES.DEVICES.REGISTER, { fcmToken: token }),
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("common.actionFailed")));
    },
  });

  const requestPermission = async (): Promise<void> => {
    try {
      const token =
        await getNotificationPermissionAndFcmToken(saveTokenMutation);
      setToken(token);
      setPermission(Notification.permission);
    } catch (error) {
      console.error("An error occurred while retrieving token:", error);
    }
  };

  useEffect(() => {
    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      toast.info(payload.notification?.title || "New Notification", {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, []);

  return { requestPermission };
};
