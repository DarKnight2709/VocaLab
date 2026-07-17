import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async setCache<T>(key: string, value: T): Promise<void> {
    try {
      await this.cacheManager.set(key, JSON.stringify(value), 3600000); // 1 hour TTL
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cacheValue = await this.cacheManager.get(key);
      if (cacheValue != null) {
        return JSON.parse(cacheValue as string);
      }
      return null;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
