-- CreateIndex
CREATE INDEX "group_role_permissions_groupId_idx" ON "group_role_permissions"("groupId");

-- CreateIndex
CREATE INDEX "group_role_permissions_permissionId_idx" ON "group_role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "messages_groupId_createdAt_idx" ON "messages"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_createdAt_idx" ON "messages"("receiverId", "createdAt");
