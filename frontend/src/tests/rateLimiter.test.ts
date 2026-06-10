import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/utils/rateLimiter';

describe('Edge API Rate Limiter', () => {
  it('allows requests within capacity boundaries and throttles when exhausted', () => {
    const testIp = '192.168.1.50';
    
    // Consume 10 initial tokens
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(testIp)).toBe(true);
    }

    // 11th request must exceed bounds and return false
    expect(checkRateLimit(testIp)).toBe(false);
  });
});
