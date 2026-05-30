/*
  Warnings:

  - You are about to drop the column `commentsOnPosts` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `repliesToComments` on the `notification_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "commentsOnPosts",
DROP COLUMN "repliesToComments",
ADD COLUMN     "comments" "NotificationChannel" NOT NULL DEFAULT 'INBOX';
