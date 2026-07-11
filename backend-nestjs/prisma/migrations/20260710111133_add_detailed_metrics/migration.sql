-- AlterTable
ALTER TABLE "daily_progress" ADD COLUMN     "cardsAdded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsDeleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsUpdated" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "collection_daily_progress" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "cardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "cardsAdded" INTEGER NOT NULL DEFAULT 0,
    "cardsUpdated" INTEGER NOT NULL DEFAULT 0,
    "cardsDeleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_daily_progress_collectionId_idx" ON "collection_daily_progress"("collectionId");

-- CreateIndex
CREATE INDEX "collection_daily_progress_userId_idx" ON "collection_daily_progress"("userId");

-- CreateIndex
CREATE INDEX "collection_daily_progress_date_idx" ON "collection_daily_progress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "collection_daily_progress_collectionId_date_key" ON "collection_daily_progress"("collectionId", "date");

-- AddForeignKey
ALTER TABLE "collection_daily_progress" ADD CONSTRAINT "collection_daily_progress_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "card_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_daily_progress" ADD CONSTRAINT "collection_daily_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
