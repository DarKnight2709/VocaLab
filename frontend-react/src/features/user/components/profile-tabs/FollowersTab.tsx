import { ChevronLeft, ChevronRight, UserX } from "lucide-react";
import { useState } from "react";
import { useUserFollowersQuery } from "../../api/userService";
import { UserCard } from "../UserCard";

interface FollowersTabProps {
  userId: string;
  search: string;
}

export default function FollowersTab({ userId, search }: FollowersTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserFollowersQuery(userId, page, 12, search);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-24 animate-pulse items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition-all">
            <div className="h-14 w-14 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const followers = data?.followers ?? [];

  if (followers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-muted/30">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/5 group-hover:bg-primary/10" />
          <UserX className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có người theo dõi"}
        </h3>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground leading-relaxed">
          {search ? "Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả." : "Danh sách những người theo dõi profile này sẽ được tổng hợp tại đây."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {followers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {data!.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-muted/30 border border-white/5 text-xs font-semibold tabular-nums">
            Trang {page} <span className="mx-1 text-muted-foreground">/</span> {data!.meta.totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data!.meta.totalPages, p + 1))}
            disabled={page === data!.meta.totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
