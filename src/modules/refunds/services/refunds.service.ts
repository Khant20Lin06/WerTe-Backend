import { Injectable } from '@nestjs/common';

import {
  buildRefundAttemptEntity,
  RefundAttemptEntity,
} from '../entities/refund-attempt.entity';
import {
  buildRefundSummaryEntity,
  RefundSummaryEntity,
} from '../entities/refund-summary.entity';
import { RefundsRepository } from '../repositories/refunds.repository';

@Injectable()
export class RefundsService {
  constructor(private readonly refundsRepository: RefundsRepository) {}

  async findRefundById(refundId: string): Promise<RefundSummaryEntity | null> {
    const refund = await this.refundsRepository.findById(refundId);

    return refund === null ? null : buildRefundSummaryEntity(refund);
  }

  async findOrderRefund(
    orderId: string,
    refundId: string,
  ): Promise<RefundSummaryEntity | null> {
    const refund = await this.refundsRepository.findOrderRefund(
      orderId,
      refundId,
    );

    return refund === null ? null : buildRefundSummaryEntity(refund);
  }

  async findCustomerRefund(
    customerProfileId: string,
    refundId: string,
  ): Promise<RefundSummaryEntity | null> {
    const refund = await this.refundsRepository.findCustomerRefund(
      customerProfileId,
      refundId,
    );

    return refund === null ? null : buildRefundSummaryEntity(refund);
  }

  async listOrderRefunds(orderId: string): Promise<RefundSummaryEntity[]> {
    const refunds = await this.refundsRepository.findOrderRefunds(orderId);

    return refunds.map((refund) => buildRefundSummaryEntity(refund));
  }

  async listCustomerOrderRefunds(
    orderId: string,
    customerProfileId: string,
  ): Promise<RefundSummaryEntity[]> {
    const refunds = await this.refundsRepository.findCustomerOrderRefunds(
      orderId,
      customerProfileId,
    );

    return refunds.map((refund) => buildRefundSummaryEntity(refund));
  }

  async listPaymentRefunds(paymentId: string): Promise<RefundSummaryEntity[]> {
    const refunds = await this.refundsRepository.findPaymentRefunds(paymentId);

    return refunds.map((refund) => buildRefundSummaryEntity(refund));
  }

  async listRefundAttempts(refundId: string): Promise<RefundAttemptEntity[]> {
    const attempts = await this.refundsRepository.findRefundAttempts(refundId);

    return attempts.map((attempt) => buildRefundAttemptEntity(attempt));
  }
}
