import { UserRole } from '@prisma/client';

import { AuthRepository } from '../../src/modules/auth/repositories/auth.repository';
import { DispatchAssignmentService } from '../../src/modules/dispatch/services/dispatch-assignment.service';
import { MerchantOrderHandlingService } from '../../src/modules/orders/services/merchant-order-handling.service';
import { UsersService } from '../../src/modules/users/services/users.service';
import { createAuthSessionHarness } from './helpers/create-auth-session-harness';
import { createOrderDetailEntity } from './helpers/critical-flow.fixtures';
import { createIntegrationApp } from './helpers/create-integration-app';

describe('Operations flow integration', () => {
  it('serves merchant order handling and admin dispatch assignment with role-scoped access', async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'merchant',
        userId: 'usr_merchant_1',
        role: UserRole.MERCHANT,
        phone: '0991111111',
        sessionId: 'sess_merchant_1',
        merchantId: 'merchant_1',
      },
      {
        key: 'admin',
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
        sessionId: 'sess_admin_1',
      },
      {
        key: 'rider',
        userId: 'usr_rider_1',
        role: UserRole.RIDER,
        phone: '0999999999',
        sessionId: 'sess_rider_1',
        riderId: 'rider_1',
      },
    ] as const);
    const merchantOrderHandlingService = {
      acceptCurrentMerchantOrder: jest
        .fn()
        .mockResolvedValue(createOrderDetailEntity()),
    };
    const dispatchAssignmentService = {
      assignRiderToOrder: jest.fn().mockResolvedValue(createOrderDetailEntity()),
    };
    const harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
        {
          provide: MerchantOrderHandlingService,
          useValue: merchantOrderHandlingService,
        },
        {
          provide: DispatchAssignmentService,
          useValue: dispatchAssignmentService,
        },
      ],
    });

    try {
      const merchantClient = harness.client.withBearerToken(
        auth.actors.merchant.accessToken,
      );
      const adminClient = harness.client.withBearerToken(
        auth.actors.admin.accessToken,
      );
      const riderClient = harness.client.withBearerToken(
        auth.actors.rider.accessToken,
      );

      const acceptResponse = await merchantClient.post(
        '/api/v1/merchant/orders/order_1/accept',
        {
          body: {
            note: 'Preparing now',
          },
        },
      );
      expect(acceptResponse.status).toBe(201);
      expect(acceptResponse.body).toMatchObject({
        success: true,
        data: {
          orderId: 'order_1',
          status: 'MERCHANT_ACCEPTED',
        },
      });
      expect(
        merchantOrderHandlingService.acceptCurrentMerchantOrder,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_merchant_1',
          role: UserRole.MERCHANT,
        }),
        expect.objectContaining({
          orderId: 'order_1',
          reasonCode: undefined,
          note: 'Preparing now',
        }),
      );

      const assignResponse = await adminClient.post(
        '/api/v1/admin/dispatch/orders/order_1/assign-rider',
        {
          body: {
            riderId: 'rider_1',
            etaMinutes: 15,
            note: 'Closest rider assigned',
          },
        },
      );
      expect(assignResponse.status).toBe(201);
      expect(assignResponse.body).toMatchObject({
        success: true,
        data: {
          orderId: 'order_1',
          delivery: {
            riderId: 'rider_1',
          },
        },
      });
      expect(dispatchAssignmentService.assignRiderToOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
        }),
        expect.objectContaining({
          orderId: 'order_1',
          riderId: 'rider_1',
          etaMinutes: 15,
          reasonCode: undefined,
          note: 'Closest rider assigned',
        }),
      );

      const forbiddenDispatchResponse = await riderClient.post(
        '/api/v1/admin/dispatch/orders/order_1/assign-rider',
        {
          body: {
            riderId: 'rider_1',
          },
        },
      );
      expect(forbiddenDispatchResponse.status).toBe(403);
      expect(forbiddenDispatchResponse.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
        },
      });
    } finally {
      await harness.close();
    }
  });
});
