-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'LINKEDIN', 'CUSTOM');

-- CreateTable
CREATE TABLE "user_socials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "name" TEXT,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_socials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_socials_userId_idx" ON "user_socials"("userId");

-- AddForeignKey
ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
