import { PaymentProvider, Prisma, RefundStatus } from '@prisma/client';

export const refundAttemptSelect =
  Prisma.validator<Prisma.RefundAttemptSelect>()({
    id: true,
    refundId: true,
    provider: true,
    status: true,
    providerReference: true,
    requestPayloadJson: true,
    responsePayloadJson: true,
    failureCode: true,
    failureMessage: true,
    attemptedAt: true,
    createdAt: true,
    updatedAt: true,
  });

export type RefundAttemptRecord = Prisma.RefundAttemptGetPayload<{
  select: typeof refundAttemptSelect;
}>;

export class RefundAttemptEntity {
  refundAttemptId!: string;
  refundId!: string;
  provider!: PaymentProvider;
  status!: RefundStatus;
  providerReference!: string | null;
  requestPayload!: Prisma.JsonValue | null;
  responsePayload!: Prisma.JsonValue | null;
  failureCode!: string | null;
  failureMessage!: string | null;
  attemptedAt!: string;
  createdAt!: string;
  updatedAt!: string;
}

export function buildRefundAttemptEntity(
  attempt: RefundAttemptRecord,
): RefundAttemptEntity {
  return {
    refundAttemptId: attempt.id,
    refundId: attempt.refundId,
    provider: attempt.provider,
    status: attempt.status,
    providerReference: attempt.providerReference ?? null,
    requestPayload: (attempt.requestPayloadJson as Prisma.JsonValue | null) ?? null,
    responsePayload:
      (attempt.responsePayloadJson as Prisma.JsonValue | null) ?? null,
    failureCode: attempt.failureCode ?? null,
    failureMessage: attempt.failureMessage ?? null,
    attemptedAt: attempt.attemptedAt.toISOString(),
    createdAt: attempt.createdAt.toISOString(),
    updatedAt: attempt.updatedAt.toISOString(),
  };
}
