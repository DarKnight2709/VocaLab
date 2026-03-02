-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'RECALLED', 'DELETED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'SENT';
