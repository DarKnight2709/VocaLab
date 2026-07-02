-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "popularityScore" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "blogs_popularityScore_idx" ON "blogs"("popularityScore");
