-- CreateEnum
CREATE TYPE "CardFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'IMAGE');

-- CreateEnum
CREATE TYPE "CardSide" AS ENUM ('FRONT', 'BACK');

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_likes" (
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_likes_pkey" PRIMARY KEY ("userId","blogId")
);

-- CreateTable
CREATE TABLE "grammar_structures" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" JSONB,
    "category" TEXT,
    "level" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_field" (
    "id" TEXT NOT NULL,
    "cardTypeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "CardFieldType" NOT NULL,
    "side" "CardSide" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card" (
    "id" TEXT NOT NULL,
    "cardTypeId" TEXT NOT NULL,
    "cardCollectionId" TEXT NOT NULL,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_field_value" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "card_field_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blogs_authorId_idx" ON "blogs"("authorId");

-- CreateIndex
CREATE INDEX "blogs_isPublic_createdAt_idx" ON "blogs"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "comments_blogId_idx" ON "comments"("blogId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "grammar_structures_category_idx" ON "grammar_structures"("category");

-- CreateIndex
CREATE INDEX "grammar_structures_level_idx" ON "grammar_structures"("level");

-- CreateIndex
CREATE INDEX "card_collections_userId_idx" ON "card_collections"("userId");

-- CreateIndex
CREATE INDEX "card_type_userId_idx" ON "card_type"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "card_type_userId_name_key" ON "card_type"("userId", "name");

-- CreateIndex
CREATE INDEX "card_field_cardTypeId_idx" ON "card_field"("cardTypeId");

-- CreateIndex
CREATE INDEX "card_field_cardTypeId_order_idx" ON "card_field"("cardTypeId", "order");

-- CreateIndex
CREATE INDEX "card_field_cardTypeId_side_order_idx" ON "card_field"("cardTypeId", "side", "order");

-- CreateIndex
CREATE UNIQUE INDEX "card_field_cardTypeId_key_key" ON "card_field"("cardTypeId", "key");

-- CreateIndex
CREATE INDEX "card_cardTypeId_idx" ON "card"("cardTypeId");

-- CreateIndex
CREATE INDEX "card_cardCollectionId_createdAt_idx" ON "card"("cardCollectionId", "createdAt");

-- CreateIndex
CREATE INDEX "card_cardCollectionId_position_idx" ON "card"("cardCollectionId", "position");

-- CreateIndex
CREATE INDEX "card_field_value_cardId_idx" ON "card_field_value"("cardId");

-- CreateIndex
CREATE INDEX "card_field_value_fieldId_idx" ON "card_field_value"("fieldId");

-- CreateIndex
CREATE INDEX "card_field_value_cardId_fieldId_idx" ON "card_field_value"("cardId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "card_field_value_cardId_fieldId_key" ON "card_field_value"("cardId", "fieldId");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_structures" ADD CONSTRAINT "grammar_structures_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_collections" ADD CONSTRAINT "card_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_type" ADD CONSTRAINT "card_type_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_field" ADD CONSTRAINT "card_field_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_cardCollectionId_fkey" FOREIGN KEY ("cardCollectionId") REFERENCES "card_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_field_value" ADD CONSTRAINT "card_field_value_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_field_value" ADD CONSTRAINT "card_field_value_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "card_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
