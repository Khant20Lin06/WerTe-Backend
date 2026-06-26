"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin_inventory_alerts_controller_1 = require("../../../../src/modules/notifications/controllers/admin-inventory-alerts.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AdminInventoryAlertsController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    it('delegates inventory alert listing to the admin inventory alerts service', async () => {
        const adminInventoryAlertsService = {
            listInventoryAlerts: jest.fn().mockResolvedValue([]),
        };
        const controller = new admin_inventory_alerts_controller_1.AdminInventoryAlertsController(adminInventoryAlertsService);
        await controller.list(currentUser, { limit: 20, status: 'ALL' });
        expect(adminInventoryAlertsService.listInventoryAlerts).toHaveBeenCalledWith(currentUser, { limit: 20, status: 'ALL' });
    });
    it('delegates alert acknowledgement to the admin inventory alerts service', async () => {
        const adminInventoryAlertsService = {
            acknowledgeInventoryAlert: jest.fn().mockResolvedValue({
                notificationId: 'notification_1',
            }),
        };
        const controller = new admin_inventory_alerts_controller_1.AdminInventoryAlertsController(adminInventoryAlertsService);
        await controller.acknowledge(currentUser, 'notification_1', {
            note: 'Handled by ops.',
        });
        expect(adminInventoryAlertsService.acknowledgeInventoryAlert).toHaveBeenCalledWith(currentUser, 'notification_1', {
            note: 'Handled by ops.',
        });
    });
    it('delegates alert resolution to the admin inventory alerts service', async () => {
        const adminInventoryAlertsService = {
            resolveInventoryAlert: jest.fn().mockResolvedValue({
                notificationId: 'notification_1',
            }),
        };
        const controller = new admin_inventory_alerts_controller_1.AdminInventoryAlertsController(adminInventoryAlertsService);
        await controller.resolve(currentUser, 'notification_1', {
            note: 'Restock confirmed.',
        });
        expect(adminInventoryAlertsService.resolveInventoryAlert).toHaveBeenCalledWith(currentUser, 'notification_1', {
            note: 'Restock confirmed.',
        });
    });
    it('delegates bulk dismissal to the admin inventory alerts service', async () => {
        const adminInventoryAlertsService = {
            bulkDismissInventoryAlerts: jest.fn().mockResolvedValue({
                dismissedCount: 1,
                alerts: [],
            }),
        };
        const controller = new admin_inventory_alerts_controller_1.AdminInventoryAlertsController(adminInventoryAlertsService);
        await controller.bulkDismiss(currentUser, {
            notificationIds: ['notification_1'],
            note: 'Noise only.',
        });
        expect(adminInventoryAlertsService.bulkDismissInventoryAlerts).toHaveBeenCalledWith(currentUser, {
            notificationIds: ['notification_1'],
            note: 'Noise only.',
        });
    });
});
//# sourceMappingURL=admin-inventory-alerts.controller.spec.js.map