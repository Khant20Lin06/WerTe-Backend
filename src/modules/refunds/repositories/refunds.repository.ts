import { Injectable } from '@nestjs/common';
import {
  PaymentProvider,
  Prisma,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  refundAttemptSelect,
  RefundAttemptRecord,
} from '../entities/refund-attempt.entity';
import {
  refundProviderEventSelect,
  RefundProviderEventRecord,
} from '../entities/refund-provider-event.entity';
import {
  refundSummaryInclude,
  RefundSummaryRecord,
} from '../entities/refund-summary.entity';

type RefundDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class RefundsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(
    refundId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord | null> {
    return client.refund.findUnique({
      where: {
        id: refundId,
      },
      include: refundSummaryInclude,
    });
  }

  findOrderRefund(
    orderId: string,
    refundId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord | null> {
    return client.refund.findFirst({
      where: {
        id: refundId,
        orderId,
      },
      include: refundSummaryInclude,
    });
  }

  findCustomerRefund(
    customerProfileId: string,
    refundId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord | null> {
    return client.refund.findFirst({
      where: {
        id: refundId,
        order: {
          is: {
            customerProfileId,
          },
        },
      },
      include: refundSummaryInclude,
    });
  }

  findOrderRefunds(
    orderId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord[]> {
    return client.refund.findMany({
      where: {
        orderId,
      },
      include: refundSummaryInclude,
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
    });
  }

  findCustomerOrderRefunds(
    orderId: string,
    customerProfileId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord[]> {
    return client.refund.findMany({
      where: {
        orderId,
        order: {
          is: {
            customerProfileId,
          },
        },
      },
      include: refundSummaryInclude,
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
    });
  }

  findPaymentRefunds(
    paymentId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord[]> {
    return client.refund.findMany({
      where: {
        paymentId,
      },
      include: refundSummaryInclude,
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
    });
  }

  findLatestByProviderReference(
    provider: PaymentProvider,
    providerReference: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord | null> {
    return client.refund.findFirst({
      where: {
        providerReference,
        payment: {
          is: {
            provider,
          },
        },
      },
      include: refundSummaryInclude,
      orderBy: [{ updatedAt: 'desc' }, { requestedAt: 'desc' }, { id: 'desc' }],
    });
  }

  findRefundAttempts(
    refundId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundAttemptRecord[]> {
    return client.refundAttempt.findMany({
      where: {
        refundId,
      },
      select: refundAttemptSelect,
      orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
    });
  }

  findByIdempotencyKey(
    idempotencyKey: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord | null> {
    return client.refund.findUnique({
      where: {
        idempotencyKey,
      },
      include: refundSummaryInclude,
    });
  }

  createRefundRequest(
    payload: {
      paymentId: string;
      orderId: string;
      createdByUserId: string;
      status: RefundStatus;
      amount: Prisma.Decimal;
      currencyCode: string;
      idempotencyKey?: string | null;
      providerReference?: string | null;
      reasonCode?: string | null;
      note?: string | null;
      metadataJson?: Prisma.InputJsonValue;
      provider: PaymentProvider;
      requestPayloadJson?: Prisma.InputJsonValue;
      responsePayloadJson?: Prisma.InputJsonValue;
      occurredAt?: Date;
    },
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord> {
    const occurredAt = payload.occurredAt ?? new Date();

    return client.refund.create({
      data: {
        paymentId: payload.paymentId,
        orderId: payload.orderId,
        createdByUserId: payload.createdByUserId,
        status: payload.status,
        amount: payload.amount,
        currencyCode: payload.currencyCode,
        idempotencyKey: payload.idempotencyKey ?? null,
        providerReference: payload.providerReference ?? null,
        reasonCode: payload.reasonCode ?? null,
        note: payload.note ?? null,
        metadataJson: payload.metadataJson,
        requestedAt: occurredAt,
        attempts: {
          create: {
            provider: payload.provider,
            status: payload.status,
            providerReference: payload.providerReference ?? null,
            requestPayloadJson: payload.requestPayloadJson,
            responsePayloadJson: payload.responsePayloadJson,
            attemptedAt: occurredAt,
          },
        },
      },
      include: refundSummaryInclude,
    });
  }

  transitionRefundStatus(
    payload: {
      refundId: string;
      provider: PaymentProvider;
      status: RefundStatus;
      metadataJson?: Prisma.InputJsonValue;
      providerReference?: string | null;
      failureCode?: string | null;
      failureMessage?: string | null;
      requestPayloadJson?: Prisma.InputJsonValue;
      responsePayloadJson?: Prisma.InputJsonValue;
      occurredAt?: Date;
    },
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundSummaryRecord> {
    const occurredAt = payload.occurredAt ?? new Date();

    return client.refund.update({
      where: {
        id: payload.refundId,
      },
      data: {
        status: payload.status,
        metadataJson: payload.metadataJson,
        providerReference: payload.providerReference ?? null,
        failureCode: payload.failureCode ?? null,
        failureMessage: payload.failureMessage ?? null,
        succeededAt:
          payload.status === RefundStatus.SUCCEEDED ? occurredAt : null,
        failedAt: payload.status === RefundStatus.FAILED ? occurredAt : null,
        cancelledAt:
          payload.status === RefundStatus.CANCELLED ? occurredAt : null,
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
      include: refundSummaryInclude,
    });
  }

  findRefundProviderEventByProviderEventId(
    provider: PaymentProvider,
    providerEventId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundProviderEventRecord | null> {
    return client.refundProviderEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider,
          providerEventId,
        },
      },
      select: refundProviderEventSelect,
    });
  }

  findRefundProviderEventById(
    refundProviderEventId: string,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundProviderEventRecord | null> {
    return client.refundProviderEvent.findUnique({
      where: {
        id: refundProviderEventId,
      },
      select: refundProviderEventSelect,
    });
  }

  listProcessableRefundProviderEvents(
    limit = 50,
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundProviderEventRecord[]> {
    return client.refundProviderEvent.findMany({
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
      select: refundProviderEventSelect,
      orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
      take: limit,
    });
  }

  createRefundProviderEvent(
    payload: {
      provider: PaymentProvider;
      providerEventId?: string | null;
      eventType: string;
      refundId?: string | null;
      paymentId?: string | null;
      orderId?: string | null;
      providerReference?: string | null;
      normalizedStatus?: RefundStatus | null;
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
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundProviderEventRecord> {
    return client.refundProviderEvent.create({
      data: {
        provider: payload.provider,
        providerEventId: payload.providerEventId ?? null,
        eventType: payload.eventType,
        refundId: payload.refundId ?? null,
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
      select: refundProviderEventSelect,
    });
  }

  updateRefundProviderEventProcessingState(
    payload: {
      refundProviderEventId: string;
      processingStatus: ProviderEventProcessingStatus;
      refundId?: string | null;
      paymentId?: string | null;
      orderId?: string | null;
      providerReference?: string | null;
      processingMetadataJson?: Prisma.InputJsonValue;
      failureCode?: string | null;
      failureMessage?: string | null;
      occurredAt?: Date;
    },
    client: RefundDatabaseClient = this.prisma,
  ): Promise<RefundProviderEventRecord> {
    const occurredAt = payload.occurredAt ?? new Date();

    return client.refundProviderEvent.update({
      where: {
        id: payload.refundProviderEventId,
      },
      data: {
        refundId: payload.refundId ?? undefined,
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
      select: refundProviderEventSelect,
    });
  }
}
