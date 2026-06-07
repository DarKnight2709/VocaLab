/*
  Warnings:

  - A unique constraint covering the columns `[schedulerId]` on the table `reminders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reminders" ADD COLUMN     "schedulerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reminders_schedulerId_key" ON "reminders"("schedulerId");
