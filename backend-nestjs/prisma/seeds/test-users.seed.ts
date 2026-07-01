import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTestUsers() {
  const usersToCreate: Prisma.UserCreateInput[] = [];
  const saltRounds = 10;

  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  for (let i = 1; i <= 20; i++) {
    usersToCreate.push({
      username: `test_user_${i}`,
      email: `test_user_${i}@example.com`,
      fullName: `Test User ${i}`,
      hashedPassword,
      // You can add more default fields here if needed
    });
  }

  console.log(`Creating 20 test users...`);

  // We use a loop with upsert to avoid failing if a user already exists
  for (const user of usersToCreate) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    });
  }

  console.log('✅ 20 test users seeded successfully');
}

async function main() {
  await seedTestUsers();
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
