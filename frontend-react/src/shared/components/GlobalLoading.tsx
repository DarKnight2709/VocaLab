// GlobalLoading.tsx
import React from "react";

export default function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tạm thời bỏ logic loading cho đến khi bạn tạo useUiStore bằng Zustand
  return <>{children}</>;
}
