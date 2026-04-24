import { ChevronLeft, ChevronRight, UserX } from "lucide-react";
import { useState } from "react";
import { useUserFriendsQuery } from "../../api/userService";
import { Link } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";

interface FriendsTabProps {
  userId: string;
  search: string;
}

export default function FriendsTab({ userId, search }: FriendsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserFriendsQuery(userId, page, 12, search);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-20 animate-pulse items-center gap-3 rounded-2xl border p-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-2 w-1/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const friends = data?.friends ?? [];

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted/60">
          <UserX className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">
          {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có bạn bè"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {search ? "Hãy thử từ khóa khác." : "Danh sách bạn bè sẽ hiển thị ở đây."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {friends.map((user) => (
          <Link
            key={user.id}
            to={ROUTES.PROFILE.url.replace(":username", user.username)}
            className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full border bg-muted">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName || ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary uppercase">
                  {user.fullName?.[0] || user.username[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName || user.username}</p>
              <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>
            </div>
          </Link>
        ))}
      </div>

      {data!.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-muted-foreground">
            Trang {page} / {data!.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data!.meta.totalPages, p + 1))}
            disabled={page === data!.meta.totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
