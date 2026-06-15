import { Link } from "react-router";
import type { UserResult } from "../api/searchService";
import ROUTES from "@/shared/lib/routes";

export function UserCard({ user }: { user: UserResult }) {
  return (
    <Link
      to={ROUTES.PROFILE.url.replace(":username", user.username)}
      className="flex items-center gap-3 rounded-xl bg-card p-4 transition-all hover:bg-accent/5"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold uppercase text-muted-foreground">
            {user.fullName[0]}
          </div>
        )}
      </div>
      <div>
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </Link>
  );
}