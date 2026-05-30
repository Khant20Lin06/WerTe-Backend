import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminReportsService } from './services/admin-reports.service';

@Module({
  imports: [AuditModule],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
  exports: [AdminReportsService],
})
export class ReportsModule {}
