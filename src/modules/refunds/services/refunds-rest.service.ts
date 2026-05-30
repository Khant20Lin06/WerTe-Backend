import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { requireCustomerFinanceScope } from '../../payments/policies/finance-access-policy.helper';
import {
  buildRefundDetailEntity,
  RefundDetailEntity,
} from '../entities/refund-detail.entity';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';
import { RefundOperationsService } from './refund-operations.service';
import { RefundsService } from './refunds.service';

@Injectable()
export class RefundsRestService {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly refundOperationsService: RefundOperationsService,
  ) {}

  listCurrentCustomerOrderRefunds(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<RefundSummaryEntity[]> {
    return this.refundsService.listCustomerOrderRefunds(
      orderId,
      requireCustomerFinanceScope(currentUser),
    );
  }

  async getCurrentCustomerOrderRefundDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    refundId: string,
  ): Promise<RefundDetailEntity> {
    const refund = await this.refundsService.findCustomerRefund(
      requireCustomerFinanceScope(currentUser),
      refundId,
    );

    return this.attachAttempts(orderId, refundId, refund);
  }

  listCurrentAdminOrderRefunds(orderId: string): Promise<RefundSummaryEntity[]> {
    return this.refundsService.listOrderRefunds(orderId);
  }

  async getCurrentAdminOrderRefundDetail(
    orderId: string,
    refundId: string,
  ): Promise<RefundDetailEntity> {
    const refund = await this.refundsService.findOrderRefund(orderId, refundId);

    return this.attachAttempts(orderId, refundId, refund);
  }

  requestCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    paymentId: string,
    payload: {
      amount: string;
      idempotencyKey?: string;
      providerReference?: string;
      reasonCode?: string;
      note?: string;
    },
  ) {
    return this.refundOperationsService.requestCurrentAdminRefund(currentUser, {
      paymentId,
      amount: payload.amount,
      idempotencyKey: payload.idempotencyKey,
      providerReference: payload.providerReference,
      reasonCode: payload.reasonCode,
      note: payload.note,
    });
  }

  succeedCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    refundId: string,
    payload: {
      providerReference?: string;
      reasonCode?: string;
      failureCode?: string;
      failureMessage?: string;
      note?: string;
    },
  ) {
    return this.refundOperationsService.succeedCurrentAdminRefund(currentUser, {
      refundId,
      providerReference: payload.providerReference,
      reasonCode: payload.reasonCode,
      failureCode: payload.failureCode,
      failureMessage: payload.failureMessage,
      note: payload.note,
    });
  }

  failCurrentAdminRefund(
    currentUser: AuthenticatedUserEntity,
    refundId: string,
    payload: {
      providerReference?: string;
      reasonCode?: string;
      failureCode?: string;
      failureMessage?: string;
      note?: string;
    },
  ) {
    return this.refundOperationsService.failCurrentAdminRefund(currentUser, {
      refundId,
      providerReference: payload.providerReference,
      reasonCode: payload.reasonCode,
      failureCode: payload.failureCode,
      failureMessage: payload.failureMessage,
      note: payload.note,
    });
  }

  private async attachAttempts(
    orderId: string,
    refundId: string,
    refund: RefundSummaryEntity | null,
  ): Promise<RefundDetailEntity> {
    if (refund === null || refund.order.orderId !== orderId) {
      throw new AppException('Refund was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const attempts = await this.refundsService.listRefundAttempts(refundId);

    return buildRefundDetailEntity(refund, attempts);
  }
}
