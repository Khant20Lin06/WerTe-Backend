import { Global, Module } from '@nestjs/common';

import { CacheMetricsService } from './cache-metrics.service';
import { DbMetricsService } from './db-metrics.service';
import { HttpMetricsService } from './http-metrics.service';
import { MetricsController } from './metrics.controller';
import { QueueMetricsService } from './queue-metrics.service';
import { TraceService } from './trace.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [
    HttpMetricsService,
    DbMetricsService,
    CacheMetricsService,
    QueueMetricsService,
    TraceService,
  ],
  exports: [
    HttpMetricsService,
    DbMetricsService,
    CacheMetricsService,
    QueueMetricsService,
    TraceService,
  ],
})
export class MetricsModule {}
