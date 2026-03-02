# 🚀 Redis for Beginners - Complete Guide

## What is Redis?

Think of Redis as a **super-fast notepad** that your application can use to:
- 📝 Remember things temporarily (like user sessions)
- 🚀 Speed up your app (cache database queries)
- 💬 Handle real-time features (chat messages, notifications)

**Why is it fast?** Redis stores everything in RAM (memory), not on disk like regular databases.

---

## 🎯 Your Current Setup (Already Working!)

### 1. **Docker Compose** (Runs Redis automatically)

```yaml
# backend-nestjs/docker-compose.yml
redis:
  image: redis:7-alpine        # Lightweight Redis version
  container_name: chat-redis
  ports:
    - "6379:6379"              # Port to connect to Redis
  volumes:
    - redis-data:/data         # Saves data even if container restarts
```

**What this means:**
- ✅ Redis runs in a Docker container (isolated environment)
- ✅ Port 6379 is the default Redis port
- ✅ Data persists between restarts

---

### 2. **Environment Variables** (Configuration)

Create a `.env` file in `backend-nestjs/`:

```env
# Redis Configuration
REDIS_HOST=localhost          # Where Redis is running
REDIS_PORT=6379              # Redis port
REDIS_PASSWORD=              # Leave empty for local development
REDIS_DB=0                   # Database number (0-15)
```

**For production:**
```env
REDIS_HOST=your-redis-server.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_DB=0
```

---

### 3. **Redis Service** (How to Use Redis in Your Code)

Your `RedisService` is already set up! Here's how it works:

```typescript
// backend-nestjs/src/core/cache/redis.service.ts

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  // 1️⃣ Connects to Redis when app starts
  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      // ... more config
    });
  }

  // 2️⃣ Save data to Redis
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // ttl = Time To Live (how long to keep the data)
  }

  // 3️⃣ Get data from Redis
  async get<T>(key: string): Promise<T | null> {
    // Returns the data or null if not found
  }

  // 4️⃣ Delete data from Redis
  async del(key: string): Promise<void> {
    // Removes the data
  }
}
```

---

## 🔨 Practical Examples (Step-by-Step)

### Example 1: Cache User Profile (Speed Up Your App)

**Problem:** Every time someone views a profile, you query the database (slow!)  
**Solution:** Save the profile in Redis for 5 minutes

```typescript
// user.service.ts

constructor(private redisService: RedisService) {}

async getUserProfile(userId: string) {
  // 1️⃣ Try to get from Redis first (FAST)
  const cacheKey = `user:profile:${userId}`;
  const cached = await this.redisService.get(cacheKey);
  
  if (cached) {
    console.log('✅ Found in cache! Super fast!');
    return cached;
  }

  // 2️⃣ Not in cache? Get from database (SLOW)
  console.log('⏳ Not in cache, querying database...');
  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  // 3️⃣ Save to Redis for next time (5 minutes = 300 seconds)
  await this.redisService.set(cacheKey, user, 300);
  
  return user;
}
```

**Result:**
- First request: Takes 100ms (database query)
- Next requests: Takes 5ms (from Redis)
- **20x faster!** 🚀

---

### Example 2: Store User Sessions (Remember Logged-In Users)

```typescript
// auth.service.ts

async createSession(userId: string, token: string) {
  const sessionKey = `session:${token}`;
  const sessionData = {
    userId,
    createdAt: new Date(),
    expiresIn: '24h'
  };

  // Save session for 24 hours (86400 seconds)
  await this.redisService.set(sessionKey, sessionData, 86400);
}

async getSession(token: string) {
  const sessionKey = `session:${token}`;
  return await this.redisService.get(sessionKey);
}

async logout(token: string) {
  const sessionKey = `session:${token}`;
  await this.redisService.del(sessionKey);
}
```

---

### Example 3: Rate Limiting (Prevent Spam)

**Problem:** Users sending 1000 messages per second  
**Solution:** Limit to 10 messages per minute

```typescript
// messages.service.ts

async canSendMessage(userId: string): Promise<boolean> {
  const rateLimitKey = `rate:messages:${userId}`;
  
  // Get current count
  const count = await this.redisService.get<number>(rateLimitKey) || 0;
  
  if (count >= 10) {
    return false; // Too many messages!
  }
  
  // Increment count (expires in 60 seconds)
  await this.redisService.set(rateLimitKey, count + 1, 60);
  return true;
}

// Usage in your controller:
async sendMessage(userId: string, message: string) {
  if (!await this.canSendMessage(userId)) {
    throw new Error('Too many messages! Wait 1 minute.');
  }
  
  // Send the message...
}
```

---

### Example 4: Real-time Online Users (Chat App)

```typescript
// group-chat.gateway.ts

async markUserOnline(userId: string) {
  const onlineKey = `online:users`;
  const userData = { userId, lastSeen: Date.now() };
  
  // Add to a Redis Set (stores unique values)
  await this.redisService.client.hset(
    onlineKey,
    userId,
    JSON.stringify(userData)
  );
}

async getOnlineUsers(): Promise<string[]> {
  const onlineKey = `online:users`;
  const users = await this.redisService.client.hgetall(onlineKey);
  
  // Return users active in last 5 minutes
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return Object.entries(users)
    .filter(([_, data]) => {
      const { lastSeen } = JSON.parse(data);
      return lastSeen > fiveMinutesAgo;
    })
    .map(([userId]) => userId);
}
```

---

## 🎮 How to Start Using Redis

### Step 1: Start Redis
```bash
cd backend-nestjs
docker-compose up -d redis
```

### Step 2: Check Redis is Running
```bash
docker ps | grep redis
# Should show: chat-redis ... Up ... 6379->6379
```

