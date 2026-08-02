import { AppLogger } from '../logging/app.logger';
import { CacheMetricsService } from '../metrics/cache-metrics.service';

/**
 * Runs a Redis-backed cache operation and swallows any error, returning
 * `fallback` instead of letting it propagate.
 *
 * Cache is meant to be an optional accelerant: if Redis is unreachable, a
 * read should behave like a cache miss (fall through to the source of
 * truth) and a write/invalidate should be a no-op — not a 500 for every
 * caller. Every failure is still logged and counted so an outage is visible
 * in metrics/logs even though it no longer breaks requests.
 */
export async function safeRedisOp<T>(
  operation: 'read' | 'write' | 'invalidate',
  cacheName: string,
  logger: AppLogger,
  cacheMetrics: CacheMetricsService,
  fallback: T,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    cacheMetrics.error(cacheName, operation);
    logger.warnEvent(
      'Cache operation failed; degrading to fallback.',
      { cache: cacheName, operation, error: String(error) },
      'RedisCache',
    );
    return fallback;
  }
}
