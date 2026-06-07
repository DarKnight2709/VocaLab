/*
  Warnings:

  - Made the column `schedulerId` on table `reminders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "reminders" ALTER COLUMN "schedulerId" SET NOT NULL;
