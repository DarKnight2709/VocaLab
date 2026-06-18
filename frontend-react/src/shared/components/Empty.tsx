import { useTranslation } from "@/shared/hooks/useTranslation";

interface EmptyProps {
  query?: string;
  type?: string;
  message?: string;
}

export default function Empty({ query, type, message }: EmptyProps) {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center text-muted-foreground">
      <p className="text-sm">
        {message || t("search.noResults", { type: type || "", query: query || "" })}
      </p>
    </div>
  );
}
