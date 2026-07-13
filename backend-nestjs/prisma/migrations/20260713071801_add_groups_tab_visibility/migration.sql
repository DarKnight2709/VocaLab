-- AlterTable
ALTER TABLE "user_privacy_settings" ADD COLUMN     "groupsTabVisibility" "VisibilityScope" NOT NULL DEFAULT 'EVERYONE';
