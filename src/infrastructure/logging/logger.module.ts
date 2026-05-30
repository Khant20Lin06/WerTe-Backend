import { Global, Module } from '@nestjs/common';

import { RequestContextMiddleware } from '../../common/middleware/request-context.middleware';
import { AppLogger } from './app.logger';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  providers: [RequestContextService, RequestContextMiddleware, AppLogger],
  exports: [RequestContextService, RequestContextMiddleware, AppLogger],
})
export class LoggerModule {}
