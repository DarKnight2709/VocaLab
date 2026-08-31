-- DropIndex
DROP INDEX "blocks_blockingId_idx";

-- DropIndex
DROP INDEX "card_field_cardTypeId_idx";

-- DropIndex
DROP INDEX "card_field_cardTypeId_order_idx";

-- DropIndex
DROP INDEX "card_field_deletedAt_idx";

-- DropIndex
DROP INDEX "card_field_value_cardId_fieldId_idx";

-- DropIndex
DROP INDEX "card_field_value_cardId_idx";

-- DropIndex
DROP INDEX "card_type_userId_idx";

-- DropIndex
DROP INDEX "collection_daily_progress_collectionId_idx";

-- DropIndex
DROP INDEX "comments_blogId_idx";

-- DropIndex
DROP INDEX "daily_progress_userId_idx";

-- DropIndex
DROP INDEX "follows_followerId_idx";

-- DropIndex
DROP INDEX "group_members_groupId_idx";

-- DropIndex
DROP INDEX "group_role_permissions_groupId_idx";

-- DropIndex
DROP INDEX "learning_settings_userId_idx";

-- DropIndex
DROP INDEX "messages_createdAt_idx";

-- DropIndex
DROP INDEX "messages_groupId_idx";

-- DropIndex
DROP INDEX "messages_receiverId_idx";

-- DropIndex
DROP INDEX "messages_senderId_idx";

-- DropIndex
DROP INDEX "notifications_createdAt_idx";

-- DropIndex
DROP INDEX "notifications_recipientId_idx";

-- DropIndex
DROP INDEX "reminders_isEnabled_idx";

-- DropIndex
DROP INDEX "reminders_userId_idx";

-- CreateIndex
CREATE INDEX "blog_votes_blogId_idx" ON "blog_votes"("blogId");

-- CreateIndex
CREATE INDEX "card_cardCollectionId_nextReviewDate_idx" ON "card"("cardCollectionId", "nextReviewDate");

-- CreateIndex
CREATE INDEX "card_collections_originId_idx" ON "card_collections"("originId");

-- CreateIndex
CREATE INDEX "comment_votes_commentId_idx" ON "comment_votes"("commentId");

-- CreateIndex
CREATE INDEX "comments_blogId_createdAt_idx" ON "comments"("blogId", "createdAt");

-- CreateIndex
CREATE INDEX "grammar_structures_authorId_idx" ON "grammar_structures"("authorId");

-- CreateIndex
CREATE INDEX "messages_senderId_receiverId_createdAt_idx" ON "messages"("senderId", "receiverId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_senderId_createdAt_idx" ON "messages"("receiverId", "senderId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_groupId_idx" ON "notifications"("groupId");

-- CreateIndex
CREATE INDEX "notifications_recipientId_createdAt_idx" ON "notifications"("recipientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_familyId_idx" ON "refresh_tokens"("familyId");

-- CreateIndex
CREATE INDEX "reminders_userId_isEnabled_idx" ON "reminders"("userId", "isEnabled");

-- CreateIndex
CREATE INDEX "videos_userId_idx" ON "videos"("userId");
