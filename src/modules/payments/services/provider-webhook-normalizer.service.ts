import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentStatus, Prisma, RefundStatus } from '@prisma/client';

export type NormalizedPaymentProviderEvent = {
  providerEventId: string | null;
  eventType: string;
  paymentId: string | null;
  orderId: string | null;
  providerReference: string | null;
  normalizedStatus: PaymentStatus | null;
  normalizedPayloadJson: Prisma.InputJsonValue;
};

export type NormalizedRefundProviderEvent = {
  providerEventId: string | null;
  eventType: string;
  refundId: string | null;
  paymentId: string | null;
  orderId: string | null;
  providerReference: string | null;
  normalizedStatus: RefundStatus | null;
  normalizedPayloadJson: Prisma.InputJsonValue;
};

@Injectable()
export class ProviderWebhookNormalizerService {
  normalizePaymentEvent(input: {
    provider: PaymentProvider;
    payload: Prisma.InputJsonValue;
  }): NormalizedPaymentProviderEvent {
    const root = this.asRecord(input.payload) ?? {};
    const object = this.extractDataObject(root);
    const eventType = this.readString(root, [
      'eventType',
      'event_type',
      'type',
      'event',
      'kind',
      'name',
    ]) ?? 'unknown';
    const metadata = this.extractMetadata(root, object);
    const providerEventId = this.readString(root, [
      'providerEventId',
      'provider_event_id',
      'eventId',
      'event_id',
      'id',
    ]);
    const paymentId = this.readString(metadata, [
      'paymentId',
      'payment_id',
      'internalPaymentId',
      'internal_payment_id',
    ]) ?? this.readString(object, ['paymentId', 'payment_id']);
    const orderId = this.readString(metadata, [
      'orderId',
      'order_id',
      'internalOrderId',
      'internal_order_id',
    ]) ?? this.readString(object, ['orderId', 'order_id']);
    const providerReference = this.readString(object, [
      'providerReference',
      'provider_reference',
      'paymentIntentId',
      'payment_intent',
      'transactionId',
      'transaction_id',
      'reference',
      'id',
    ]);
    const statusText =
      this.readString(object, ['status', 'paymentStatus', 'payment_status']) ??
      this.readString(root, ['status']);

    return {
      providerEventId,
      eventType,
      paymentId,
      orderId,
      providerReference,
      normalizedStatus: this.normalizePaymentStatus(eventType, statusText),
      normalizedPayloadJson: this.buildNormalizedPayload({
        provider: input.provider,
        eventType,
        providerEventId,
        providerReference,
        paymentId,
        orderId,
        normalizedStatus: this.normalizePaymentStatus(eventType, statusText),
      }),
    };
  }

  normalizeRefundEvent(input: {
    provider: PaymentProvider;
    payload: Prisma.InputJsonValue;
  }): NormalizedRefundProviderEvent {
    const root = this.asRecord(input.payload) ?? {};
    const object = this.extractDataObject(root);
    const eventType = this.readString(root, [
      'eventType',
      'event_type',
      'type',
      'event',
      'kind',
      'name',
    ]) ?? 'unknown';
    const metadata = this.extractMetadata(root, object);
    const providerEventId = this.readString(root, [
      'providerEventId',
      'provider_event_id',
      'eventId',
      'event_id',
      'id',
    ]);
    const refundId = this.readString(metadata, [
      'refundId',
      'refund_id',
      'internalRefundId',
      'internal_refund_id',
    ]) ?? this.readString(object, ['refundId', 'refund_id']);
    const paymentId = this.readString(metadata, [
      'paymentId',
      'payment_id',
      'internalPaymentId',
      'internal_payment_id',
    ]) ?? this.readString(object, ['paymentId', 'payment_id']);
    const orderId = this.readString(metadata, [
      'orderId',
      'order_id',
      'internalOrderId',
      'internal_order_id',
    ]) ?? this.readString(object, ['orderId', 'order_id']);
    const providerReference = this.readString(object, [
      'providerReference',
      'provider_reference',
      'refundId',
      'refund_id',
      'transactionId',
      'transaction_id',
      'reference',
      'id',
    ]);
    const statusText =
      this.readString(object, ['status', 'refundStatus', 'refund_status']) ??
      this.readString(root, ['status']);

    return {
      providerEventId,
      eventType,
      refundId,
      paymentId,
      orderId,
      providerReference,
      normalizedStatus: this.normalizeRefundStatus(eventType, statusText),
      normalizedPayloadJson: this.buildNormalizedPayload({
        provider: input.provider,
        eventType,
        providerEventId,
        providerReference,
        refundId,
        paymentId,
        orderId,
        normalizedStatus: this.normalizeRefundStatus(eventType, statusText),
      }),
    };
  }

