import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import type { Request } from 'express';

import { AppLogger } from '../../infrastructure/logging/app.logger';

// X-Forwarded-For is set by load balancers and reverse proxies in front of
// the app. The leftmost address is the original client; the rest are proxies
// we control. We trust this header because production sits behind a trusted
// proxy (nginx / ALB) — if you ever expose the app directly, remove the
// X-Forwarded-For branch so spoofing is impossible.
const TRUSTED_PROXY_HEADERS = ['x-forwarded-for', 'x-real-ip'] as const;

// Bound the in-memory fallback map so a Redis outage can't itself become a
// memory-exhaustion vector under a flood of distinct trackers (IPs).
const FALLBACK_MAX_ENTRIES = 50_000;
// Sweep expired entries periodically instead of on every request, since a
// per-request O(n) scan would defeat the point of a *fast* fallback path.
const FALLBACK_SWEEP_INTERVAL_MS = 60_000;

type FallbackRecord = { count: number; resetAt: number };

@Injectable()
export class IpAwareThrottlerGuard extends ThrottlerGuard {
  // In-memory fallback limiter, used only while the Redis-backed storage is
  // unreachable. Per-process (not shared across replicas) and fixed-window
  // (not sliding), so it's strictly weaker than the real limiter — but it
  // still bounds abuse from a single client per instance, rather than
  // disabling rate-limiting entirely for the whole outage window.
  private readonly fallbackRecords = new Map<string, FallbackRecord>();
  private lastFallbackSweepAt = Date.now();

  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly appLogger: AppLogger,
  ) {
    super(options, storageService, reflector);
  }

  protected override async getTracker(req: Request): Promise<string> {
    for (const header of TRUSTED_PROXY_HEADERS) {
      const value = req.headers[header];

      if (typeof value === 'string' && value.trim().length > 0) {
        // X-Forwarded-For may be "client, proxy1, proxy2" — take the leftmost
        const clientIp = value.split(',')[0].trim();

        if (clientIp.length > 0) {
          return clientIp;
        }
      }
    }

    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }

  /**
   * Degrade, don't disable: if the Redis-backed throttler storage is
   * unreachable, `storageService.increment()` throws — and since this guard
   * runs globally (APP_GUARD) in front of every request, an uncaught error
   * here turns into a 500 for the entire API, not just rate-limited routes.
   * A rate limiter that can't reach its own store must let traffic through
   * rather than becoming an outage bigger than the one it protects against
   * (verified live: without any fallback, stopping Redis mid-flight 500'd
   * every request, including health checks) — but "let everything through
   * unbounded" also means a Redis outage doubles as an open invitation to
   * flood the API. The in-memory fallback below keeps a bounded, per-process
   * limit in effect for exactly that window.
   */
  protected override async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      // A real "too many requests" rejection must still block the caller —
      // only storage/infra failures fall through to the fallback path.
      if (error instanceof ThrottlerException) {
        throw error;
      }
      this.appLogger.warnEvent(
        'Throttler storage unavailable; using in-memory fallback limiter.',
        { error: String(error) },
        'IpAwareThrottlerGuard',
      );
      return await this.checkFallbackLimit(requestProps);
    }
  }

  /**
   * Fixed-window counter keyed the same way the real limiter would key it
   * (generateKey already folds in tracker + throttler name), capped at the
   * same limit/ttl configured for that throttler tier. Deliberately simple:
   * this only needs to hold up for the duration of a Redis outage, not
   * replace the real limiter's accuracy.
   */
  private async checkFallbackLimit(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    this.sweepFallbackRecordsIfDue();

    const { context, limit, ttl, throttler, generateKey } = requestProps;
    const { req } = this.getRequestResponse(context);
    // Reuse the same IP-resolution logic as the real limiter (X-Forwarded-For
    // aware) so a client can't dodge the fallback simply because Redis is
    // down — getTracker does no I/O, so this is cheap to call again here.
    const tracker = await this.getTracker(req as Request);
    const key = generateKey(context, tracker, throttler.name ?? 'default');

    const now = Date.now();
    const existing = this.fallbackRecords.get(key);

    if (existing === undefined || existing.resetAt <= now) {
      if (this.fallbackRecords.size >= FALLBACK_MAX_ENTRIES) {
        // Under sustained flood from many distinct trackers, drop the
        // bound rather than grow unbounded — a missed fallback check is
        // preferable to an OOM.
        return true;
      }
      this.fallbackRecords.set(key, { count: 1, resetAt: now + ttl });
      return true;
    }

    if (existing.count >= limit) {
      throw new HttpException(
        'ThrottlerException: Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    return true;
  }

  private sweepFallbackRecordsIfDue(): void {
    const now = Date.now();
    if (now - this.lastFallbackSweepAt < FALLBACK_SWEEP_INTERVAL_MS) return;
    this.lastFallbackSweepAt = now;

    for (const [key, record] of this.fallbackRecords) {
      if (record.resetAt <= now) {
        this.fallbackRecords.delete(key);
      }
    }
  }
}
