import { UserRole, UserStatus } from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { RefundOperationsService } from '../../../../src/modules/refunds/services/refund-operations.service';
import { RefundsRestService } from '../../../../src/modules/refunds/services/refunds-rest.service';
import { RefundsService } from '../../../../src/modules/refunds/services/refunds.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { makeRefundAttempt, makeRefundSummary } from './helpers/refund.fixture';

describe('RefundsRestService', () => {
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

  it('lists current customer order refunds inside the customer scope', async () => {
    const refundsService = {
      listCustomerOrderRefunds: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<RefundsService>;
    const service = new RefundsRestService(
      refundsService,
      {} as RefundOperationsService,
    );

    await service.listCurrentCustomerOrderRefunds(customerUser, 'order_1');

    expect(refundsService.listCustomerOrderRefunds).toHaveBeenCalledWith(
      'order_1',
      'cust_prof_1',
    );
  });

  it('builds a refund detail view by attaching attempts for the customer scope', async () => {
    const refundsService = {
      findCustomerRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
      listRefundAttempts: jest.fn().mockResolvedValue([makeRefundAttempt()]),
    } as unknown as jest.Mocked<RefundsService>;
    const service = new RefundsRestService(
      refundsService,
      {} as RefundOperationsService,
    );

    const result = await service.getCurrentCustomerOrderRefundDetail(
      customerUser,
      'order_1',
      'refund_1',
    );

    expect(refundsService.findCustomerRefund).toHaveBeenCalledWith(
      'cust_prof_1',
      'refund_1',
    );
    expect(refundsService.listRefundAttempts).toHaveBeenCalledWith('refund_1');
    expect(result).toMatchObject({
      refundId: 'refund_1',
      attempts: [{ refundAttemptId: 'refund_attempt_1' }],
    });
  });

  it('throws when the authenticated actor does not carry a customer profile scope', async () => {
    const service = new RefundsRestService(
      {} as RefundsService,
      {} as RefundOperationsService,
    );

    expect(() =>
      service.listCurrentCustomerOrderRefunds(makeAuthenticatedUser(), 'order_1'),
    ).toThrow(AppException);
  });

  it('throws when the refund does not belong to the requested order', async () => {
    const refundsService = {
      findOrderRefund: jest
        .fn()
        .mockResolvedValue(
          makeRefundSummary({
            order: {
              ...makeRefundSummary().order,
              orderId: 'order_other',
            },
          }),
        ),
    } as unknown as jest.Mocked<RefundsService>;
    const service = new RefundsRestService(
      refundsService,
      {} as RefundOperationsService,
    );

    await expect(
      service.getCurrentAdminOrderRefundDetail('order_1', 'refund_1'),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('delegates admin refund request and finalization to the operations service', async () => {
    const refundOperationsService = {
      requestCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
      succeedCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
      failCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
    } as unknown as jest.Mocked<RefundOperationsService>;
    const service = new RefundsRestService(
      {} as RefundsService,
      refundOperationsService,
    );

    await service.requestCurrentAdminRefund(adminUser, 'payment_1', {
      amount: '1500',
      idempotencyKey: 'refund-idem-1',
      providerReference: 'refund_ref_1',
      reasonCode: 'customer_support',
      note: 'Goodwill refund',
    });
    await service.succeedCurrentAdminRefund(adminUser, 'refund_1', {
      providerReference: 'refund_ref_1',
      reasonCode: 'refund_succeeded',
      note: 'Provider completed the refund.',
    });
    await service.failCurrentAdminRefund(adminUser, 'refund_1', {
      providerReference: 'refund_ref_1',
      reasonCode: 'refund_failed',
      failureCode: 'provider_timeout',
      failureMessage: 'Timeout',
      note: 'Retry later.',
    });

    expect(refundOperationsService.requestCurrentAdminRefund).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        paymentId: 'payment_1',
        amount: '1500',
      }),
    );
    expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        refundId: 'refund_1',
      }),
    );
    expect(refundOperationsService.failCurrentAdminRefund).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        refundId: 'refund_1',
        failureCode: 'provider_timeout',
      }),
    );
  });
});
