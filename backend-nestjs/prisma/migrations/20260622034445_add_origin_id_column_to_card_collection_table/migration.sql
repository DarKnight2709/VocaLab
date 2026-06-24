-- AlterTable
ALTER TABLE "card_collections" ADD COLUMN     "originId" TEXT;

-- AddForeignKey
ALTER TABLE "card_collections" ADD CONSTRAINT "card_collections_originId_fkey" FOREIGN KEY ("originId") REFERENCES "card_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
