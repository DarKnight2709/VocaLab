import { useAuthStore } from "@/features/auth/stores/authStore";

/**
 * Hook to check auth status in pages that work for both guests and authenticated users.
 * Returns auth state without redirecting — use in public/optional-auth pages.
 */
export function useOptionalAuth() {
  const isAuth = useAuthStore((s) => s.isAuth);
  const userId = useAuthStore((s) => s.userId);

  return { isAuth, userId };
}
