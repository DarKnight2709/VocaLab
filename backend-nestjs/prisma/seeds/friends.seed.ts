import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedFriends() {
  const myUserId = '27231eb9-824d-471e-a0e0-551d5fe7b928';

  // 1. Check if my user exists
  const me = await prisma.user.findUnique({
    where: { id: myUserId },
  });

  if (!me) {
    console.error(`❌ User with ID ${myUserId} not found!`);
    return;
  }

  // 2. Fetch all test users
  const testUsers = await prisma.user.findMany({
    where: {
      username: {
        startsWith: 'test_user_',
      },
    },
  });

  if (testUsers.length === 0) {
    console.log('No test users found to make friends with.');
    return;
  }

  console.log(`Found ${testUsers.length} test users. Making friends...`);

  // 3. Create mutual follows (friends)
  for (const testUser of testUsers) {
    // I follow them
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: myUserId,
          followingId: testUser.id,
        },
      },
      update: {},
      create: {
        followerId: myUserId,
        followingId: testUser.id,
      },
    });

    // They follow me
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: testUser.id,
          followingId: myUserId,
        },
      },
      update: {},
      create: {
        followerId: testUser.id,
        followingId: myUserId,
      },
    });
  }

  console.log(`✅ Successfully made friends with ${testUsers.length} test users!`);
}

async function main() {
  await seedFriends();
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
