-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
