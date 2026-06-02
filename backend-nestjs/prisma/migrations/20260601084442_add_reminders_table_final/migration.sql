-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('ON_THE_HOUR', 'EVERY_5_MINUTES', 'EVERY_10_MINUTES', 'EVERY_15_MINUTES', 'EVERY_30_MINUTES', 'EVERY_HOUR', 'EVERY_2_HOURS', 'EVERY_3_HOURS', 'EVERY_4_HOURS', 'EVERY_6_HOURS', 'EVERY_8_HOURS');

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerTime" INTEGER,
    "startTime" INTEGER,
    "endTime" INTEGER,
    "daysOfWeek" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reminders_userId_idx" ON "reminders"("userId");

-- CreateIndex
CREATE INDEX "reminders_isEnabled_idx" ON "reminders"("isEnabled");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
