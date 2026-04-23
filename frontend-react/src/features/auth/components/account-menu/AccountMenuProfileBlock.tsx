import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { getInitials } from "@/shared/lib/utils";

interface AccountMenuProfileBlockProps {
  avatar?: string | null;
  displayName: string;
  onViewProfile: () => void;
}

export function AccountMenuProfileBlock({
  avatar,
  displayName,
  onViewProfile,
}: AccountMenuProfileBlockProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-3xl font-medium leading-tight">{displayName}</p>
        <button
          type="button"
          onClick={onViewProfile}
          className="mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View profile
        </button>
      </div>
    </div>
  );
}
