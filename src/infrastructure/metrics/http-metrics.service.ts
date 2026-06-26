import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

import { getOrCreateCounter, getOrCreateHistogram } from './metrics.registry';

@Injectable()
export class HttpMetricsService {
  readonly requestDuration: Histogram = getOrCreateHistogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  });

  readonly requestTotal: Counter = getOrCreateCounter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  readonly requestErrorsTotal: Counter = getOrCreateCounter({
    name: 'http_request_errors_total',
    help: 'Total number of HTTP requests that returned 4xx or 5xx',
    labelNames: ['method', 'route', 'status_code'],
  });
}
