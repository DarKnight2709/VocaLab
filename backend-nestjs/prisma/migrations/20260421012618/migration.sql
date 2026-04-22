/*
  Warnings:

  - You are about to drop the `blog_likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- DropForeignKey
ALTER TABLE "blog_likes" DROP CONSTRAINT "blog_likes_blogId_fkey";

-- DropForeignKey
ALTER TABLE "blog_likes" DROP CONSTRAINT "blog_likes_userId_fkey";

-- AlterTable
ALTER TABLE "card_field" ADD COLUMN     "color" TEXT,
ADD COLUMN     "fontSize" INTEGER;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "parentCommentId" TEXT;

-- DropTable
DROP TABLE "blog_likes";

-- CreateTable
CREATE TABLE "blog_votes" (
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_votes_pkey" PRIMARY KEY ("userId","blogId")
);

-- CreateIndex
CREATE INDEX "comments_parentCommentId_idx" ON "comments"("parentCommentId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_votes" ADD CONSTRAINT "blog_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_votes" ADD CONSTRAINT "blog_votes_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
