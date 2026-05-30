import { UserRole, UserStatus } from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { PaymentLifecycleService } from '../../../../src/modules/payments/services/payment-lifecycle.service';
import { PaymentsRestService } from '../../../../src/modules/payments/services/payments-rest.service';
import { PaymentsService } from '../../../../src/modules/payments/services/payments.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makePaymentAttempt,
  makePaymentSummary,
} from './helpers/payment.fixture';

describe('PaymentsRestService', () => {
  const customerUser = makeAuthenticatedUser({
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });
  const adminUser = makeAuthenticatedUser({
    userId: 'usr_admin_1',
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('lists current customer order payments inside the customer scope', async () => {
    const paymentsService = {
      listCustomerOrderPayments: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<PaymentsService>;
    const service = new PaymentsRestService(
      paymentsService,
      {} as PaymentLifecycleService,
    );

    await service.listCurrentCustomerOrderPayments(customerUser, 'order_1');

    expect(paymentsService.listCustomerOrderPayments).toHaveBeenCalledWith(
      'order_1',
      'cust_prof_1',
    );
  });

  it('builds a payment detail view by attaching attempts for the customer scope', async () => {
    const paymentsService = {
      findCustomerPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
      listPaymentAttempts: jest.fn().mockResolvedValue([makePaymentAttempt()]),
    } as unknown as jest.Mocked<PaymentsService>;
    const service = new PaymentsRestService(
      paymentsService,
      {} as PaymentLifecycleService,
    );

    const result = await service.getCurrentCustomerOrderPaymentDetail(
      customerUser,
      'order_1',
      'payment_1',
    );

    expect(paymentsService.findCustomerPayment).toHaveBeenCalledWith(
      'cust_prof_1',
      'payment_1',
    );
    expect(paymentsService.listPaymentAttempts).toHaveBeenCalledWith('payment_1');
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
    });
  });

  it('throws when the authenticated actor does not carry a customer profile scope', async () => {
    const service = new PaymentsRestService(
      {} as PaymentsService,
      {} as PaymentLifecycleService,
    );

    expect(() =>
      service.listCurrentCustomerOrderPayments(
        makeAuthenticatedUser(),
        'order_1',
      ),
    ).toThrow(AppException);
  });

  it('throws when the payment does not belong to the requested order', async () => {
    const paymentsService = {
      findOrderPayment: jest
        .fn()
        .mockResolvedValue(
          makePaymentSummary({
            order: {
              ...makePaymentSummary().order,
              orderId: 'order_other',
            },
          }),
        ),
    } as unknown as jest.Mocked<PaymentsService>;
    const service = new PaymentsRestService(
      paymentsService,
      {} as PaymentLifecycleService,
    );

    await expect(
      service.getCurrentAdminOrderPaymentDetail('order_1', 'payment_1'),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('delegates admin payment confirmation to the lifecycle service', async () => {
    const paymentLifecycleService = {
      confirmCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
    } as unknown as jest.Mocked<PaymentLifecycleService>;
    const service = new PaymentsRestService(
      {} as PaymentsService,
      paymentLifecycleService,
    );

    await service.confirmCurrentAdminPayment(adminUser, 'payment_1', {
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
      reasonCode: 'payment_succeeded',
      note: 'Confirmed by admin.',
    });

    expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalledWith(
      adminUser,
      {
        paymentId: 'payment_1',
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        reasonCode: 'payment_succeeded',
        note: 'Confirmed by admin.',
      },
    );
  });

  it('delegates admin payment failure and cancellation to the lifecycle service', async () => {
    const paymentLifecycleService = {
      failCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
      cancelCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
    } as unknown as jest.Mocked<PaymentLifecycleService>;
    const service = new PaymentsRestService(
      {} as PaymentsService,
      paymentLifecycleService,
    );

    await service.failCurrentAdminPayment(adminUser, 'payment_1', {
      providerReference: 'pi_123',
      reasonCode: 'provider_declined',
      failureCode: 'provider_declined',
      failureMessage: 'Card declined',
      note: 'Customer should retry.',
    });
    await service.cancelCurrentAdminPayment(adminUser, 'payment_1', {
      providerReference: 'pi_123',
      reasonCode: 'payment_cancelled',
      note: 'Cancelled by support.',
    });

    expect(paymentLifecycleService.failCurrentPayment).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        paymentId: 'payment_1',
        failureCode: 'provider_declined',
      }),
    );
    expect(paymentLifecycleService.cancelCurrentPayment).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        paymentId: 'payment_1',
        reasonCode: 'payment_cancelled',
      }),
    );
  });
});
