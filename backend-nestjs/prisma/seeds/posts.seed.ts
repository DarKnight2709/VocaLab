import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTestPosts() {
  const postsToCreate: any[] = [];
  const myId: string = "27231eb9-824d-471e-a0e0-551d5fe7b928";

  for (let i = 1; i <= 20; i++) {
    postsToCreate.push({
      title: `test_post_${i}`,
      content: `test_post_${i}`,
      authorId: myId
      // You can add more default fields here if needed
    });
  }

  console.log(`Creating 20 test posts...`);

  // We use a loop with upsert to avoid failing if a user already exists
  for (const post of postsToCreate) {
    await prisma.blog.create({
      data: post
    });
  }

  console.log('✅ 20 test posts seeded successfully');
}

async function main() {
  await seedTestPosts();
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
