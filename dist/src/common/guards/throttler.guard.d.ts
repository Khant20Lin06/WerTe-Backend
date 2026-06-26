import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
export declare class IpAwareThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Request): Promise<string>;
}
