import {
  PaymentProvider,
  Prisma,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

export const refundProviderEventSelect =
  Prisma.validator<Prisma.RefundProviderEventSelect>()({
    id: true,
    provider: true,
    providerEventId: true,
    eventType: true,
    refundId: true,
    paymentId: true,
    orderId: true,
    providerReference: true,
    normalizedStatus: true,
    verificationStatus: true,
    processingStatus: true,
    signatureHeader: true,
    headersJson: true,
    rawPayloadJson: true,
    normalizedPayloadJson: true,
    processingMetadataJson: true,
    failureCode: true,
    failureMessage: true,
    receivedAt: true,
    processedAt: true,
    failedAt: true,
    ignoredAt: true,
    createdAt: true,
    updatedAt: true,
  });

export type RefundProviderEventRecord = Prisma.RefundProviderEventGetPayload<{
  select: typeof refundProviderEventSelect;
}>;

export class RefundProviderEventEntity {
  refundProviderEventId!: string;
  provider!: PaymentProvider;
  providerEventId!: string | null;
  eventType!: string;
  refundId!: string | null;
  paymentId!: string | null;
  orderId!: string | null;
  providerReference!: string | null;
  normalizedStatus!: RefundStatus | null;
  verificationStatus!: ProviderEventVerificationStatus;
  processingStatus!: ProviderEventProcessingStatus;
  signatureHeader!: string | null;
  headers!: Prisma.JsonValue | null;
  rawPayload!: Prisma.JsonValue;
  normalizedPayload!: Prisma.JsonValue | null;
  processingMetadata!: Prisma.JsonValue | null;
  failureCode!: string | null;
  failureMessage!: string | null;
  receivedAt!: string;
  processedAt!: string | null;
  failedAt!: string | null;
  ignoredAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
}

export function buildRefundProviderEventEntity(
  event: RefundProviderEventRecord,
): RefundProviderEventEntity {
  return {
    refundProviderEventId: event.id,
    provider: event.provider,
    providerEventId: event.providerEventId ?? null,
    eventType: event.eventType,
    refundId: event.refundId ?? null,
    paymentId: event.paymentId ?? null,
    orderId: event.orderId ?? null,
    providerReference: event.providerReference ?? null,
    normalizedStatus: event.normalizedStatus ?? null,
    verificationStatus: event.verificationStatus,
    processingStatus: event.processingStatus,
    signatureHeader: event.signatureHeader ?? null,
    headers: (event.headersJson as Prisma.JsonValue | null) ?? null,
    rawPayload: event.rawPayloadJson as Prisma.JsonValue,
    normalizedPayload:
      (event.normalizedPayloadJson as Prisma.JsonValue | null) ?? null,
    processingMetadata:
      (event.processingMetadataJson as Prisma.JsonValue | null) ?? null,
    failureCode: event.failureCode ?? null,
    failureMessage: event.failureMessage ?? null,
    receivedAt: event.receivedAt.toISOString(),
    processedAt: event.processedAt?.toISOString() ?? null,
    failedAt: event.failedAt?.toISOString() ?? null,
    ignoredAt: event.ignoredAt?.toISOString() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
