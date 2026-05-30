import { Module } from '@nestjs/common';

import { PaymentsModule } from '../payments/payments.module';
import { RefundsModule } from '../refunds/refunds.module';
import { ProviderWebhooksController } from './controllers/provider-webhooks.controller';
import { ProviderWebhookSecretsService } from './services/provider-webhook-secrets.service';

@Module({
  imports: [PaymentsModule, RefundsModule],
  controllers: [ProviderWebhooksController],
  providers: [ProviderWebhookSecretsService],
})
export class ProviderWebhooksModule {}
