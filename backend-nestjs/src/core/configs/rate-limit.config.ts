export interface RateLimitRule {
  // The regex pattern to match against the request path.
  pattern: RegExp;
  // bucket capacity
  capacity: number;
  // How many tokens are refilled per second.
  refillRate: number;
}

export const RateLimitTiers = {
  DEFAULT: { capacity: 100, refillRate: 10 },
  EXPENSIVE: { capacity: 10, refillRate: 1 },
  MODERATE: { capacity: 30, refillRate: 5 },
  AUTH: { capacity: 10, refillRate: 1 },
  MESSAGING: { capacity: 50, refillRate: 5 },
  UPLOAD: { capacity: 10, refillRate: 1 },
};

export const rateLimitConfig = {
  default: RateLimitTiers.DEFAULT,

  rules: [
    // EXCEPTION: Allow normal traffic for fetching the current user profile
    {
      pattern: /^\/api\/v1\/auth\/me$/,
      ...RateLimitTiers.DEFAULT,
    },

    // Auth endpoints (brute-force protection)
    {
      pattern: /^\/api\/v1\/auth\//,
      ...RateLimitTiers.AUTH,
    },

    // Upload & Video endpoints (bandwidth and processing intensive)
    {
      pattern: /^\/api\/v1\/(upload|video)\//,
      ...RateLimitTiers.UPLOAD,
    },

    // Messaging & Real-time communication (high burst allowance)
    {
      pattern: /^\/api\/v1\/(messages|groups)\//,
      ...RateLimitTiers.MESSAGING,
    },

    // Moderate endpoints (complex database queries)
    {
      pattern: /^\/api\/v1\/(search|users)\//,
      ...RateLimitTiers.MODERATE,
    },
    
    // All other endpoints automatically fall back to DEFAULT tier
  ] as RateLimitRule[],
};
