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
import { useStatsQuery, useUserByUsernameQuery } from "@/features/user/api/userService";

export default function ProfilePage() {
  const { username: urlUsername } = useParams<{ username: string }>();
  const { data: me } = useMeQuery();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const normalizedUsername = useMemo(
    () => decodeURIComponent(urlUsername || "").trim(),
    [urlUsername],
  );

  const { data: matchedUser, isLoading: resolvingProfileUser } =
    useUserByUsernameQuery(normalizedUsername);
  
  const isOwnProfile = matchedUser?.id === me?.id;

  const profileUser = isOwnProfile ? me : matchedUser;
  const shouldShowNotFound =
    !isOwnProfile && !resolvingProfileUser && !profileUser;

  const profileUserId = useMemo(
    () => profileUser?.id,
    [profileUser?.id],
  );

  // lấy stats
  const {data: userStats} = useStatsQuery(profileUserId);

  const stats = useMemo(
    () => [
      { label: "Followers", value: userStats?.followers ?? 0 },
      { label: "Following", value: userStats?.following ?? 0 },
      { label: "Friends", value: userStats?.friends ?? 0},
      { label: "Posts", value: userStats?.posts ?? 0 },
    ],
    [userStats],
  );

  if (shouldShowNotFound) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Breadcrumb items={[{ label: "Trang cá nhân" }]} />
          <div className="rounded-xl border bg-muted/20 p-8 text-center">
            <h2 className="text-2xl font-semibold">Không tìm thấy người dùng</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đường dẫn hồ sơ không tồn tại hoặc đã bị thay đổi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Trang cá nhân" }]} />

        {/* Profile Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <Avatar className="h-36 w-36 min-h-36 min-w-36 flex-none border-4 border-background shadow-lg lg:h-48 lg:w-48 lg:min-h-48 lg:min-w-48">
            <AvatarImage src={profileUser?.avatar || undefined} />
            <AvatarFallback className="text-3xl">
              {getInitials(profileUser?.fullName || profileUser?.username)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 lg:max-w-4xl">
            <div>
              <h1 className="text-3xl font-bold">{profileUser?.fullName || profileUser?.username}</h1>
              <p className="mt-1 text-muted-foreground">@{profileUser?.username}</p>
            </div>

            <div className="mt-4">
              <ProfileStatsGrid stats={stats} />
            </div>

            <div className="mt-5">
              <ProfileActionButtons
                isOwnProfile={isOwnProfile}
                onEditProfile={() => setProfileOpen(true)}
                profileUserId={profileUserId}
              />
            </div>
          </div>
        </div>

        <ProfileContentSection userId={profileUserId} isOwnProfile={isOwnProfile} />
      </div>

      <EditProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        me={me}
        onSuccess={(values) => {
          const nextName =
            values.fullName ?? me?.fullName ?? me?.username ?? "user";
          const nextProfileUrl = ROUTES.PROFILE.url.replace(
            ":username",
            encodeURIComponent(nextName),
          );
          navigate(nextProfileUrl, { replace: true });
        }}
      />
    </div>
  );
}
