/*
  Warnings:

  - The `attachments` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `hashedPassword` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'DIRECT',
DROP COLUMN "attachments",
ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "users"
RENAME COLUMN "password" TO "hashedPassword";

-- CreateIndex
CREATE INDEX "message_seen_userId_seenAt_idx" ON "message_seen"("userId", "seenAt");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");
