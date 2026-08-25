import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@/core/redis/redis.provider';

export interface CacheEnvelope<T> {
  version: number;
  data: T;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  // Atomic Lua script: only overwrites if incoming version >= current version in Redis
  private readonly conditionalSetLua = `
    local current = redis.call('GET', KEYS[1])
    if current then
      local ok, parsed = pcall(cjson.decode, current)
      if ok and parsed and parsed.version and tonumber(ARGV[2]) < tonumber(parsed.version) then
        return 0
      end
    end
    redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[3])
    return 1
  `;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  /**
   * Version-Guarded SET: Rejects writes if a newer version is already in Redis.
   */
  async setVersionedCache<T>(
    key: string,
    value: T,
    version: number = Date.now(),
    ttlMs: number = 3600000,
  ): Promise<boolean> {
    try {
      const payload: CacheEnvelope<T> = { version, data: value };
      const serialized = JSON.stringify(payload);

      const result = await this.redisClient.eval(
        this.conditionalSetLua,
        1,
        key,
        serialized,
        version,
        ttlMs,
      );

      const accepted = result === 1;
      if (!accepted) {
        this.logger.warn(
          `[Version Guard] Dropped stale write for key: ${key} (version: ${version})`,
        );
      }
      return accepted;
    } catch (error) {
      this.logger.error(`Failed setVersionedCache for ${key}`, error);
      return false;
    }
  }

  /**
   * Backwards-compatible setCache method.
   */
  async setCache<T>(
    key: string,
    value: T,
    ttlMs: number = 3600000,
  ): Promise<void> {
    await this.setVersionedCache(key, value, Date.now(), ttlMs);
  }

  /**
   * Write-Path Repopulation with Version Guard.
   * Forces the fresh data into Redis, establishing a new high-watermark version.
   */
  async writePathRepopulate<T>(
    key: string,
    freshData: T,
    version: number = Date.now(),
    ttlMs: number = 300000, // 5 min default backstop TTL
  ): Promise<void> {
    await this.setVersionedCache(key, freshData, version, ttlMs);
    this.logger.log(
      `[Write-Path Repopulation] Updated key: ${key} to version: ${version}`,
    );
  }

  /**
   * Get cache value (transparently unwraps version envelopes).
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisClient.get(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        'version' in parsed &&
        'data' in parsed
      ) {
        return parsed.data as T;
      }
      return parsed as T;
    } catch (error) {
      this.logger.error(`Failed to get cache for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Read-Through caching with Version Guarding.
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<{ data: T; version?: number } | T>,
    ttlMs: number = 3600000,
  ): Promise<T> {
    const cached = await this.getCache<T>(key);
    if (cached) {
      this.logger.log(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.log(`Cache miss: ${key} - Fetching fresh data`);
    const startTime = Date.now();
    const result = await fetchFn();

    let data: T;
    let version = startTime;

    if (result && typeof result === 'object' && 'data' in result) {
      data = (result as any).data;
      version = (result as any).version ?? startTime;
    } else {
      data = result as T;
    }

    // Save in background with the read timestamp as version
    this.setVersionedCache(key, data, version, ttlMs).catch((err) => {
      this.logger.error(`Failed async cache set in getOrSet for: ${key}`, err);
    });

    return data;
  }

  /**
   * Delete a single key from cache immediately.
   */
  async deleteCache(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      this.logger.log(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delayed Double Invalidation (Delete-on-Write with secondary wipe).
   */
  async delayedDoubleDelete(key: string, delayMs: number = 500): Promise<void> {
    try {
      await this.deleteCache(key);

      setTimeout(async () => {
        try {
          await this.deleteCache(key);
          this.logger.log(
            `[Delayed Invalidation] Secondary wipe executed for: ${key}`,
          );
        } catch (err) {
          this.logger.error(
            `[Delayed Invalidation] Secondary wipe failed for: ${key}`,
            err,
          );
        }
      }, delayMs);
    } catch (error) {
      this.logger.error(`DelayedDoubleDelete failed for key: ${key}`, error);
    }
  }
}
