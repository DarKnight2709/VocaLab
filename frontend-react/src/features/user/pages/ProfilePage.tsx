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
import { useUserByUsernameQuery } from "@/features/user/api/userService";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Link,
  Globe,
} from "lucide-react";
import { SocialPlatform } from "@/shared/enums/SocialPlatform";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  [SocialPlatform.FACEBOOK]: <Facebook className="w-4 h-4 text-blue-600" />,
  [SocialPlatform.INSTAGRAM]: <Instagram className="w-4 h-4 text-pink-600" />,
  [SocialPlatform.TWITTER]: <Twitter className="w-4 h-4 text-sky-500" />,
  [SocialPlatform.YOUTUBE]: <Youtube className="w-4 h-4 text-red-600" />,
  [SocialPlatform.TIKTOK]: <Globe className="w-4 h-4" />,
  [SocialPlatform.LINKEDIN]: <Linkedin className="w-4 h-4 text-blue-700" />,
  [SocialPlatform.CUSTOM]: <Link className="w-4 h-4 text-gray-600" />,
};

export default function ProfilePage() {
  const { t } = useTranslation();
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
  
  const isOwnProfile = Boolean(me?.id && matchedUser?.id === me?.id);

  const profileUser = isOwnProfile ? me : matchedUser;
  const shouldShowNotFound =
    !isOwnProfile && !resolvingProfileUser && !profileUser;

  const profileUserId = useMemo(
    () => profileUser?.id,
    [profileUser?.id],
  );

  const stats = useMemo(
    () => [
      { label: t("profile.tabs.followers"), value: matchedUser?.stats?.followers ?? 0 },
      { label: t("profile.tabs.following"), value: matchedUser?.stats?.following ?? 0 },
      { label: t("profile.tabs.friends"), value: matchedUser?.stats?.friends ?? 0},
      { label: t("profile.tabs.posts"), value: matchedUser?.stats?.posts ?? 0 },
    ],
    [matchedUser?.stats, t],
  );

  if (shouldShowNotFound) {
    return (
      <div className="h-full overflow-y-scroll p-6 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Breadcrumb items={[{ label: t("common.profile") }]} />
          <div className="rounded-xl bg-muted/20 shadow-sm p-8 text-center">
            <h2 className="text-2xl font-semibold">{t("profile.userNotFound")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("profile.userNotFoundHint")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: t("common.profile") }]} />

        {/* Profile Card Hero */}
        <div className="rounded-3xl bg-card border border-border/80 shadow-xs overflow-hidden">
          {/* Cover Banner */}
          <div className="h-36 sm:h-52 w-full bg-gradient-to-r from-primary/25 via-sky-500/15 to-indigo-500/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>

          {/* Profile Header Info */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-18 mb-5">
              <Avatar className="h-28 w-28 sm:h-36 sm:w-36 min-h-28 min-w-28 border-4 border-card shadow-xl rounded-full bg-muted">
                <AvatarImage src={profileUser?.avatar || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {getInitials(profileUser?.fullName || profileUser?.username)}
                </AvatarFallback>
              </Avatar>

              <div className="self-start sm:self-auto">
                <ProfileActionButtons
                  isOwnProfile={isOwnProfile}
                  onEditProfile={() => setProfileOpen(true)}
                  profileUserId={profileUserId}
                  profileUsername={profileUser?.username}
                  profileFullName={profileUser?.fullName}
                  profileAvatar={profileUser?.avatar}
                  isFollowing={matchedUser?.isFollowing}
                  canFollow={matchedUser?.capabilities?.canFollow}
                  canChat={matchedUser?.capabilities?.canChat}
                  isBlocking={matchedUser?.isBlocking}
                />
              </div>
            </div>

            {/* Name, Username & Bio */}
            <div className="space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {profileUser?.fullName || profileUser?.username}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">
                  @{profileUser?.username}
                </p>
              </div>

              {/* Social links */}
              {profileUser?.socials && profileUser.socials.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profileUser.socials.map((social: any) => (
                    <a
                      key={social.id}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/80 hover:border-primary/40 transition-all shadow-xs"
                      title={social.name || social.platform}
                    >
                      {PLATFORM_ICONS[social.platform] || PLATFORM_ICONS[SocialPlatform.CUSTOM]}
                      <span>{social.name || social.platform}</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Stats Grid */}
              <div className="pt-2">
                <ProfileStatsGrid stats={stats} />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Tabs */}
        <ProfileContentSection 
          userId={profileUserId} 
          isOwnProfile={isOwnProfile} 
          capabilities={matchedUser?.capabilities}
        />
      </div>

      <EditProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        me={me}
        onSuccess={(values) => {
          const nextName =
            values.username ?? me?.username ?? "user";
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

