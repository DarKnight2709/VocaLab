import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IRequest } from '../types';
import { REDIS_CLIENT } from '@/core/redis/redis.provider';
import Redis from 'ioredis';
import { rateLimitConfig } from '@/core/configs/rate-limit.config';

@Injectable()
export class CustomRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(CustomRateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) 
    private readonly redisClient: Redis,
  ) {}

  // 1. get the bucket from the determineKey (name of bucket)
  // 2. if the don't exist
  // set a bucket with the maximum number of tokens and ttl = capacity / refillRate
  // set the number of tokens -= 1
  // set the last checked time to current time
  // allow request
  // 3. every request arrive
  // calculate: tokens = min(capacity, currentTokens + refillRate * timeElapsed)
  // timeElapsed = currentTime - lastCheckedTime
  // if (tokens - 1 >= 0) {
  //   tokens -= 1
  //   lastCheckedTime = currentTime
  //   allow request
  // } else {
  //   deny request
  // }

  private readonly luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      -- Fetch current tokens and last checked time from Redis Hash
      local bucket = redis.call("HMGET", key, "tokens", "last_update")
      local tokens = tonumber(bucket[1])
      local last_update = tonumber(bucket[2])
      -- 2. If bucket doesn't exist, create it
      if not tokens then
        tokens = capacity
        last_update = now
      else
        -- 3. Every request arrives: calculate refilled tokens
        local timeElapsed = math.max(0, now - last_update)
        local refilled = timeElapsed * refillRate
        tokens = math.min(capacity, tokens + refilled)
      end
      -- If we have enough tokens, allow the request
      if tokens >= 1 then
        tokens = tokens - 1
        
        -- Calculate how long until the bucket is completely full again
        local ttl = math.ceil(capacity / refillRate)
        
        -- Save the updated state and set the TTL
        redis.call("HMSET", key, "tokens", tokens, "last_update", now)
        redis.call("EXPIRE", key, ttl)
        
        -- Return 1 (true) for allowed, and remaining tokens
        return { 1, tokens }
      else
        -- Deny request. Don't update the last_update time so they don't lose their place.
        return { 0, tokens }
      end
    `;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<IRequest>();

    const endpoint = request.path;
    const ip = request.ip;
    const user = request.user;

    let determineKey = '';

    if (user?.id) {
      // If we know who they are (public or private route), track by ID
      determineKey = `rate_limit:${endpoint}:user:${user.id}`;
    } else {
      // If they are anonymous, track by IP
      determineKey = `rate_limit:${endpoint}:ip:${ip}`;
    }

    const { capacity, refillRate } =
      rateLimitConfig.rules.find((rule) => rule.pattern.test(endpoint)) ||
      rateLimitConfig.default;
    const now = Math.floor(Date.now() / 1000);
    let result: [number, number];

    try {
      result = (await this.redisClient.eval(
        this.luaScript,
        1,
        determineKey,
        capacity,
        refillRate,
        now,
      )) as [number, number];
    } catch (error) {
      // If Redis is down, log it but let the request through (Fail Open)
      this.logger.error('Redis Rate Limiter failed, allowing request', error);
      return true;
    }

    const allowed = result[0] === 1;
    const remainingTokens = result[1];
    // Set standard rate limit headers on the response object
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', capacity);
    response.header('X-RateLimit-Remaining', remainingTokens);
    if (!allowed) {
      // Throw a 429 Too Many Requests if the script returned 0
      throw new HttpException('Too Many Requests', 429);
    }
    return true;
  }
}
