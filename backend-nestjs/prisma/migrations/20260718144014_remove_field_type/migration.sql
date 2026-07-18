/*
  Warnings:

  - You are about to drop the column `fieldType` on the `card_field` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "card_field" DROP COLUMN "fieldType";

-- DropEnum
DROP TYPE "CardFieldType";