  private extractDataObject(root: Record<string, Prisma.JsonValue>): Record<
    string,
    Prisma.JsonValue
  > {
    const data = this.asRecord(root.data);
    const dataObject = this.asRecord(data?.object);
    const object = this.asRecord(root.object);

    return dataObject ?? data ?? object ?? root;
  }

  private extractMetadata(
    root: Record<string, Prisma.JsonValue>,
    object: Record<string, Prisma.JsonValue>,
  ): Record<string, Prisma.JsonValue> {
    return this.asRecord(object.metadata) ?? this.asRecord(root.metadata) ?? {};
  }

  private normalizePaymentStatus(
    eventType: string,
    statusText: string | null,
  ): PaymentStatus | null {
    const combined = `${eventType} ${statusText ?? ''}`.toLowerCase();

    if (this.containsAny(combined, ['succeeded', 'success', 'paid', 'captured', 'completed'])) {
      return PaymentStatus.SUCCEEDED;
    }

    if (this.containsAny(combined, ['failed', 'failure', 'declined', 'error'])) {
      return PaymentStatus.FAILED;
    }

    if (this.containsAny(combined, ['cancelled', 'canceled'])) {
      return PaymentStatus.CANCELLED;
    }

    if (combined.includes('expired')) {
      return PaymentStatus.EXPIRED;
    }

    if (combined.includes('requires_action')) {
      return PaymentStatus.REQUIRES_ACTION;
    }

    if (combined.includes('processing')) {
      return PaymentStatus.PROCESSING;
    }

    if (combined.includes('pending')) {
      return PaymentStatus.PENDING;
    }

    return null;
  }

  private normalizeRefundStatus(
    eventType: string,
    statusText: string | null,
  ): RefundStatus | null {
    const combined = `${eventType} ${statusText ?? ''}`.toLowerCase();

    if (this.containsAny(combined, ['succeeded', 'success', 'completed'])) {
      return RefundStatus.SUCCEEDED;
    }

    if (this.containsAny(combined, ['failed', 'failure', 'declined', 'error'])) {
      return RefundStatus.FAILED;
    }

    if (this.containsAny(combined, ['cancelled', 'canceled'])) {
      return RefundStatus.CANCELLED;
    }

    if (combined.includes('processing')) {
      return RefundStatus.PROCESSING;
    }

    if (combined.includes('pending')) {
      return RefundStatus.PENDING;
    }

    return null;
  }

  private containsAny(value: string, needles: string[]): boolean {
    return needles.some((needle) => value.includes(needle));
  }

  private readString(
    source: Record<string, Prisma.JsonValue>,
    keys: string[],
  ): string | null {
    for (const key of keys) {
      const value = source[key];

      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }

    return null;
  }

  private asRecord(
    value: Prisma.JsonValue | Prisma.InputJsonValue | undefined,
  ): Record<string, Prisma.JsonValue> | null {
    if (value === undefined || value === null || Array.isArray(value)) {
      return null;
    }

    if (typeof value !== 'object') {
      return null;
    }

    return value as Record<string, Prisma.JsonValue>;
  }

  private buildNormalizedPayload(
    value: Record<string, Prisma.JsonValue | Prisma.InputJsonValue>,
  ): Prisma.InputJsonValue {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, entry ?? null]),
    ) as Prisma.InputJsonValue;
  }
}
