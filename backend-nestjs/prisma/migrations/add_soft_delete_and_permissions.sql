-- Migration: Add Soft Delete and Permission System
-- Version: 2.0.0
-- Date: 2026-02-03

-- ============================================
-- PHASE 1: Add Soft Delete Fields to Existing Tables
-- ============================================

-- 1. Add soft delete fields to Group table
ALTER TABLE "groups" 
  ADD COLUMN "deletedAt" TIMESTAMP,
  ADD COLUMN "deletedBy" TEXT;

-- Add index for soft delete queries
CREATE INDEX "groups_deletedAt_idx" ON "groups"("deletedAt");
CREATE INDEX "groups_isActive_idx" ON "groups"("isActive");

-- Add foreign key for deletedBy
ALTER TABLE "groups"
  ADD CONSTRAINT "groups_deletedBy_fkey" 
  FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL;

-- 2. Add soft delete and audit fields to GroupMember table
ALTER TABLE "group_members"
  ADD COLUMN "leftAt" TIMESTAMP,
  ADD COLUMN "isActive" BOOLEAN DEFAULT true,
  ADD COLUMN "addedBy" TEXT,
  ADD COLUMN "removedBy" TEXT;

-- Add indexes
CREATE INDEX "group_members_isActive_idx" ON "group_members"("isActive");

-- Add foreign keys
ALTER TABLE "group_members"
  ADD CONSTRAINT "group_members_addedBy_fkey" 
  FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "group_members"
  ADD CONSTRAINT "group_members_removedBy_fkey" 
  FOREIGN KEY ("removedBy") REFERENCES "users"("id") ON DELETE SET NULL;

-- 3. Add soft delete fields to Message table
ALTER TABLE "messages"
  ADD COLUMN "deletedAt" TIMESTAMP,
  ADD COLUMN "deletedBy" TEXT;

-- Add index
CREATE INDEX "messages_deletedAt_idx" ON "messages"("deletedAt");

-- Add foreign key
ALTER TABLE "messages"
  ADD CONSTRAINT "messages_deletedBy_fkey" 
  FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL;

-- ============================================
-- PHASE 2: Create Permission System Tables
-- ============================================

-- 1. Create GroupPermission table
CREATE TABLE "group_permissions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "permission" TEXT NOT NULL,
  "grantedBy" TEXT NOT NULL,
  "grantedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "group_permissions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE,
  CONSTRAINT "group_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "group_permissions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Add unique constraint to prevent duplicate permissions
CREATE UNIQUE INDEX "group_permissions_groupId_userId_permission_key" 
  ON "group_permissions"("groupId", "userId", "permission");

-- Add indexes for queries
CREATE INDEX "group_permissions_groupId_userId_idx" 
  ON "group_permissions"("groupId", "userId");

-- ============================================
-- PHASE 3: Update MemberRole Enum (if using PostgreSQL enum)
-- ============================================

-- Note: If you're using Prisma enum, this is handled in schema.prisma
-- For PostgreSQL native enum, you would do:
-- ALTER TYPE "MemberRole" ADD VALUE 'owner';

-- ============================================
-- PHASE 4: Data Migration
-- ============================================

-- 1. Set all existing group members as active
UPDATE "group_members" SET "isActive" = true WHERE "isActive" IS NULL;

-- 2. Set group owner as member with admin role (if not already a member)
-- This ensures the owner is also in the members table
INSERT INTO "group_members" ("id", "groupId", "userId", "role", "joinedAt", "isActive")
SELECT 
  gen_random_uuid()::text,
  g."id",
  g."ownerId",
  'admin'::\"MemberRole\",
  g."createdAt",
  true
FROM "groups" g
WHERE NOT EXISTS (
  SELECT 1 FROM "group_members" gm 
  WHERE gm."groupId" = g."id" AND gm."userId" = g."ownerId"
)
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE 5: Add Constraints
-- ============================================

-- Ensure isActive is not null
ALTER TABLE "group_members" 
  ALTER COLUMN "isActive" SET DEFAULT true,
  ALTER COLUMN "isActive" SET NOT NULL;

-- ============================================
-- ROLLBACK SCRIPT (Keep for safety)
-- ============================================

/*
-- To rollback this migration:

-- Drop permission table
DROP TABLE IF EXISTS "group_permissions";

-- Remove soft delete fields from messages
ALTER TABLE "messages" 
  DROP COLUMN IF EXISTS "deletedAt",
  DROP COLUMN IF EXISTS "deletedBy";

-- Remove soft delete fields from group_members
ALTER TABLE "group_members"
  DROP COLUMN IF EXISTS "leftAt",
  DROP COLUMN IF EXISTS "isActive",
  DROP COLUMN IF EXISTS "addedBy",
  DROP COLUMN IF EXISTS "removedBy";

-- Remove soft delete fields from groups
ALTER TABLE "groups"
  DROP COLUMN IF EXISTS "deletedAt",
  DROP COLUMN IF EXISTS "deletedBy";

-- Drop indexes
DROP INDEX IF EXISTS "groups_deletedAt_idx";
DROP INDEX IF EXISTS "groups_isActive_idx";
DROP INDEX IF EXISTS "group_members_isActive_idx";
DROP INDEX IF EXISTS "messages_deletedAt_idx";
DROP INDEX IF EXISTS "group_permissions_groupId_userId_permission_key";
DROP INDEX IF EXISTS "group_permissions_groupId_userId_idx";
*/
