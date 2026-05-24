/*
  Warnings:

  - You are about to drop the column `title` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "title",
ADD COLUMN     "attachmentsLength" INTEGER,
ALTER COLUMN "content" DROP NOT NULL;
