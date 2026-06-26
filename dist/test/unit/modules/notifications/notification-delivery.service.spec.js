"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_events_1 = require("../../../../src/infrastructure/websocket/websocket-events");
const notification_delivery_service_1 = require("../../../../src/modules/notifications/services/notification-delivery.service");
describe('NotificationDeliveryService', () => {
    it('emits notification events to the authenticated user room', () => {
        const emit = jest.fn();
        const to = jest.fn().mockReturnValue({
            emit,
        });
        const server = {
            to,
        };
        const service = new notification_delivery_service_1.NotificationDeliveryService();
        service.attachServer(server);
        service.emitNotificationCreated({
            notificationId: 'notification_1',
            userId: 'usr_merchant_1',
        });
        service.emitUnreadCountUpdated('usr_merchant_1', {
            unreadCount: 5,
        });
        service.emitUnreadFacetsUpdated('usr_merchant_1', {
            totalUnreadCount: 5,
            inventoryAlertUnreadCount: 3,
            unreadAttentionAlertCount: 2,
            unreadCompensationAlertCount: 1,
            unreadOpenInventoryAlertCount: 2,
            unreadAcknowledgedInventoryAlertCount: 0,
            unreadResolvedInventoryAlertCount: 1,
            unreadDismissedInventoryAlertCount: 0,
            unreadLowStockAlertCount: 1,
            unreadOutOfStockAlertCount: 1,
        });
        service.emitNotificationPresetsUpdated('usr_merchant_1', [
            {
                key: 'ALL',
                label: 'All notifications',
                sortOrder: 0,
                isDefault: true,
                cacheTtlSeconds: 120,
                unreadCount: 5,
                query: {
                    preset: 'ALL',
                    unreadOnly: null,
                    type: null,
                    inventoryAlertKind: null,
                    inventoryAlertStatus: null,
                    inventoryResourceType: null,
                    inventoryAttentionLevel: null,
                    branchId: null,
                },
            },
        ]);
        service.emitNotificationPreferenceUpdated('usr_merchant_1', {
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: false,
            inventoryAlertQuietHoursStartLocalTime: null,
            inventoryAlertQuietHoursEndLocalTime: null,
            inventoryAlertQuietHoursTimezone: null,
            inventoryAlertPushCurrentlyMuted: false,
            activeDeliveryChannels: ['IN_APP', 'PUSH'],
            inventoryAlertPushSuppressedReason: null,
            deliveryLanes: [
                {
                    channel: 'IN_APP',
                    enabled: true,
                    active: true,
                    suppressionReason: null,
                },
                {
                    channel: 'PUSH',
                    enabled: true,
                    active: true,
                    suppressionReason: null,
                },
            ],
        });
        expect(to).toHaveBeenNthCalledWith(1, (0, notification_delivery_service_1.buildNotificationUserRoom)('usr_merchant_1'));
        expect(emit).toHaveBeenNthCalledWith(1, websocket_events_1.WebsocketEvents.notificationCreated, expect.objectContaining({
            notificationId: 'notification_1',
        }));
        expect(emit).toHaveBeenNthCalledWith(2, websocket_events_1.WebsocketEvents.notificationUnreadCountUpdated, {
            unreadCount: 5,
        });
        expect(emit).toHaveBeenNthCalledWith(3, websocket_events_1.WebsocketEvents.notificationUnreadFacetsUpdated, expect.objectContaining({
            totalUnreadCount: 5,
        }));
        expect(emit).toHaveBeenNthCalledWith(4, websocket_events_1.WebsocketEvents.notificationPresetsUpdated, [
            expect.objectContaining({
                key: 'ALL',
            }),
        ]);
        expect(emit).toHaveBeenNthCalledWith(5, websocket_events_1.WebsocketEvents.notificationPreferenceUpdated, expect.objectContaining({
            userId: 'usr_merchant_1',
            activeDeliveryChannels: ['IN_APP', 'PUSH'],
        }));
    });
});
//# sourceMappingURL=notification-delivery.service.spec.js.map