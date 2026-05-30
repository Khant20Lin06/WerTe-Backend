import { UserRole, UserStatus } from '@prisma/client';

import { AdminPaymentsController } from '../../../../src/modules/payments/controllers/admin-payments.controller';
import { PaymentsRestService } from '../../../../src/modules/payments/services/payments-rest.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { makePaymentSummary } from './helpers/payment.fixture';

describe('AdminPaymentsController', () => {
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

  it('delegates admin payment confirmation to the REST service', async () => {
    const paymentsRestService = {
      confirmCurrentAdminPayment: jest
        .fn()
        .mockResolvedValue(makePaymentSummary()),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new AdminPaymentsController(paymentsRestService);

    const result = await controller.confirm(currentUser, 'payment_1', {
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
      reasonCode: 'payment_succeeded',
      note: 'Confirmed by finance.',
    });

    expect(paymentsRestService.confirmCurrentAdminPayment).toHaveBeenCalledWith(
      currentUser,
      'payment_1',
      {
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        reasonCode: 'payment_succeeded',
        note: 'Confirmed by finance.',
      },
    );
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      providerReceiptId: 'receipt_123',
    });
  });

  it('delegates admin payment failure and cancellation to the REST service', async () => {
    const paymentsRestService = {
      failCurrentAdminPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
      cancelCurrentAdminPayment: jest
        .fn()
        .mockResolvedValue(makePaymentSummary()),
    } as unknown as jest.Mocked<PaymentsRestService>;
    const controller = new AdminPaymentsController(paymentsRestService);

    await controller.fail(currentUser, 'payment_1', {
      providerReference: 'pi_123',
      reasonCode: 'provider_declined',
      failureCode: 'provider_declined',
      failureMessage: 'Card declined',
      note: 'Retry required.',
    });
    await controller.cancel(currentUser, 'payment_1', {
      providerReference: 'pi_123',
      reasonCode: 'payment_cancelled',
      note: 'Cancelled by support.',
    });

    expect(paymentsRestService.failCurrentAdminPayment).toHaveBeenCalledWith(
      currentUser,
      'payment_1',
      expect.objectContaining({
        failureCode: 'provider_declined',
      }),
    );
    expect(paymentsRestService.cancelCurrentAdminPayment).toHaveBeenCalledWith(
      currentUser,
      'payment_1',
      expect.objectContaining({
        reasonCode: 'payment_cancelled',
      }),
    );
  });
});
