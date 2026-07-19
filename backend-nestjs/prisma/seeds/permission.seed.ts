import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const enum GroupPermission {
  UPDATE_GROUP_INFO = 'UPDATE_GROUP_INFO',
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  UPDATE_ROLE_PERMISSION = "UPDATE_ROLE_PERMISSION",
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissions = [
  {
    name: GroupPermission.ADD_MEMBER,
    description: 'Thêm thành viên vào nhóm',
  },
  {
    name: GroupPermission.REMOVE_MEMBER,
    description: 'Xóa thành viên khỏi nhóm',
  },
  {
    name: GroupPermission.UPDATE_ROLE_PERMISSION,
    description: 'Quản lý chức vụ và phân quyền nhóm',
  },
  {
    name: GroupPermission.UPDATE_GROUP_INFO,
    description: 'Cập nhật thông tin nhóm (Tên, Ảnh, Mô tả)',
  },
];

async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name }, // name phải @unique
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log('✅ Permissions seeded');
}

async function main() {
  await seedPermissions();
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
