import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async setCache<T>(
    key: string,
    value: T,
    ttlMs: number = 3600000,
  ): Promise<void> {
    try {
      await this.cacheManager.set(key, JSON.stringify(value), ttlMs);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs: number = 3600000,
  ): Promise<T> {
    try {
      const cached = await this.getCache<T>(key);
      if (cached) {
        this.logger.log(`Cache hit: ${key}`);
        return cached;
      }

      this.logger.log(`Cache miss: ${key} - Fetching new data`);
      const freshData = await fetchFn();

      // Save to cache asynchronously (Write-Behind behavior for the cache layer)
      // We don't await this so it doesn't block the caller from getting data immediately.
      this.setCache(key, freshData, ttlMs).catch((err) => {
        this.logger.error(
          `Failed to set cache in getOrSet for key ${key}`,
          err,
        );
      });

      return freshData;
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
