import { Link } from "react-router";
import { LogIn } from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Button } from "@/shared/components/ui/button";

interface LoginPromptProps {
  /** The action the user needs to sign in for, e.g., "vote", "comment", "save" */
  action?: string;
  /** Display variant */
  variant?: "inline" | "banner" | "compact";
  className?: string;
}

/**
 * Reusable component that prompts guests to sign in.
 * Shows differently based on context:
 * - `inline`: Replaces a button with a "Sign in to [action]" button
 * - `banner`: Full-width banner with description
 * - `compact`: Small text link
 */
export default function LoginPrompt({
  action,
  variant = "inline",
  className = "",
}: LoginPromptProps) {
  const { t } = useTranslation();

  if (variant === "banner") {
    return (
      <div
        className={`flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary/20 bg-primary/5 px-6 py-8 text-center ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {action
              ? t("auth.signInTo").replace("{action}", action)
              : t("auth.signInToAccess")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("auth.signInDescription")}
          </p>
        </div>
        <Link to={ROUTES.LOGIN.url}>
          <Button size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            {t("auth.signIn")}
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={ROUTES.LOGIN.url}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline ${className}`}
      >
        <LogIn className="h-3 w-3" />
        {action
          ? t("auth.signInTo").replace("{action}", action)
          : t("auth.signIn")}
      </Link>
    );
  }

  // Default: inline variant (replaces a button)
  return (
    <Link to={ROUTES.LOGIN.url} className={className}>
      <Button variant="outline" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        {action
          ? t("auth.signInTo").replace("{action}", action)
          : t("auth.signIn")}
      </Button>
    </Link>
  );
}
