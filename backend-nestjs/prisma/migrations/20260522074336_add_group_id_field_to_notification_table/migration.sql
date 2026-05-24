-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "groupId" TEXT,
ALTER COLUMN "recipientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
