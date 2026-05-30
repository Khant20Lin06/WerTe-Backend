import { PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';

export const paymentAttemptSelect =
  Prisma.validator<Prisma.PaymentAttemptSelect>()({
    id: true,
    paymentId: true,
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

export type PaymentAttemptRecord = Prisma.PaymentAttemptGetPayload<{
  select: typeof paymentAttemptSelect;
}>;

export class PaymentAttemptEntity {
  paymentAttemptId!: string;
  paymentId!: string;
  provider!: PaymentProvider;
  status!: PaymentStatus;
  providerReference!: string | null;
  requestPayload!: Prisma.JsonValue | null;
  responsePayload!: Prisma.JsonValue | null;
  failureCode!: string | null;
  failureMessage!: string | null;
  attemptedAt!: string;
  createdAt!: string;
  updatedAt!: string;
}

export function buildPaymentAttemptEntity(
  attempt: PaymentAttemptRecord,
): PaymentAttemptEntity {
  return {
    paymentAttemptId: attempt.id,
    paymentId: attempt.paymentId,
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
