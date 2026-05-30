import { Injectable } from '@nestjs/common';

import { PrismaService } from './infrastructure/database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    const database = await this.prisma.checkHealth();

    return {
      status: database.status === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database,
      },
    };
  }

  async health() {
    return this.ready();
  }
}
