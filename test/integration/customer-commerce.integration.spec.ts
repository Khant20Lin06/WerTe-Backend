import { UserRole } from '@prisma/client';

import { AuthRepository } from '../../src/modules/auth/repositories/auth.repository';
import { CheckoutPreviewService } from '../../src/modules/checkout/services/checkout-preview.service';
import { CustomerCartService } from '../../src/modules/carts/services/customer-cart.service';
import { OrderCreationService } from '../../src/modules/orders/services/order-creation.service';
import { UsersService } from '../../src/modules/users/services/users.service';
import { createAuthSessionHarness } from './helpers/create-auth-session-harness';
import {
  createCartAggregateEntity,
  createCheckoutPreviewEntity,
  createCheckoutSubmissionEntity,
} from './helpers/critical-flow.fixtures';
import { createIntegrationApp } from './helpers/create-integration-app';

describe('Customer commerce integration', () => {
  it('serves customer cart, checkout preview, and order creation through authenticated routes', async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'customer',
        userId: 'usr_customer_1',
        role: UserRole.CUSTOMER,
        phone: '09123456789',
        sessionId: 'sess_customer_1',
        customerProfileId: 'cust_prof_1',
      },
      {
        key: 'merchant',
        userId: 'usr_merchant_1',
        role: UserRole.MERCHANT,
        phone: '0991111111',
        sessionId: 'sess_merchant_1',
        merchantId: 'merchant_1',
      },
    ] as const);
    const customerCartService = {
      getCurrentCustomerCart: jest
        .fn()
        .mockResolvedValue(createCartAggregateEntity()),
    };
    const checkoutPreviewService = {
      previewCurrentCustomerCheckout: jest
        .fn()
        .mockResolvedValue(createCheckoutPreviewEntity()),
    };
    const orderCreationService = {
      create: jest.fn().mockResolvedValue(createCheckoutSubmissionEntity()),
    };
    const harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
        { provide: CustomerCartService, useValue: customerCartService },
        { provide: CheckoutPreviewService, useValue: checkoutPreviewService },
        { provide: OrderCreationService, useValue: orderCreationService },
      ],
    });

    try {
      const customerClient = harness.client.withBearerToken(
        auth.actors.customer.accessToken,
      );
      const merchantClient = harness.client.withBearerToken(
        auth.actors.merchant.accessToken,
      );

      const cartResponse = await customerClient.get(
        '/api/v1/customer/cart?branchId=branch_1',
      );
      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body).toMatchObject({
        success: true,
        data: {
          cartId: 'cart_1',
          branchId: 'branch_1',
          totalAmount: '6500',
        },
      });
      expect(customerCartService.getCurrentCustomerCart).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_customer_1',
          role: UserRole.CUSTOMER,
        }),
        'branch_1',
      );

      const forbiddenCartResponse = await merchantClient.get(
        '/api/v1/customer/cart?branchId=branch_1',
      );
      expect(forbiddenCartResponse.status).toBe(403);
      expect(forbiddenCartResponse.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
        },
      });

      const previewResponse = await customerClient.post(
        '/api/v1/customer/checkout/preview',
        {
          body: {
            branchId: 'branch_1',
            addressId: 'addr_1',
          },
        },
      );
      expect(previewResponse.status).toBe(201);
      expect(previewResponse.body).toMatchObject({
        success: true,
        data: {
          currencyCode: 'MMK',
          branch: {
            branchId: 'branch_1',
          },
          pricing: {
            totalAmount: '7000',
          },
        },
      });
      expect(
        checkoutPreviewService.previewCurrentCustomerCheckout,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_customer_1',
          role: UserRole.CUSTOMER,
        }),
        expect.objectContaining({
          branchId: 'branch_1',
          addressId: 'addr_1',
        }),
      );

      const orderResponse = await customerClient.post('/api/v1/customer/orders', {
        body: {
          branchId: 'branch_1',
          addressId: 'addr_1',
          idempotencyKey: 'checkout-001',
        },
      });
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body).toMatchObject({
        success: true,
        data: {
          orderId: 'order_1',
          orderCode: 'ORD-00000001',
          status: 'PLACED',
        },
      });
      expect(orderCreationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_customer_1',
          role: UserRole.CUSTOMER,
        }),
        expect.objectContaining({
          branchId: 'branch_1',
          addressId: 'addr_1',
          idempotencyKey: 'checkout-001',
        }),
      );
    } finally {
      await harness.close();
    }
  });
});
