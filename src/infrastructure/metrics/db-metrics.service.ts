import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

import { getOrCreateCounter, getOrCreateHistogram } from './metrics.registry';

@Injectable()
export class DbMetricsService {
  readonly queryDuration: Histogram = getOrCreateHistogram({
    name: 'db_query_duration_seconds',
    help: 'Prisma database query duration in seconds',
    labelNames: ['model', 'action'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  });

  readonly queryErrorsTotal: Counter = getOrCreateCounter({
    name: 'db_query_errors_total',
    help: 'Total number of Prisma query errors',
    labelNames: ['model', 'action'],
  });
}
