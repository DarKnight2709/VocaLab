import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getInitials } from "@/shared/lib/utils";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMeQuery } from "@/features/auth/api/authService";
import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";
import ROUTES from "@/shared/lib/routes";
import ProfileActionButtons from "@/features/user/components/ProfileActionButtons";
import ProfileStatsGrid from "@/features/user/components/ProfileStatsGrid";
import ProfileContentSection from "@/features/user/components/ProfileContentSection";

export default function ProfilePage() {
  const { fullName } = useParams<{ fullName: string }>();
  const { data: me } = useMeQuery();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const displayName = useMemo(
    () => me?.fullName || me?.username || fullName || "User",
    [me, fullName],
  );
  const username = useMemo(
    () =>
      me?.username ||
      (fullName ? fullName.toLowerCase().replace(/\s+/g, "_") : "user"),
    [me, fullName],
  );
  const isOwnProfile = useMemo(() => {
    const current = fullName || "";
    return current === me?.fullName || current === me?.username;
  }, [fullName, me]);
  const stats = useMemo(
    () => [
      { label: "Followers", value: 0 },
      { label: "Following", value: 0 },
      { label: "Friends", value: 0 },
      { label: "Posts", value: 0 },
    ],
    [],
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Trang cá nhân" }]} />

        {/* Profile Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <Avatar className="h-36 w-36 min-h-36 min-w-36 flex-none border-4 border-background shadow-lg lg:h-48 lg:w-48 lg:min-h-48 lg:min-w-48">
            <AvatarImage src={me?.avatar || undefined} />
            <AvatarFallback className="text-3xl">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 lg:max-w-4xl">
            <div>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="mt-1 text-muted-foreground">@{username}</p>
            </div>

            <div className="mt-4">
              <ProfileStatsGrid stats={stats} />
            </div>

            <div className="mt-5">
              <ProfileActionButtons
                isOwnProfile={isOwnProfile}
                onEditProfile={() => setProfileOpen(true)}
              />
            </div>
          </div>
        </div>

        <ProfileContentSection />
      </div>

      <EditProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        me={me}
        onSuccess={(values) => {
          const nextName =
            values.fullName ?? me?.fullName ?? me?.username ?? "user";
          const nextProfileUrl = ROUTES.PROFILE.url.replace(
            ":fullName",
            encodeURIComponent(nextName),
          );
          navigate(nextProfileUrl, { replace: true });
        }}
      />
    </div>
  );
}
