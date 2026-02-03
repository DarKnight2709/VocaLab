import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Setup the native driver pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Wrap it in the Prisma Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the parent PrismaClient
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    // In Prisma 7 with adapters, $connect is often implicit, 
    // but calling it ensures the pool is alive.
    await this.$connect();
    console.log('✅ Prisma connected via Driver Adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}