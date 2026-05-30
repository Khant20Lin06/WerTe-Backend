import { UserRole, UserStatus } from '@prisma/client';

import { AdminRefundsController } from '../../../../src/modules/refunds/controllers/admin-refunds.controller';
import { RefundsRestService } from '../../../../src/modules/refunds/services/refunds-rest.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { makeRefundSummary } from './helpers/refund.fixture';

describe('AdminRefundsController', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_admin_1',
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('delegates admin refund requests to the REST service', async () => {
    const refundsRestService = {
      requestCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new AdminRefundsController(refundsRestService);

    const result = await controller.request(currentUser, 'payment_1', {
      amount: '1500',
      idempotencyKey: 'refund-idem-1',
      providerReference: 'refund_ref_1',
      reasonCode: 'customer_support',
      note: 'Goodwill refund',
    });

    expect(refundsRestService.requestCurrentAdminRefund).toHaveBeenCalledWith(
      currentUser,
      'payment_1',
      {
        amount: '1500',
        idempotencyKey: 'refund-idem-1',
        providerReference: 'refund_ref_1',
        reasonCode: 'customer_support',
        note: 'Goodwill refund',
      },
    );
    expect(result).toMatchObject({
      refundId: 'refund_1',
      paymentId: 'payment_1',
    });
  });

  it('delegates refund success and failure finalization to the REST service', async () => {
    const refundsRestService = {
      succeedCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
      failCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new AdminRefundsController(refundsRestService);

    await controller.succeed(currentUser, 'refund_1', {
      providerReference: 'refund_ref_1',
      reasonCode: 'refund_succeeded',
      note: 'Provider completed the refund.',
    });
    await controller.fail(currentUser, 'refund_1', {
      providerReference: 'refund_ref_1',
      reasonCode: 'refund_failed',
      failureCode: 'provider_timeout',
      failureMessage: 'Timeout',
      note: 'Retry later.',
    });

    expect(refundsRestService.succeedCurrentAdminRefund).toHaveBeenCalledWith(
      currentUser,
      'refund_1',
      expect.objectContaining({
        reasonCode: 'refund_succeeded',
      }),
    );
    expect(refundsRestService.failCurrentAdminRefund).toHaveBeenCalledWith(
      currentUser,
      'refund_1',
      expect.objectContaining({
        failureCode: 'provider_timeout',
      }),
    );
  });
});
