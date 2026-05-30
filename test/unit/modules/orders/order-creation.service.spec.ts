import {
  PaymentMethod,
  PaymentProvider,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { CheckoutSubmissionService } from '../../../../src/modules/checkout/services/checkout-submission.service';
import { CreateOrderDto } from '../../../../src/modules/orders/dto/create-order.dto';
import { OrderCreationService } from '../../../../src/modules/orders/services/order-creation.service';

describe('OrderCreationService', () => {
  it('delegates customer order creation to the checkout submission core', async () => {
    const currentUser: AuthenticatedUserEntity = {
      userId: 'usr_1',
      sessionId: 'session_1',
      role: UserRole.CUSTOMER,
      tokenType: 'access',
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    };
    const dto: CreateOrderDto = {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'checkout-usr_1-001',
      paymentMethod: PaymentMethod.CARD,
      paymentProvider: PaymentProvider.STRIPE,
    };
    const checkoutSubmissionService = {
      submitCurrentCustomerCheckout: jest.fn().mockResolvedValue({
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
      }),
    } as unknown as jest.Mocked<CheckoutSubmissionService>;
    const service = new OrderCreationService(checkoutSubmissionService);

    await expect(service.create(currentUser, dto)).resolves.toMatchObject({
      orderId: 'order_1',
      orderCode: 'ORD-00000001',
    });

    expect(
      checkoutSubmissionService.submitCurrentCustomerCheckout,
    ).toHaveBeenCalledWith(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'checkout-usr_1-001',
      paymentMethod: PaymentMethod.CARD,
      paymentProvider: PaymentProvider.STRIPE,
    });
  });
});
