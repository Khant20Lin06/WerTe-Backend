import { Injectable } from '@nestjs/common';

import {
  buildPaymentAttemptEntity,
  PaymentAttemptEntity,
} from '../entities/payment-attempt.entity';
import {
  buildPaymentSummaryEntity,
  PaymentSummaryEntity,
} from '../entities/payment-summary.entity';
import { PaymentsRepository } from '../repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async findPaymentById(paymentId: string): Promise<PaymentSummaryEntity | null> {
    const payment = await this.paymentsRepository.findById(paymentId);

    return payment === null ? null : buildPaymentSummaryEntity(payment);
  }

  async findOrderPayment(
    orderId: string,
    paymentId: string,
  ): Promise<PaymentSummaryEntity | null> {
    const payment = await this.paymentsRepository.findOrderPayment(
      orderId,
      paymentId,
    );

    return payment === null ? null : buildPaymentSummaryEntity(payment);
  }

  async findCustomerPayment(
    customerProfileId: string,
    paymentId: string,
  ): Promise<PaymentSummaryEntity | null> {
    const payment = await this.paymentsRepository.findCustomerPayment(
      customerProfileId,
      paymentId,
    );

    return payment === null ? null : buildPaymentSummaryEntity(payment);
  }

  async listOrderPayments(orderId: string): Promise<PaymentSummaryEntity[]> {
    const payments = await this.paymentsRepository.findOrderPayments(orderId);

    return payments.map((payment) => buildPaymentSummaryEntity(payment));
  }

  async listCustomerOrderPayments(
    orderId: string,
    customerProfileId: string,
  ): Promise<PaymentSummaryEntity[]> {
    const payments = await this.paymentsRepository.findCustomerOrderPayments(
      orderId,
      customerProfileId,
    );

    return payments.map((payment) => buildPaymentSummaryEntity(payment));
  }

  async findLatestOrderPayment(
    orderId: string,
  ): Promise<PaymentSummaryEntity | null> {
    const payment = await this.paymentsRepository.findLatestOrderPayment(orderId);

    return payment === null ? null : buildPaymentSummaryEntity(payment);
  }

  async listPaymentAttempts(paymentId: string): Promise<PaymentAttemptEntity[]> {
    const attempts = await this.paymentsRepository.findPaymentAttempts(paymentId);

    return attempts.map((attempt) => buildPaymentAttemptEntity(attempt));
  }
}
