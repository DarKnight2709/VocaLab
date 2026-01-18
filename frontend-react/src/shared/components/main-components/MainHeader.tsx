import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search } from "lucide-react";
import { getInitials } from "@/shared/lib/utils";

import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import ROUTES from "@/shared/lib/routes";
import type {
  MeResponse,
} from "@/shared/validations/AuthSchema";
import {
  useLogoutMutation,
} from "@/features/auth/api/authService";
import { toast } from "sonner";

export default function MainHeader({ me }: { me: MeResponse | undefined }) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      navigate(ROUTES.LOGIN.url);
    } catch (error) {
      // toast
      toast.error("Đăng xuất thất bại.");
    }
  }

  function onHeaderSearchChange(value: string) {
    setHeaderSearch(value);
  }

  function onProfileOpenChange(open: boolean) {
    setProfileOpen(open);
  }

  const displayName = useMemo(() => {
    return (me as any)?.fullName || (me as any)?.username || "User";
  }, [me]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-sm">
        <div className="h-18 px-6 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.BLOG.url}
              aria-label="Mở blog"
              className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <img src="/logo.png" alt="Blog app" className="h-10 w-10" />
            </Link>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/80" />
            <Input
              value={headerSearch}
              onChange={(e) => onHeaderSearchChange(e.target.value)}
              placeholder="Tìm kiếm trên Blog..."
              className="h-9 pl-8 bg-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/70 border-primary-foreground/25 focus-visible:ring-primary-foreground/50"
            />
          </div>

          {/* <div className="hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              onClick={() => navigate(ROUTES.BLOG.url)}
            >
              Blogs
            </Button>
          </div> */}

          <button
            type="button"
            onClick={() => onProfileOpenChange(true)}
            className="ml-auto"
            aria-label="Mở thông tin cá nhân"
          >
            <Avatar className="h-11 w-11 border border-primary-foreground/30">
              <AvatarImage src={(me as any)?.avatar} />
              <AvatarFallback className="text-primary bg-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      <EditProfileDialog
        open={profileOpen}
        onOpenChange={onProfileOpenChange}
        me={me}
        onLogout={handleLogout}
      />
    </>
  );
}
