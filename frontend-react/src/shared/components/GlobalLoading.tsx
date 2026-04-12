import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import React from "react";

export default function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, loadingMessage } = useAppSelector((s) => s.ui);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex gap-20 flex-col justify-center items-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner isLoading={loading} />
        {loadingMessage && (
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
