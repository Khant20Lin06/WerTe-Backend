import { AdminOrderPaymentsController } from '../../../../src/modules/payments/controllers/admin-order-payments.controller';
import { PaymentsRestService } from '../../../../src/modules/payments/services/payments-rest.service';
import {
  makePaymentDetail,
  makePaymentSummary,
} from './helpers/payment.fixture';

describe('AdminOrderPaymentsController', () => {
  it('delegates admin order payment listing to the REST service', async () => {
    const paymentsRestService = {
      listCurrentAdminOrderPayments: jest
        .fn()
        .mockResolvedValue([makePaymentSummary()]),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new AdminOrderPaymentsController(paymentsRestService);

    const result = await controller.list('order_1');

    expect(
      paymentsRestService.listCurrentAdminOrderPayments,
    ).toHaveBeenCalledWith('order_1');
    expect(result[0]).toMatchObject({
      paymentId: 'payment_1',
    });
  });

  it('delegates admin order payment detail lookup to the REST service', async () => {
    const paymentsRestService = {
      getCurrentAdminOrderPaymentDetail: jest
        .fn()
        .mockResolvedValue(makePaymentDetail()),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new AdminOrderPaymentsController(paymentsRestService);

    const result = await controller.detail('order_1', 'payment_1');

    expect(
      paymentsRestService.getCurrentAdminOrderPaymentDetail,
    ).toHaveBeenCalledWith('order_1', 'payment_1');
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
    });
  });
});
