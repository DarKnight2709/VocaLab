/*
  Warnings:

  - You are about to drop the column `replyToId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentsLength` on the `notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_replyToId_fkey";

-- DropIndex
DROP INDEX "messages_replyToId_idx";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "replyToId",
ADD COLUMN     "replyTo" TEXT;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "attachmentsLength",
ADD COLUMN     "attachmentsCount" INTEGER;

-- CreateIndex
CREATE INDEX "messages_replyTo_idx" ON "messages"("replyTo");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
