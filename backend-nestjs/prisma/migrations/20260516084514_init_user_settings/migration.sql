-- CreateEnum
CREATE TYPE "VisibilityScope" AS ENUM ('EVERYONE', 'FRIENDS', 'PRIVATE');

-- CreateTable
CREATE TABLE "user_privacy_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowFollow" BOOLEAN NOT NULL DEFAULT true,
    "messageScope" "VisibilityScope" NOT NULL DEFAULT 'EVERYONE',
    "followersTabVisibility" "VisibilityScope" NOT NULL DEFAULT 'EVERYONE',
    "followingTabVisibility" "VisibilityScope" NOT NULL DEFAULT 'EVERYONE',
    "friendTabVisibility" "VisibilityScope" NOT NULL DEFAULT 'EVERYONE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_privacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_privacy_settings_userId_key" ON "user_privacy_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "user_privacy_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
