import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  buildPaymentDetailEntity,
  PaymentDetailEntity,
} from '../entities/payment-detail.entity';
import { PaymentSummaryEntity } from '../entities/payment-summary.entity';
import { requireCustomerFinanceScope } from '../policies/finance-access-policy.helper';
import { PaymentLifecycleService } from './payment-lifecycle.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsRestService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentLifecycleService: PaymentLifecycleService,
  ) {}

  listCurrentCustomerOrderPayments(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<PaymentSummaryEntity[]> {
    return this.paymentsService.listCustomerOrderPayments(
      orderId,
      requireCustomerFinanceScope(currentUser),
    );
  }

  async getCurrentCustomerOrderPaymentDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    paymentId: string,
  ): Promise<PaymentDetailEntity> {
    const payment = await this.paymentsService.findCustomerPayment(
      requireCustomerFinanceScope(currentUser),
      paymentId,
    );

    return this.attachAttempts(orderId, paymentId, payment);
  }

  listCurrentAdminOrderPayments(orderId: string): Promise<PaymentSummaryEntity[]> {
    return this.paymentsService.listOrderPayments(orderId);
  }

  async getCurrentAdminOrderPaymentDetail(
    orderId: string,
    paymentId: string,
  ): Promise<PaymentDetailEntity> {
    const payment = await this.paymentsService.findOrderPayment(orderId, paymentId);

    return this.attachAttempts(orderId, paymentId, payment);
  }

  confirmCurrentAdminPayment(
    currentUser: AuthenticatedUserEntity,
    paymentId: string,
    payload: {
      providerReference?: string | null;
      providerReceiptId?: string | null;
      reasonCode?: string | null;
      note?: string | null;
    },
  ) {
    return this.paymentLifecycleService.confirmCurrentPayment(currentUser, {
      paymentId,
      providerReference: payload.providerReference,
      providerReceiptId: payload.providerReceiptId,
      reasonCode: payload.reasonCode,
      note: payload.note,
    });
  }

  failCurrentAdminPayment(
    currentUser: AuthenticatedUserEntity,
    paymentId: string,
    payload: {
      providerReference?: string | null;
      reasonCode?: string | null;
      failureCode?: string | null;
      failureMessage?: string | null;
      note?: string | null;
    },
  ) {
    return this.paymentLifecycleService.failCurrentPayment(currentUser, {
      paymentId,
      providerReference: payload.providerReference,
      reasonCode: payload.reasonCode,
      failureCode: payload.failureCode,
      failureMessage: payload.failureMessage,
      note: payload.note,
    });
  }

  cancelCurrentAdminPayment(
    currentUser: AuthenticatedUserEntity,
    paymentId: string,
    payload: {
      providerReference?: string | null;
      reasonCode?: string | null;
      note?: string | null;
    },
  ) {
    return this.paymentLifecycleService.cancelCurrentPayment(currentUser, {
      paymentId,
      providerReference: payload.providerReference,
      reasonCode: payload.reasonCode,
      note: payload.note,
    });
  }

  private async attachAttempts(
    orderId: string,
    paymentId: string,
    payment: PaymentSummaryEntity | null,
  ): Promise<PaymentDetailEntity> {
    if (payment === null || payment.order.orderId !== orderId) {
      throw new AppException('Payment was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const attempts = await this.paymentsService.listPaymentAttempts(paymentId);

    return buildPaymentDetailEntity(payment, attempts);
  }
}
