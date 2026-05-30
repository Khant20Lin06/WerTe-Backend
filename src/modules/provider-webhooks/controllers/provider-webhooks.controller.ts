import {
  Body,
  Controller,
  Headers,
  Param,
  ParseEnumPipe,
  Post,
  Req,
} from '@nestjs/common';
import { PaymentProvider, Prisma } from '@prisma/client';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '../../../common/decorators/public.decorator';
import { QueueJobNames, QueueNames } from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { PaymentProviderWebhookService } from '../../payments/services/payment-provider-webhook.service';
import { RefundProviderWebhookService } from '../../refunds/services/refund-provider-webhook.service';
import { ProviderWebhookSecretsService } from '../services/provider-webhook-secrets.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer | string;
};

@ApiTags('provider-webhooks')
@Public()
@Controller('provider-webhooks/:provider')
export class ProviderWebhooksController {
  constructor(
    private readonly paymentProviderWebhookService: PaymentProviderWebhookService,
    private readonly refundProviderWebhookService: RefundProviderWebhookService,
    private readonly providerWebhookSecretsService: ProviderWebhookSecretsService,
    private readonly queueService: QueueService,
  ) {}

  @ApiOperation({
    operationId: 'receivePaymentProviderWebhook',
    summary: 'Receive and queue a payment provider webhook',
  })
  @ApiParam({
    name: 'provider',
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiOkResponse({
    description:
      'Stores the provider payment event, queues processing, and returns the current processing snapshot.',
  })
  @Post('payments')
  async receivePaymentWebhook(
    @Param('provider', new ParseEnumPipe(PaymentProvider))
    provider: PaymentProvider,
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() request: RawBodyRequest,
  ) {
    const ingestedEvent =
      await this.paymentProviderWebhookService.ingestPaymentWebhook({
        provider,
        payload: this.toInputJson(body),
        rawBody: this.readRawBody(request),
        headers: this.normalizeHeaders(headers),
        signatureHeader: this.readSignatureHeader(headers, provider),
        signingSecret: this.providerWebhookSecretsService.resolveSigningSecret(
          provider,
          'payment',
        ),
      });

    await this.queueService.add(
      QueueNames.providerWebhooks,
      QueueJobNames.providerWebhooks.processPaymentEvent,
      {
        paymentProviderEventId: ingestedEvent.paymentProviderEventId,
      },
    );

    return ingestedEvent;
  }

  @ApiOperation({
    operationId: 'receiveRefundProviderWebhook',
    summary: 'Receive and queue a refund provider webhook',
  })
  @ApiParam({
    name: 'provider',
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiOkResponse({
    description:
      'Stores the provider refund event, queues processing, and returns the current processing snapshot.',
  })
  @Post('refunds')
  async receiveRefundWebhook(
    @Param('provider', new ParseEnumPipe(PaymentProvider))
    provider: PaymentProvider,
    @Body() body: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() request: RawBodyRequest,
  ) {
    const ingestedEvent =
      await this.refundProviderWebhookService.ingestRefundWebhook({
        provider,
        payload: this.toInputJson(body),
        rawBody: this.readRawBody(request),
        headers: this.normalizeHeaders(headers),
        signatureHeader: this.readSignatureHeader(headers, provider),
        signingSecret: this.providerWebhookSecretsService.resolveSigningSecret(
          provider,
          'refund',
        ),
      });

    await this.queueService.add(
      QueueNames.providerWebhooks,
      QueueJobNames.providerWebhooks.processRefundEvent,
      {
        refundProviderEventId: ingestedEvent.refundProviderEventId,
      },
    );

    return ingestedEvent;
  }

  private readRawBody(request: RawBodyRequest): string | undefined {
    if (Buffer.isBuffer(request.rawBody)) {
      return request.rawBody.toString('utf8');
    }

    return request.rawBody;
  }

  private readSignatureHeader(
    headers: Record<string, string | string[] | undefined>,
    provider: PaymentProvider,
  ): string | null {
    const providerHeader = `${provider.toLowerCase().replaceAll('_', '-')}-signature`;
    const headerNames = [
      providerHeader,
      'stripe-signature',
      'x-provider-signature',
      'x-webhook-signature',
      'x-signature',
      'x-hub-signature-256',
    ];

    for (const headerName of headerNames) {
      const value = this.readHeader(headers, headerName);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  private readHeader(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | null {
    const value = headers[name] ?? headers[name.toLowerCase()];

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(',') : null;
    }

    return value ?? null;
  }

  private normalizeHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Prisma.InputJsonValue {
    return Object.fromEntries(
      Object.entries(headers).flatMap(([key, value]) => {
        if (value === undefined) {
          return [];
        }

        return [[key, Array.isArray(value) ? value.join(',') : value]];
      }),
    ) as Prisma.InputJsonValue;
  }

  private toInputJson(body: unknown): Prisma.InputJsonValue {
    return (body ?? {}) as Prisma.InputJsonValue;
  }
}
