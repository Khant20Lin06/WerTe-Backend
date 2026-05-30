import { UserRole, UserStatus } from '@prisma/client';

import { CustomerRefundsController } from '../../../../src/modules/refunds/controllers/customer-refunds.controller';
import { RefundsRestService } from '../../../../src/modules/refunds/services/refunds-rest.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { makeRefundDetail, makeRefundSummary } from './helpers/refund.fixture';

describe('CustomerRefundsController', () => {
  const currentUser = makeAuthenticatedUser({
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });

  it('delegates customer refund listing to the REST service', async () => {
    const refundsRestService = {
      listCurrentCustomerOrderRefunds: jest
        .fn()
        .mockResolvedValue([makeRefundSummary()]),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new CustomerRefundsController(refundsRestService);

    const result = await controller.list(currentUser, 'order_1');

    expect(refundsRestService.listCurrentCustomerOrderRefunds).toHaveBeenCalledWith(
      currentUser,
      'order_1',
    );
    expect(result[0]).toMatchObject({
      refundId: 'refund_1',
      paymentId: 'payment_1',
    });
  });

  it('delegates customer refund detail lookups to the REST service', async () => {
    const refundsRestService = {
      getCurrentCustomerOrderRefundDetail: jest
        .fn()
        .mockResolvedValue(makeRefundDetail()),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new CustomerRefundsController(refundsRestService);

    const result = await controller.detail(currentUser, 'order_1', 'refund_1');

    expect(
      refundsRestService.getCurrentCustomerOrderRefundDetail,
    ).toHaveBeenCalledWith(currentUser, 'order_1', 'refund_1');
    expect(result).toMatchObject({
      refundId: 'refund_1',
      attempts: [{ refundAttemptId: 'refund_attempt_1' }],
    });
  });
});
