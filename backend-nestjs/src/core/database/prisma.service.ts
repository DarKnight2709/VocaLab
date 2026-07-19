import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@/common/services/config.service';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    // 1. Setup the native driver pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Wrap it in the Prisma Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the parent PrismaClient
    super({
      adapter,
      log:
        configService.nodeEnv === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error', 'warn'],
    });

    let extendedClient: any;

    extendedClient = this.$extends({
      client: {
        async onModuleInit() {
          // In Prisma 7 with adapters, $connect is often implicit,
          // but calling it ensures the pool is alive.
          await (this as any).$connect();
          console.log('✅ Prisma connected via Driver Adapter');
        },

        async onModuleDestroy() {
          await (this as any).$disconnect();
        },
      },
      query: {
        user: {
          async findMany({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },

          async findFirst({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },

          async findUnique({ args, query }) {
            return extendedClient.user.findFirst({
              ...args,
              where: {
                ...args.where,
                deletedAt: null,
              },
            });
          },

          async delete({ args }) {
            return extendedClient.user.update({
              where: args.where,
              data: {
                deletedAt: new Date(),
              },
            });
          },

          async deleteMany({ args }) {
            return extendedClient.user.updateMany({
              where: args.where,
              data: {
                deletedAt: new Date(),
              },
            });
          },

          async count({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },
          async aggregate({ args, query }) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
            return query(args);
          },
          async groupBy({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async update({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async updateMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
        },
      },
    });
    (extendedClient as any).$parent = this;
    return extendedClient;
  }
}
