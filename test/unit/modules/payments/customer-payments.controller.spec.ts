import { UserRole, UserStatus } from '@prisma/client';

import { CustomerPaymentsController } from '../../../../src/modules/payments/controllers/customer-payments.controller';
import { PaymentsRestService } from '../../../../src/modules/payments/services/payments-rest.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makePaymentDetail,
  makePaymentSummary,
} from './helpers/payment.fixture';

describe('CustomerPaymentsController', () => {
  const currentUser = makeAuthenticatedUser({
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });

  it('delegates customer payment listing to the REST service', async () => {
    const paymentsRestService = {
      listCurrentCustomerOrderPayments: jest
        .fn()
        .mockResolvedValue([makePaymentSummary()]),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new CustomerPaymentsController(paymentsRestService);

    const result = await controller.list(currentUser, 'order_1');

    expect(
      paymentsRestService.listCurrentCustomerOrderPayments,
    ).toHaveBeenCalledWith(currentUser, 'order_1');
    expect(result[0]).toMatchObject({
      paymentId: 'payment_1',
      refunds: [{ refundId: 'refund_1' }],
    });
  });

  it('delegates customer payment detail lookups to the REST service', async () => {
    const paymentsRestService = {
      getCurrentCustomerOrderPaymentDetail: jest
        .fn()
        .mockResolvedValue(makePaymentDetail()),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new CustomerPaymentsController(paymentsRestService);

    const result = await controller.detail(currentUser, 'order_1', 'payment_1');

    expect(
      paymentsRestService.getCurrentCustomerOrderPaymentDetail,
    ).toHaveBeenCalledWith(currentUser, 'order_1', 'payment_1');
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
    });
  });
});
