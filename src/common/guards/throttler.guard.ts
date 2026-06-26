import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

// X-Forwarded-For is set by load balancers and reverse proxies in front of
// the app. The leftmost address is the original client; the rest are proxies
// we control. We trust this header because production sits behind a trusted
// proxy (nginx / ALB) — if you ever expose the app directly, remove the
// X-Forwarded-For branch so spoofing is impossible.
const TRUSTED_PROXY_HEADERS = ['x-forwarded-for', 'x-real-ip'] as const;

@Injectable()
export class IpAwareThrottlerGuard extends ThrottlerGuard {
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
}
