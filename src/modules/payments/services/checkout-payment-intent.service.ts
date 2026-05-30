import { HttpStatus, Injectable } from '@nestjs/common';
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  buildCheckoutPaymentIntentEntity,
  CheckoutPaymentIntentEntity,
} from '../entities/checkout-payment-intent.entity';
import { PaymentsRepository } from '../repositories/payments.repository';

type PaymentDatabaseClient = Prisma.TransactionClient | undefined;

export type CreateCheckoutPaymentIntentInput = {
  orderId: string;
  orderCode: string;
  customerProfileId: string;
  amount: Prisma.Decimal;
  currencyCode: string;
  idempotencyKey: string;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
};

type ResolvedCheckoutPaymentProfile = {
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  requiresActionAt: Date | null;
};

@Injectable()
export class CheckoutPaymentIntentService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async findByIdempotencyKey(
    idempotencyKey: string,
    client?: PaymentDatabaseClient,
  ): Promise<CheckoutPaymentIntentEntity | null> {
    const payment = await this.paymentsRepository.findCheckoutPaymentIntentByIdempotencyKey(
      idempotencyKey,
      client,
    );

    return payment === null ? null : buildCheckoutPaymentIntentEntity(payment);
  }

  async createCheckoutPaymentIntent(
    input: CreateCheckoutPaymentIntentInput,
    client?: PaymentDatabaseClient,
  ): Promise<CheckoutPaymentIntentEntity> {
    const profile = this.resolvePaymentProfile(
      input.paymentMethod,
      input.paymentProvider,
    );
    const payment = await this.paymentsRepository.createCheckoutPaymentIntent(
      {
        orderId: input.orderId,
        customerProfileId: input.customerProfileId,
        method: profile.method,
        provider: profile.provider,
        status: profile.status,
        amount: input.amount,
        currencyCode: input.currencyCode,
        idempotencyKey: input.idempotencyKey,
        requiresActionAt: profile.requiresActionAt,
        metadataJson: {
          initiatedFrom: 'checkout',
          orderCode: input.orderCode,
        },
        requestPayloadJson: {
          initiatedFrom: 'checkout',
          orderCode: input.orderCode,
          method: profile.method,
          provider: profile.provider,
          amount: input.amount.toString(),
          currencyCode: input.currencyCode,
        },
        responsePayloadJson:
          profile.status === PaymentStatus.REQUIRES_ACTION
            ? {
                nextAction: 'provider_confirmation_pending',
              }
            : {
                nextAction: 'await_collection',
              },
      },
      client,
    );

    return buildCheckoutPaymentIntentEntity(payment);
  }

  private resolvePaymentProfile(
    paymentMethod?: PaymentMethod,
    paymentProvider?: PaymentProvider,
  ): ResolvedCheckoutPaymentProfile {
    const method = paymentMethod ?? PaymentMethod.CASH_ON_DELIVERY;

    switch (method) {
      case PaymentMethod.CASH_ON_DELIVERY:
        if (
          paymentProvider !== undefined &&
          paymentProvider !== PaymentProvider.COD
        ) {
          throw new AppException(
            'Cash on delivery checkouts must use the COD payment provider.',
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              code: ErrorCodes.unprocessableEntity,
            },
          );
        }

        return {
          method,
          provider: PaymentProvider.COD,
          status: PaymentStatus.PENDING,
          requiresActionAt: null,
        };

      case PaymentMethod.MANUAL:
        if (
          paymentProvider !== undefined &&
          paymentProvider !== PaymentProvider.MANUAL
        ) {
          throw new AppException(
            'Manual payments must use the MANUAL payment provider.',
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              code: ErrorCodes.unprocessableEntity,
            },
          );
        }

        return {
          method,
          provider: PaymentProvider.MANUAL,
          status: PaymentStatus.PENDING,
          requiresActionAt: null,
        };

      case PaymentMethod.CARD:
      case PaymentMethod.DIGITAL_WALLET:
      case PaymentMethod.BANK_TRANSFER: {
        if (paymentProvider === PaymentProvider.COD) {
          throw new AppException(
            'Non-cash checkout payments cannot use the COD provider.',
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              code: ErrorCodes.unprocessableEntity,
            },
          );
        }

        return {
          method,
          provider: paymentProvider ?? PaymentProvider.MANUAL,
          status: PaymentStatus.REQUIRES_ACTION,
          requiresActionAt: new Date(),
        };
      }
    }
  }
}
