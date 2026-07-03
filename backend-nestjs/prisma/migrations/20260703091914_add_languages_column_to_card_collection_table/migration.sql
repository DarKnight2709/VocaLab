-- AlterTable
ALTER TABLE "card_collections" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
