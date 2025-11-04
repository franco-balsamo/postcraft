import Redis from 'ioredis';
import 'dotenv/config';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

/**
 * Shared Redis client used throughout the application.
 * Bull creates its own connections internally; this client is for
 * direct cache/pub-sub usage.
 */
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy(times) {
    if (times > 10) {
      console.error('[Redis] Max reconnection attempts reached. Giving up.');
      return null; // stop retrying
    }
    const delay = Math.min(times * 200, 3000);
    console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('ready', () => console.log('[Redis] Ready'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));
redis.on('close', () => console.warn('[Redis] Connection closed'));

export default redis;
