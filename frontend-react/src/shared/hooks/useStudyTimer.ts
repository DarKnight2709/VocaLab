// hooks/useStudyTimer.ts
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import API_ROUTES from "../lib/api-routes";
import { api, getErrorMessage } from "../lib/api";
import { toast } from "sonner";
import i18n from "../i18n";

const HEARTBEAT_INTERVAL_MS = 30000; // Ping backend every 30 seconds
const IDLE_THRESHOLD_MS = 60000; // Pause if idle for 60 seconds

export function useStudyTimer() {
  const [isActive, setIsActive] = useState(true);
  
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef<number>(Date.now());
  const secondsAccumulatedRef = useRef<number>(0);

  const updateActiveStatus = (status: boolean) => {
    isActiveRef.current = status;
    setIsActive(status);
  };

  const { mutateAsync: saveProgressMutation } = useMutation({
    mutationFn: (seconds: number) =>
      api.post(API_ROUTES.PROGRESS.HEARTBEAT, { seconds }),
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("common.actionFailed")));
    },
  });

  useEffect(() => {
    const recordActivity = () => {
      lastActivityRef.current = Date.now();
      if (!isActiveRef.current) updateActiveStatus(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActiveStatus(false); // Instantly pause if they swap tabs
      } else {
        recordActivity();
      }
    };

    const handleFinalSync = () => {
      if (secondsAccumulatedRef.current > 5) {
        const payload = new Blob(
          [JSON.stringify({ seconds: secondsAccumulatedRef.current })],
          { type: "application/json" }
        );
        navigator.sendBeacon(API_ROUTES.PROGRESS.HEARTBEAT, payload);
      }
    };

    window.addEventListener("mousemove", recordActivity);
    window.addEventListener("keydown", recordActivity);
    window.addEventListener("click", recordActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleFinalSync);

    const timerInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;

      if (timeSinceLastActivity > IDLE_THRESHOLD_MS) {
        if (isActiveRef.current) updateActiveStatus(false);
      }

      if (isActiveRef.current && !document.hidden) {
        secondsAccumulatedRef.current += 1;

        if (secondsAccumulatedRef.current >= HEARTBEAT_INTERVAL_MS / 1000) {
          const secondsToSend = secondsAccumulatedRef.current;
          secondsAccumulatedRef.current = 0;

          saveProgressMutation(secondsToSend);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener("mousemove", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("click", recordActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleFinalSync);
    };
  }, []);

  return { isIdle: !isActive };
}