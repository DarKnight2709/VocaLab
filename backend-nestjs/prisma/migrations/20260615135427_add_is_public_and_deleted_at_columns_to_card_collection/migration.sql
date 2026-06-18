-- AlterTable
ALTER TABLE "card_collections" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;
