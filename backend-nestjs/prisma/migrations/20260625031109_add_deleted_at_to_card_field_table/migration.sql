-- AlterTable
ALTER TABLE "card_field" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "card_field_deletedAt_idx" ON "card_field"("deletedAt");
