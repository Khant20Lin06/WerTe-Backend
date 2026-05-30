import { Injectable } from '@nestjs/common';
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  checkoutPaymentIntentSelect,
  CheckoutPaymentIntentRecord,
} from '../entities/checkout-payment-intent.entity';
import {
  paymentAttemptSelect,
  PaymentAttemptRecord,
} from '../entities/payment-attempt.entity';
import {
  paymentProviderEventSelect,
  PaymentProviderEventRecord,
} from '../entities/payment-provider-event.entity';
import {
  paymentSummaryInclude,
  PaymentSummaryRecord,
} from '../entities/payment-summary.entity';

type PaymentDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(
    paymentId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord | null> {
    return client.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: paymentSummaryInclude,
    });
  }

  findOrderPayment(
    orderId: string,
    paymentId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord | null> {
    return client.payment.findFirst({
      where: {
        id: paymentId,
        orderId,
      },
      include: paymentSummaryInclude,
    });
  }

  findCustomerPayment(
    customerProfileId: string,
    paymentId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord | null> {
    return client.payment.findFirst({
      where: {
        id: paymentId,
        customerProfileId,
      },
      include: paymentSummaryInclude,
    });
  }

  findOrderPayments(
    orderId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord[]> {
    return client.payment.findMany({
      where: {
        orderId,
      },
      include: paymentSummaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findCustomerOrderPayments(
    orderId: string,
    customerProfileId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord[]> {
    return client.payment.findMany({
      where: {
        orderId,
        customerProfileId,
      },
      include: paymentSummaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findLatestOrderPayment(
    orderId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord | null> {
    return client.payment.findFirst({
      where: {
        orderId,
      },
      include: paymentSummaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findLatestByProviderReference(
    provider: PaymentProvider,
    providerReference: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord | null> {
    return client.payment.findFirst({
      where: {
        provider,
        providerReference,
      },
      include: paymentSummaryInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findPaymentAttempts(
    paymentId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentAttemptRecord[]> {
    return client.paymentAttempt.findMany({
      where: {
        paymentId,
      },
      select: paymentAttemptSelect,
      orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
    });
  }

  findCheckoutPaymentIntentByIdempotencyKey(
    idempotencyKey: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<CheckoutPaymentIntentRecord | null> {
    return client.payment.findUnique({
      where: {
        idempotencyKey,
      },
      select: checkoutPaymentIntentSelect,
    });
  }

  createCheckoutPaymentIntent(
    payload: {
      orderId: string;
      customerProfileId: string;
      method: PaymentMethod;
      provider: PaymentProvider;
      status: PaymentStatus;
      amount: Prisma.Decimal;
      currencyCode: string;
      idempotencyKey: string;
      metadataJson?: Prisma.InputJsonValue;
      requiresActionAt?: Date | null;
      requestPayloadJson?: Prisma.InputJsonValue;
      responsePayloadJson?: Prisma.InputJsonValue;
    },
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<CheckoutPaymentIntentRecord> {
    return client.payment.create({
      data: {
        orderId: payload.orderId,
        customerProfileId: payload.customerProfileId,
        method: payload.method,
        provider: payload.provider,
        status: payload.status,
        amount: payload.amount,
        currencyCode: payload.currencyCode,
        idempotencyKey: payload.idempotencyKey,
        metadataJson: payload.metadataJson,
        requiresActionAt: payload.requiresActionAt ?? null,
        attempts: {
          create: {
            provider: payload.provider,
            status: payload.status,
            requestPayloadJson: payload.requestPayloadJson,
            responsePayloadJson: payload.responsePayloadJson,
          },
        },
      },
      select: checkoutPaymentIntentSelect,
    });
  }

  transitionPaymentStatus(
    payload: {
      paymentId: string;
      provider: PaymentProvider;
      status: PaymentStatus;
      metadataJson?: Prisma.InputJsonValue;
      providerReference?: string | null;
      providerReceiptId?: string | null;
      failureCode?: string | null;
      failureMessage?: string | null;
      requestPayloadJson?: Prisma.InputJsonValue;
      responsePayloadJson?: Prisma.InputJsonValue;
      occurredAt?: Date;
    },
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord> {
    const occurredAt = payload.occurredAt ?? new Date();

    return client.payment.update({
      where: {
        id: payload.paymentId,
      },
      data: {
        provider: payload.provider,
        status: payload.status,
        metadataJson: payload.metadataJson,
        providerReference: payload.providerReference ?? null,
        providerReceiptId: payload.providerReceiptId ?? null,
        failureCode: payload.failureCode ?? null,
        failureMessage: payload.failureMessage ?? null,
        requiresActionAt: null,
        succeededAt:
          payload.status === PaymentStatus.SUCCEEDED ? occurredAt : null,
        failedAt: payload.status === PaymentStatus.FAILED ? occurredAt : null,
        cancelledAt:
          payload.status === PaymentStatus.CANCELLED ? occurredAt : null,
        expiredAt: payload.status === PaymentStatus.EXPIRED ? occurredAt : null,
        attempts: {
          create: {
            provider: payload.provider,
            status: payload.status,
            providerReference: payload.providerReference ?? null,
            requestPayloadJson: payload.requestPayloadJson,
            responsePayloadJson: payload.responsePayloadJson,
            failureCode: payload.failureCode ?? null,
            failureMessage: payload.failureMessage ?? null,
            attemptedAt: occurredAt,
          },
        },
      },
      include: paymentSummaryInclude,
    });
  }

  updateRefundState(
    payload: {
      paymentId: string;
      refundedAmount: Prisma.Decimal;
      status: PaymentStatus;
    },
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentSummaryRecord> {
    return client.payment.update({
      where: {
        id: payload.paymentId,
      },
      data: {
        refundedAmount: payload.refundedAmount,
        status: payload.status,
      },
      include: paymentSummaryInclude,
    });
  }

  findPaymentProviderEventByProviderEventId(
    provider: PaymentProvider,
    providerEventId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentProviderEventRecord | null> {
    return client.paymentProviderEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider,
          providerEventId,
        },
      },
      select: paymentProviderEventSelect,
    });
  }

  findPaymentProviderEventById(
    paymentProviderEventId: string,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentProviderEventRecord | null> {
    return client.paymentProviderEvent.findUnique({
      where: {
        id: paymentProviderEventId,
      },
      select: paymentProviderEventSelect,
    });
  }

  listProcessablePaymentProviderEvents(
    limit = 50,
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentProviderEventRecord[]> {
    return client.paymentProviderEvent.findMany({
      where: {
        verificationStatus: {
          in: [
            ProviderEventVerificationStatus.VERIFIED,
            ProviderEventVerificationStatus.SKIPPED,
          ],
        },
        processingStatus: {
          in: [
            ProviderEventProcessingStatus.RECEIVED,
            ProviderEventProcessingStatus.FAILED,
            ProviderEventProcessingStatus.IGNORED,
          ],
        },
      },
      select: paymentProviderEventSelect,
      orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
      take: limit,
    });
  }

  createPaymentProviderEvent(
    payload: {
      provider: PaymentProvider;
      providerEventId?: string | null;
      eventType: string;
      paymentId?: string | null;
      orderId?: string | null;
      providerReference?: string | null;
      normalizedStatus?: PaymentStatus | null;
      verificationStatus: ProviderEventVerificationStatus;
      processingStatus: ProviderEventProcessingStatus;
      signatureHeader?: string | null;
      headersJson?: Prisma.InputJsonValue;
      rawPayloadJson: Prisma.InputJsonValue;
      normalizedPayloadJson?: Prisma.InputJsonValue;
      processingMetadataJson?: Prisma.InputJsonValue;
      failureCode?: string | null;
      failureMessage?: string | null;
      receivedAt?: Date;
      failedAt?: Date | null;
    },
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentProviderEventRecord> {
    return client.paymentProviderEvent.create({
      data: {
        provider: payload.provider,
        providerEventId: payload.providerEventId ?? null,
        eventType: payload.eventType,
        paymentId: payload.paymentId ?? null,
        orderId: payload.orderId ?? null,
        providerReference: payload.providerReference ?? null,
        normalizedStatus: payload.normalizedStatus ?? null,
        verificationStatus: payload.verificationStatus,
        processingStatus: payload.processingStatus,
        signatureHeader: payload.signatureHeader ?? null,
        headersJson: payload.headersJson,
        rawPayloadJson: payload.rawPayloadJson,
        normalizedPayloadJson: payload.normalizedPayloadJson,
        processingMetadataJson: payload.processingMetadataJson,
        failureCode: payload.failureCode ?? null,
        failureMessage: payload.failureMessage ?? null,
        receivedAt: payload.receivedAt,
        failedAt: payload.failedAt ?? null,
      },
      select: paymentProviderEventSelect,
    });
  }

  updatePaymentProviderEventProcessingState(
    payload: {
      paymentProviderEventId: string;
      processingStatus: ProviderEventProcessingStatus;
      paymentId?: string | null;
      orderId?: string | null;
      providerReference?: string | null;
      processingMetadataJson?: Prisma.InputJsonValue;
      failureCode?: string | null;
      failureMessage?: string | null;
      occurredAt?: Date;
    },
    client: PaymentDatabaseClient = this.prisma,
  ): Promise<PaymentProviderEventRecord> {
    const occurredAt = payload.occurredAt ?? new Date();

    return client.paymentProviderEvent.update({
      where: {
        id: payload.paymentProviderEventId,
      },
      data: {
        paymentId: payload.paymentId ?? undefined,
        orderId: payload.orderId ?? undefined,
        providerReference: payload.providerReference ?? undefined,
        processingStatus: payload.processingStatus,
        processingMetadataJson: payload.processingMetadataJson,
        failureCode: payload.failureCode ?? null,
        failureMessage: payload.failureMessage ?? null,
        processedAt:
          payload.processingStatus === ProviderEventProcessingStatus.PROCESSED
            ? occurredAt
            : null,
        failedAt:
          payload.processingStatus === ProviderEventProcessingStatus.FAILED
            ? occurredAt
            : null,
        ignoredAt:
          payload.processingStatus === ProviderEventProcessingStatus.IGNORED
            ? occurredAt
            : null,
      },
      select: paymentProviderEventSelect,
    });
  }
}
