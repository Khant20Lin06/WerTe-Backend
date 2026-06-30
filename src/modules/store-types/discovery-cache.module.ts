import { Module } from '@nestjs/common';

import { DiscoveryCacheService } from './services/discovery-cache.service';

@Module({
  providers: [DiscoveryCacheService],
  exports: [DiscoveryCacheService],
})
export class DiscoveryCacheModule {}
