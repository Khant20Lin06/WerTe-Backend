import { AdminOrderRefundsController } from '../../../../src/modules/refunds/controllers/admin-order-refunds.controller';
import { RefundsRestService } from '../../../../src/modules/refunds/services/refunds-rest.service';
import { makeRefundDetail, makeRefundSummary } from './helpers/refund.fixture';

describe('AdminOrderRefundsController', () => {
  it('delegates admin order refund listing to the REST service', async () => {
    const refundsRestService = {
      listCurrentAdminOrderRefunds: jest
        .fn()
        .mockResolvedValue([makeRefundSummary()]),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new AdminOrderRefundsController(refundsRestService);

    const result = await controller.list('order_1');

    expect(refundsRestService.listCurrentAdminOrderRefunds).toHaveBeenCalledWith(
      'order_1',
    );
    expect(result[0]).toMatchObject({
      refundId: 'refund_1',
    });
  });

  it('delegates admin order refund detail lookups to the REST service', async () => {
    const refundsRestService = {
      getCurrentAdminOrderRefundDetail: jest
        .fn()
        .mockResolvedValue(makeRefundDetail()),
    } as unknown as jest.Mocked<RefundsRestService>;
    const controller = new AdminOrderRefundsController(refundsRestService);

    const result = await controller.detail('order_1', 'refund_1');

    expect(refundsRestService.getCurrentAdminOrderRefundDetail).toHaveBeenCalledWith(
      'order_1',
      'refund_1',
    );
    expect(result).toMatchObject({
      refundId: 'refund_1',
      attempts: [{ refundAttemptId: 'refund_attempt_1' }],
    });
  });
});
