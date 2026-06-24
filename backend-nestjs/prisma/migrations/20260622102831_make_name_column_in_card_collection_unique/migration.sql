/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `card_collections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "card_collections_name_key" ON "card_collections"("name");
