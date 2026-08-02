import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';

import { getOrCreateCounter } from './metrics.registry';

@Injectable()
export class CacheMetricsService {
  readonly cacheHitsTotal: Counter = getOrCreateCounter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache'],
  });

  readonly cacheMissesTotal: Counter = getOrCreateCounter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache'],
  });

  readonly cacheErrorsTotal: Counter = getOrCreateCounter({
    name: 'cache_errors_total',
    help: 'Total number of cache operations that failed and fell through to the source of truth',
    labelNames: ['cache', 'operation'],
  });

  hit(cache: string): void {
    this.cacheHitsTotal.inc({ cache });
  }

  miss(cache: string): void {
    this.cacheMissesTotal.inc({ cache });
  }

  error(cache: string, operation: 'read' | 'write' | 'invalidate'): void {
    this.cacheErrorsTotal.inc({ cache, operation });
  }
}
