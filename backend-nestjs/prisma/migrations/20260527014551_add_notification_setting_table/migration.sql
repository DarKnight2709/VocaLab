-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'INBOX', 'OFF');

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatMessages" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "commentsOnPosts" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "upvotes" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "repliesToComments" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "newFollowers" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "activityFromFollowed" "NotificationChannel" NOT NULL DEFAULT 'INBOX',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
