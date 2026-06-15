import { Module } from '@nestjs/common';

import { AgentSupportController } from './controllers/agent-support.controller';
import { CustomerSupportController } from './controllers/customer-support.controller';
import { SupportTicketsRepository } from './repositories/support-tickets.repository';
import { SupportTicketsService } from './services/support-tickets.service';

@Module({
  controllers: [CustomerSupportController, AgentSupportController],
  providers: [SupportTicketsService, SupportTicketsRepository],
  exports: [SupportTicketsService],
})
export class SupportModule {}
