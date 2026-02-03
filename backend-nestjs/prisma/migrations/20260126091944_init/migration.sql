/*
  Warnings:

  - You are about to drop the column `replyTo` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `_SeenBy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SeenBy" DROP CONSTRAINT "_SeenBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_SeenBy" DROP CONSTRAINT "_SeenBy_B_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_replyTo_fkey";

-- DropIndex
DROP INDEX "messages_replyTo_idx";

-- DropIndex
DROP INDEX "messages_senderId_receiverId_idx";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "replyTo",
ADD COLUMN     "replyToId" TEXT;

-- DropTable
DROP TABLE "_SeenBy";

-- CreateTable
CREATE TABLE "message_seen" (
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_seen_pkey" PRIMARY KEY ("userId","messageId")
);

-- CreateIndex
CREATE INDEX "message_seen_messageId_idx" ON "message_seen"("messageId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_replyToId_idx" ON "messages"("replyToId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_seen" ADD CONSTRAINT "message_seen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_seen" ADD CONSTRAINT "message_seen_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
