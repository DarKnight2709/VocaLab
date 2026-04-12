// import {
//   Injectable,
//   OnModuleInit,
//   OnModuleDestroy,
//   Logger,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import Redis, { RedisOptions } from 'ioredis';

// @Injectable()
// export class RedisService implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(RedisService.name);
//   private client: Redis;

//   constructor(private readonly configService: ConfigService) {}

//   async onModuleInit(): Promise<void> {
//     const options: RedisOptions = {
//       host: this.configService.get<string>('REDIS_HOST', 'localhost'),
//       port: this.configService.get<number>('REDIS_PORT', 6379),
//       password:
//         this.configService.get<string>('REDIS_PASSWORD') || undefined,
//       db: this.configService.get<number>('REDIS_DB', 0),
//       retryStrategy: (times: number) => {
//         return Math.min(times * 50, 2000);
//       },
//       maxRetriesPerRequest: 3,
//     };

//     try {
//       this.client = new Redis(options);

//       this.registerEventListeners();

//       // Test connection
//       await this.client.ping();

//       this.logger.log('Redis service initialized and connected');
//     } catch (error) {
//       this.logger.error('Failed to initialize Redis', error);
//       throw error;
//     }
//   }

//   async onModuleDestroy(): Promise<void> {
//     if (this.client) {
//       await this.client.quit();
//       this.logger.log('Redis connection closed');
//     }
//   }

//   private registerEventListeners(): void {
//     this.client.on('connect', () => {
//       this.logger.log('Redis connected successfully');
//     });

//     this.client.on('ready', () => {
//       this.logger.log('Redis client is ready');
//     });

//     this.client.on('error', (err) => {
//       this.logger.error('Redis connection error', err);
//     });
//   }

//   getClient(): Redis {
//     return this.client;
//   }

//   /* =========================
//      Basic Operations
//   ========================= */

//   async set(key: string, value: string, ttl?: number): Promise<void> {
//     if (ttl) {
//       await this.client.setex(key, ttl, value);
//     } else {
//       await this.client.set(key, value);
//     }
//   }

//   async get(key: string): Promise<string | null> {
//     return this.client.get(key);
//   }

//   async del(key: string): Promise<void> {
//     await this.client.del(key);
//   }

//   async exists(key: string): Promise<boolean> {
//     const result = await this.client.exists(key);
//     return result === 1;
//   }

//   /* =========================
//      JSON Helpers
//   ========================= */

//   async setJson(key: string, value: unknown, ttl?: number): Promise<void> {
//     await this.set(key, JSON.stringify(value), ttl);
//   }

//   async getJson<T>(key: string): Promise<T | null> {
//     const value = await this.get(key);
//     return value ? (JSON.parse(value) as T) : null;
//   }

//   /* =========================
//      Hash Operations
//   ========================= */

//   async hset(key: string, field: string, value: string): Promise<void> {
//     await this.client.hset(key, field, value);
//   }

//   async hget(key: string, field: string): Promise<string | null> {
//     return this.client.hget(key, field);
//   }

//   async hgetall(key: string): Promise<Record<string, string>> {
//     return this.client.hgetall(key);
//   }

//   /* =========================
//      Pub/Sub
//   ========================= */

//   async publish(channel: string, message: string): Promise<void> {
//     await this.client.publish(channel, message);
//   }

//   async subscribe(
//     channel: string,
//     callback: (message: string) => void,
//   ): Promise<void> {
//     const subscriber = this.client.duplicate();

//     await subscriber.subscribe(channel);

//     subscriber.on('message', (receivedChannel, message) => {
//       if (receivedChannel === channel) {
//         callback(message);
//       }
//     });
//   }
// }