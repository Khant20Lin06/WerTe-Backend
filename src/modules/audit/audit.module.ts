import { Module } from '@nestjs/common';

import { AdminAuditController } from './controllers/admin-audit.controller';
import { AuditRepository } from './repositories/audit.repository';
import { AuditEventService } from './services/audit-event.service';
import { AuditReadService } from './services/audit-read.service';
import { AuditService } from './services/audit.service';

@Module({
  controllers: [AdminAuditController],
  providers: [AuditRepository, AuditService, AuditEventService, AuditReadService],
  exports: [AuditRepository, AuditService, AuditEventService, AuditReadService],
})
export class AuditModule {}
