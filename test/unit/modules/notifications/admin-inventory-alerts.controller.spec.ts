import { UserRole, UserStatus } from '@prisma/client';

import { AdminInventoryAlertsController } from '../../../../src/modules/notifications/controllers/admin-inventory-alerts.controller';
import { AdminInventoryAlertsService } from '../../../../src/modules/notifications/services/admin-inventory-alerts.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminInventoryAlertsController', () => {
  const currentUser = makeAuthenticatedUser({
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('delegates inventory alert listing to the admin inventory alerts service', async () => {
    const adminInventoryAlertsService = {
      listInventoryAlerts: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AdminInventoryAlertsService>;
    const controller = new AdminInventoryAlertsController(
      adminInventoryAlertsService,
    );

    await controller.list(currentUser, { limit: 20, status: 'ALL' });

    expect(adminInventoryAlertsService.listInventoryAlerts).toHaveBeenCalledWith(
      currentUser,
      { limit: 20, status: 'ALL' },
    );
  });

  it('delegates alert acknowledgement to the admin inventory alerts service', async () => {
    const adminInventoryAlertsService = {
      acknowledgeInventoryAlert: jest.fn().mockResolvedValue({
        notificationId: 'notification_1',
      }),
    } as unknown as jest.Mocked<AdminInventoryAlertsService>;
    const controller = new AdminInventoryAlertsController(
      adminInventoryAlertsService,
    );

    await controller.acknowledge(currentUser, 'notification_1', {
      note: 'Handled by ops.',
    });

    expect(
      adminInventoryAlertsService.acknowledgeInventoryAlert,
    ).toHaveBeenCalledWith(currentUser, 'notification_1', {
      note: 'Handled by ops.',
    });
  });

  it('delegates alert resolution to the admin inventory alerts service', async () => {
    const adminInventoryAlertsService = {
      resolveInventoryAlert: jest.fn().mockResolvedValue({
        notificationId: 'notification_1',
      }),
    } as unknown as jest.Mocked<AdminInventoryAlertsService>;
    const controller = new AdminInventoryAlertsController(
      adminInventoryAlertsService,
    );

    await controller.resolve(currentUser, 'notification_1', {
      note: 'Restock confirmed.',
    });

    expect(adminInventoryAlertsService.resolveInventoryAlert).toHaveBeenCalledWith(
      currentUser,
      'notification_1',
      {
        note: 'Restock confirmed.',
      },
    );
  });

  it('delegates bulk dismissal to the admin inventory alerts service', async () => {
    const adminInventoryAlertsService = {
      bulkDismissInventoryAlerts: jest.fn().mockResolvedValue({
        dismissedCount: 1,
        alerts: [],
      }),
    } as unknown as jest.Mocked<AdminInventoryAlertsService>;
    const controller = new AdminInventoryAlertsController(
      adminInventoryAlertsService,
    );

    await controller.bulkDismiss(currentUser, {
      notificationIds: ['notification_1'],
      note: 'Noise only.',
    });

    expect(
      adminInventoryAlertsService.bulkDismissInventoryAlerts,
    ).toHaveBeenCalledWith(currentUser, {
      notificationIds: ['notification_1'],
      note: 'Noise only.',
    });
  });
});