### Step 3: Test Redis (Optional)
```bash
# Connect to Redis CLI
docker exec -it chat-redis redis-cli

# Try some commands:
SET mykey "Hello Redis"
GET mykey
# Returns: "Hello Redis"

DEL mykey
GET mykey
# Returns: (nil)

# Exit
exit
```

### Step 4: Use in Your Code
Just inject `RedisService` anywhere:

```typescript
@Injectable()
export class MyService {
  constructor(private redisService: RedisService) {}

  async myFunction() {
    // Save data
    await this.redisService.set('my-key', { name: 'John' }, 60);
    
    // Get data
    const data = await this.redisService.get('my-key');
    console.log(data); // { name: 'John' }
  }
}
```

---

## 🔑 Redis Data Types (Simple Explanation)

### 1. **String** (Simple key-value)
```typescript
await redis.set('username', 'john123');
await redis.get('username'); // 'john123'
```

### 2. **Hash** (Object/Dictionary)
```typescript
// Like a JavaScript object
await redis.client.hset('user:1', 'name', 'John');
await redis.client.hset('user:1', 'age', '25');
await redis.client.hgetall('user:1'); // { name: 'John', age: '25' }
```

### 3. **List** (Array)
```typescript
// Push items to a list
await redis.client.lpush('messages', 'Hello');
await redis.client.lpush('messages', 'World');
await redis.client.lrange('messages', 0, -1); // ['World', 'Hello']
```

### 4. **Set** (Unique values)
```typescript
// Like JavaScript Set
await redis.client.sadd('online-users', 'user1');
await redis.client.sadd('online-users', 'user2');
await redis.client.sadd('online-users', 'user1'); // Ignored (already exists)
await redis.client.smembers('online-users'); // ['user1', 'user2']
```

### 5. **Sorted Set** (Leaderboard)
```typescript
// Items with scores
await redis.client.zadd('leaderboard', 100, 'player1');
await redis.client.zadd('leaderboard', 200, 'player2');
await redis.client.zrange('leaderboard', 0, -1, 'WITHSCORES');
// ['player1', '100', 'player2', '200']
```

---

## 🛠️ Useful Redis Commands

### Development/Debugging
```bash
# See all keys
docker exec -it chat-redis redis-cli KEYS "*"

# Get a specific key
docker exec -it chat-redis redis-cli GET "user:profile:123"

# Delete a key
docker exec -it chat-redis redis-cli DEL "user:profile:123"

# Delete ALL keys (⚠️ BE CAREFUL!)
docker exec -it chat-redis redis-cli FLUSHALL

# Check Redis info
docker exec -it chat-redis redis-cli INFO stats
```

---

## 🎯 Common Use Cases

| Use Case | TTL (Time to Live) | Example |
|----------|-------------------|---------|
| User sessions | 24 hours | `86400` seconds |
| API cache | 5 minutes | `300` seconds |
| Rate limiting | 1 minute | `60` seconds |
| OTP codes | 5 minutes | `300` seconds |
| Temporary data | 1 hour | `3600` seconds |
| Permanent data | No TTL | Don't set TTL |

---

## 🚨 Common Mistakes (Avoid These!)

### ❌ Mistake 1: Forgetting to Set TTL
```typescript
// BAD: Data stays forever (memory fills up!)
await redis.set('temp-data', someData);

// GOOD: Data expires after 5 minutes
await redis.set('temp-data', someData, 300);
```

### ❌ Mistake 2: Storing Large Objects
```typescript
// BAD: Storing 10MB file in Redis
await redis.set('large-file', hugeFileBuffer);

// GOOD: Store file on disk, keep reference in Redis
await redis.set('file-path', '/uploads/file-123.pdf');
```

### ❌ Mistake 3: Not Handling Errors
```typescript
// BAD: App crashes if Redis is down
const data = await redis.get('key');

// GOOD: Graceful fallback
try {
  const data = await redis.get('key');
  if (data) return data;
} catch (error) {
  console.log('Redis error, using database instead');
}
// Query database as fallback
```

---

## 📊 Monitor Redis (See What's Happening)

### Option 1: Redis CLI Monitor
```bash
docker exec -it chat-redis redis-cli MONITOR
# Shows all commands in real-time
```

### Option 2: Redis Commander (GUI Tool)
Add to `docker-compose.yml`:
```yaml
redis-commander:
  image: rediscommander/redis-commander
  environment:
    - REDIS_HOSTS=local:redis:6379
  ports:
    - "8081:8081"
  depends_on:
    - redis
```

Then visit: http://localhost:8081

---

## 🎓 Learning Path

1. ✅ **Week 1:** Use basic set/get for caching
2. ✅ **Week 2:** Implement session management
3. ✅ **Week 3:** Add rate limiting
4. ✅ **Week 4:** Use Hashes and Lists for complex data
5. ✅ **Week 5:** Explore Pub/Sub for real-time features

---

## 🔗 Quick Reference

```typescript
// Your RedisService methods:

// Save data (expires after TTL seconds)
await redisService.set(key, value, ttl);

// Get data (returns null if not found)
const data = await redisService.get(key);

// Delete data
await redisService.del(key);

// Access raw Redis client for advanced operations
await redisService.client.hset('hash-key', 'field', 'value');
```

---

## 🎉 Next Steps

1. Try the examples above in your project
2. Read the official [ioredis documentation](https://github.com/redis/ioredis)
3. Experiment with different TTL values
4. Monitor your Redis usage with `docker stats chat-redis`

**Remember:** Redis is your friend for making apps faster and handling real-time data. Start simple, then explore advanced features as you grow! 🚀
