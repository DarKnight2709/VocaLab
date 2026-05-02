-- DropForeignKey
ALTER TABLE "grammar_structures" DROP CONSTRAINT "grammar_structures_authorId_fkey";

-- AddForeignKey
ALTER TABLE "grammar_structures" ADD CONSTRAINT "grammar_structures_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
