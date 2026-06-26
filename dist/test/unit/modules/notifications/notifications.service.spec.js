"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const admin_inventory_alert_dto_1 = require("../../../../src/modules/notifications/dto/admin-inventory-alert.dto");
const notifications_service_1 = require("../../../../src/modules/notifications/services/notifications.service");
describe('NotificationsService', () => {
    let service;
    let repository;
    let auditService;
    let notificationDeliveryService;
    beforeEach(() => {
        repository = {
            listByUserId: jest.fn(),
            listPageByUserId: jest.fn(),
            listUnreadInventoryAlertsByUserId: jest.fn(),
            findInventoryAlertsByIdsForUser: jest.fn(),
            markManyRead: jest.fn(),
            listRecentInventoryAlertsByUserIdSince: jest.fn(),
            countUnreadByUserId: jest.fn(),
            create: jest.fn(),
            markRead: jest.fn(),
            createDeliveryAttempt: jest.fn(),
        };
        auditService = {
            listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([]),
            listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([]),
        };
        notificationDeliveryService = {
            emitNotificationCreated: jest.fn(),
            emitNotificationRead: jest.fn(),
            emitNotificationBulkRead: jest.fn(),
            emitUnreadCountUpdated: jest.fn(),
            emitUnreadFacetsUpdated: jest.fn(),
            emitNotificationPresetsUpdated: jest.fn(),
        };
        repository.listUnreadInventoryAlertsByUserId.mockResolvedValue([]);
        service = new notifications_service_1.NotificationsService(repository, auditService, notificationDeliveryService);
    });
    it('lists notifications for the user', async () => {
        repository.listPageByUserId.mockResolvedValue({
            records: [
                {
                    id: 'notification-1',
                    userId: 'user-1',
                    type: client_1.NotificationType.ORDER_STATUS_UPDATED,
                    title: 'Order updated',
                    body: 'Your order is now preparing.',
                    navigationPath: '/orders/order-1',
                    metadataJson: { source: 'order' },
                    readAt: null,
                    orderId: 'order-1',
                    deliveryId: null,
                    conversationId: null,
                    messageId: null,
                    createdAt: new Date('2026-04-23T10:00:00.000Z'),
                    updatedAt: new Date('2026-04-23T10:00:00.000Z'),
                    order: {
                        orderCode: 'ORD-001',
                        status: 'PREPARING',
                    },
                    delivery: null,
                    conversation: null,
                    message: null,
                    deliveries: [],
                },
            ],
            nextCursor: null,
            hasMore: false,
        });
        await expect(service.listUserNotifications('user-1')).resolves.toMatchObject([
            {
                notificationId: 'notification-1',
                orderCode: 'ORD-001',
                orderStatus: 'PREPARING',
                readAt: null,
                inventoryAlert: null,
            },
        ]);
        expect(repository.listPageByUserId).toHaveBeenCalledWith({
            userId: 'user-1',
            limit: 20,
            type: undefined,
            unreadOnly: false,
            cursor: undefined,
        });
    });
    it('builds a cursor-paginated notification page for inventory presets', async () => {
        repository.listPageByUserId
            .mockResolvedValueOnce({
            records: [
                {
                    id: 'notification-open-1',
                    userId: 'merchant-user-1',
                    type: client_1.NotificationType.SYSTEM_ALERT,
                    title: 'Low stock: Mohinga',
                    body: 'Mohinga is low.',
                    navigationPath: null,
                    metadataJson: {
                        alertKind: 'ATTENTION',
                        branchId: 'branch_1',
                        branchName: 'Downtown Branch',
                        resourceType: 'MENU_ITEM',
                        resourceId: 'item_1',
                        resourceLabel: 'Mohinga',
                        attentionLevel: 'LOW_STOCK',
                        stockQuantity: 2,
                        lowStockThreshold: 3,
                    },
                    readAt: null,
                    orderId: null,
                    deliveryId: null,
                    conversationId: null,
                    messageId: null,
                    createdAt: new Date('2026-05-01T10:02:00.000Z'),
                    updatedAt: new Date('2026-05-01T10:02:00.000Z'),
                    order: null,
                    delivery: null,
                    conversation: null,
                    message: null,
                    deliveries: [],
                },
                {
                    id: 'notification-open-2',
                    userId: 'merchant-user-1',
                    type: client_1.NotificationType.SYSTEM_ALERT,
                    title: 'Out of stock: Fish cake',
                    body: 'Fish cake is out of stock.',
                    navigationPath: null,
                    metadataJson: {
                        alertKind: 'ATTENTION',
                        branchId: 'branch_1',
                        branchName: 'Downtown Branch',
                        resourceType: 'ITEM_OPTION',
                        resourceId: 'option_1',
                        resourceLabel: 'Extra fish cake',
                        menuItemName: 'Mohinga',
                        attentionLevel: 'OUT_OF_STOCK',
                        stockQuantity: 0,
                        lowStockThreshold: 2,
                    },
                    readAt: null,
                    orderId: null,
                    deliveryId: null,
                    conversationId: null,
                    messageId: null,
                    createdAt: new Date('2026-05-01T10:01:00.000Z'),
                    updatedAt: new Date('2026-05-01T10:01:00.000Z'),
                    order: null,
                    delivery: null,
                    conversation: null,
                    message: null,
                    deliveries: [],
                },
            ],
            nextCursor: 'notification-open-2',
            hasMore: true,
        })
            .mockResolvedValueOnce({
            records: [
                {
                    id: 'notification-open-3',
                    userId: 'merchant-user-1',
                    type: client_1.NotificationType.SYSTEM_ALERT,
                    title: 'Low stock: Rice',
                    body: 'Rice is low.',
                    navigationPath: null,
                    metadataJson: {
                        alertKind: 'ATTENTION',
                        branchId: 'branch_1',
                        branchName: 'Downtown Branch',
                        resourceType: 'MENU_ITEM',
                        resourceId: 'item_3',
                        resourceLabel: 'Rice',
                        attentionLevel: 'LOW_STOCK',
                        stockQuantity: 1,
                        lowStockThreshold: 3,
                    },
                    readAt: null,
                    orderId: null,
                    deliveryId: null,
                    conversationId: null,
                    messageId: null,
                    createdAt: new Date('2026-05-01T10:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
                    order: null,
                    delivery: null,
                    conversation: null,
                    message: null,
                    deliveries: [],
                },
            ],
            nextCursor: null,
            hasMore: false,
        });
        await expect(service.listUserNotificationPage('merchant-user-1', {
            limit: 2,
            preset: 'INVENTORY_OPEN',
        })).resolves.toMatchObject({
            appliedPreset: 'INVENTORY_OPEN',
            hasMore: true,
            nextCursor: 'notification-open-2',
            cacheTtlSeconds: 30,
            suggestedPollIntervalSeconds: 15,
            notifications: [
                {
                    notificationId: 'notification-open-1',
                    inventoryAlert: {
                        status: admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN,
                        alertKind: admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
                    },
                },
                {
                    notificationId: 'notification-open-2',
                    inventoryAlert: {
                        status: admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN,
                        alertKind: admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
                    },
                },
            ],
        });
        expect(repository.listPageByUserId).toHaveBeenNthCalledWith(1, {
            userId: 'merchant-user-1',
            limit: 100,
            type: client_1.NotificationType.SYSTEM_ALERT,
            unreadOnly: false,
            cursor: undefined,
        });
        expect(repository.listPageByUserId).toHaveBeenNthCalledWith(2, {
            userId: 'merchant-user-1',
            limit: 100,
            type: client_1.NotificationType.SYSTEM_ALERT,
            unreadOnly: false,
            cursor: 'notification-open-2',
        });
    });
    it('filters merchant inventory notifications by resolved history and exposes inventory snapshot metadata', async () => {
        repository.listPageByUserId.mockResolvedValue({
            records: [
                {
                    id: 'notification-inventory-1',
                    userId: 'merchant-user-1',
                    type: client_1.NotificationType.SYSTEM_ALERT,
                    title: 'Low stock: Mohinga',
                    body: 'Mohinga is now low in Downtown Branch with 2 left.',
                    navigationPath: '/merchant/branches/branch_1/inventory/overview',
                    metadataJson: {
                        alertKind: 'ATTENTION',
                        branchId: 'branch_1',
                        branchName: 'Downtown Branch',
                        resourceType: 'MENU_ITEM',
                        resourceId: 'item_1',
                        resourceLabel: 'Mohinga',
                        menuItemName: 'Mohinga',
                        attentionLevel: 'LOW_STOCK',
                        stockQuantity: 2,
                        lowStockThreshold: 3,
                    },
                    readAt: null,
                    orderId: null,
                    deliveryId: null,
                    conversationId: null,
                    messageId: null,
                    createdAt: new Date('2026-05-01T10:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
                    order: null,
                    delivery: null,
                    conversation: null,
                    message: null,
                    deliveries: [],
                },
            ],
            nextCursor: null,
            hasMore: false,
        });
        auditService.listInventoryAlertAcknowledgementLogs.mockResolvedValue([
            {
                auditLogId: 'audit_ack_1',
                action: 'inventory_alerts.acknowledged',
                resourceId: 'notification-inventory-1',
                metadata: {
                    note: 'Merchant already contacted.',
                },
                createdAt: '2026-05-01T10:05:00.000Z',
            },
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            {
                auditLogId: 'audit_resolve_1',
                action: 'inventory_alerts.resolved',
                resourceId: 'notification-inventory-1',
                metadata: {
                    note: 'Restock confirmed.',
                },
                createdAt: '2026-05-01T10:10:00.000Z',
            },
        ]);
        await expect(service.listUserNotifications('merchant-user-1', {
            type: client_1.NotificationType.SYSTEM_ALERT,
            inventoryAlertStatus: 'RESOLVED',
            inventoryAlertKind: 'ATTENTION',
            branchId: 'branch_1',
        })).resolves.toMatchObject([
            {
                notificationId: 'notification-inventory-1',
                inventoryAlert: {
                    alertKind: admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
                    status: admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED,
                    branchId: 'branch_1',
                    resourceId: 'item_1',
                    attentionLevel: 'LOW_STOCK',
                    acknowledgementNote: 'Merchant already contacted.',
                    statusNote: 'Restock confirmed.',
                },
            },
        ]);
        expect(repository.listPageByUserId).toHaveBeenCalledWith({
            userId: 'merchant-user-1',
            limit: 100,
            type: client_1.NotificationType.SYSTEM_ALERT,
            unreadOnly: false,
            cursor: undefined,
        });
    });
    it('builds unread notification facets for merchant inventory alert tabs', async () => {
        repository.countUnreadByUserId.mockResolvedValue(5);
        repository.listUnreadInventoryAlertsByUserId.mockResolvedValue([
            {
                id: 'notification-inventory-open',
                userId: 'merchant-user-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: null,
                metadataJson: {
                    alertKind: 'ATTENTION',
                    branchId: 'branch_1',
                    branchName: 'Downtown Branch',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                    stockQuantity: 2,
                    lowStockThreshold: 3,
                },
                readAt: null,
                orderId: null,
                deliveryId: null,
                conversationId: null,
                messageId: null,
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
                updatedAt: new Date('2026-05-01T10:00:00.000Z'),
                order: null,
                delivery: null,
                conversation: null,
                message: null,
                deliveries: [],
            },
            {
                id: 'notification-inventory-resolved',
                userId: 'merchant-user-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                title: 'Stock restored: Extra fish cake',
                body: 'Restored after cancellation.',
                navigationPath: null,
                metadataJson: {
                    alertKind: 'COMPENSATION',
                    branchId: 'branch_1',
                    branchName: 'Downtown Branch',
                    resourceType: 'ITEM_OPTION',
                    resourceId: 'option_1',
                    resourceLabel: 'Extra fish cake',
                    menuItemName: 'Mohinga',
                    restoredQuantity: 1,
                    orderId: 'order_1',
                    orderCode: 'ORD-00000001',
                    reasonCode: 'customer_cancelled',
                },
                readAt: null,
                orderId: 'order_1',
                deliveryId: null,
                conversationId: null,
                messageId: null,
                createdAt: new Date('2026-05-01T10:02:00.000Z'),
                updatedAt: new Date('2026-05-01T10:02:00.000Z'),
                order: {
                    orderCode: 'ORD-00000001',
                    status: 'CANCELLED',
                },
                delivery: null,
                conversation: null,
                message: null,
                deliveries: [],
            },
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            {
                auditLogId: 'audit_resolve_1',
                action: 'inventory_alerts.resolved',
                resourceId: 'notification-inventory-resolved',
                metadata: {
                    note: 'Resolved automatically.',
                },
                createdAt: '2026-05-01T10:03:00.000Z',
            },
        ]);
        await expect(service.getUnreadFacets('merchant-user-1')).resolves.toEqual({
            totalUnreadCount: 5,
            inventoryAlertUnreadCount: 2,
            unreadAttentionAlertCount: 1,
            unreadCompensationAlertCount: 1,
            unreadOpenInventoryAlertCount: 1,
            unreadAcknowledgedInventoryAlertCount: 0,
            unreadResolvedInventoryAlertCount: 1,
            unreadDismissedInventoryAlertCount: 0,
            unreadLowStockAlertCount: 1,
            unreadOutOfStockAlertCount: 0,
        });
    });
    it('builds notification presets from unread facets', async () => {
        jest.spyOn(service, 'getUnreadFacets').mockResolvedValue({
            totalUnreadCount: 8,
            inventoryAlertUnreadCount: 5,
            unreadAttentionAlertCount: 3,
            unreadCompensationAlertCount: 2,
            unreadOpenInventoryAlertCount: 2,
            unreadAcknowledgedInventoryAlertCount: 1,
            unreadResolvedInventoryAlertCount: 2,
            unreadDismissedInventoryAlertCount: 0,
            unreadLowStockAlertCount: 1,
            unreadOutOfStockAlertCount: 2,
        });
        await expect(service.listNotificationPresets('merchant-user-1')).resolves.toEqual(expect.arrayContaining([
            expect.objectContaining({
                key: 'ALL',
                sortOrder: 0,
                isDefault: true,
                cacheTtlSeconds: 120,
                unreadCount: 8,
                query: expect.objectContaining({ preset: 'ALL' }),
            }),
            expect.objectContaining({
                key: 'INVENTORY_OPEN',
                sortOrder: 2,
                unreadCount: 2,
                query: expect.objectContaining({
                    preset: 'INVENTORY_OPEN',
                    type: client_1.NotificationType.SYSTEM_ALERT,
                    inventoryAlertKind: 'ATTENTION',
                    inventoryAlertStatus: 'OPEN',
                    inventoryResourceType: null,
                    branchId: null,
                }),
            }),
            expect.objectContaining({
                key: 'INVENTORY_OUT_OF_STOCK',
                sortOrder: 5,
                unreadCount: 2,
                query: expect.objectContaining({
                    preset: 'INVENTORY_OUT_OF_STOCK',
                    inventoryAttentionLevel: 'OUT_OF_STOCK',
                }),
            }),
        ]));
    });
    it('returns the frozen notification contract snapshot', () => {
        expect(service.getNotificationContract()).toMatchObject({
            version: 'notification-contract.v1',
            restRoutes: {
                contract: '/notifications/contract',
                page: '/notifications/page',
            },
            websocketEvents: {
                notificationCreated: 'notification.created',
                unreadFacetsUpdated: 'notification.unread-facets.updated',
                preferenceUpdated: 'notification.preference.updated',
            },
            pageDefaults: {
                defaultLimit: 20,
                maxLimit: 100,
                pageCacheTtlSeconds: 30,
                suggestedPollIntervalSeconds: 15,
                presetCacheTtlSeconds: 120,
            },
            queryCapabilities: {
                presets: expect.arrayContaining(['ALL', 'INVENTORY_OPEN']),
                inventoryAlertKinds: expect.arrayContaining(['ALL', 'ATTENTION']),
            },
        });
    });
    it('bulk marks selected inventory alerts as read', async () => {
        repository.countUnreadByUserId.mockResolvedValue(1);
        repository.findInventoryAlertsByIdsForUser.mockResolvedValue([
            {
                id: 'notification-inventory-1',
                userId: 'merchant-user-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: null,
                metadataJson: {
                    alertKind: 'ATTENTION',
                    branchId: 'branch_1',
                    branchName: 'Downtown Branch',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                    stockQuantity: 2,
                    lowStockThreshold: 3,
                },
                readAt: null,
                orderId: null,
                deliveryId: null,
                conversationId: null,
                messageId: null,
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
                updatedAt: new Date('2026-05-01T10:00:00.000Z'),
                order: null,
                delivery: null,
                conversation: null,
                message: null,
                deliveries: [],
            },
        ]);
        repository.markManyRead.mockResolvedValue([
            {
                id: 'notification-inventory-1',
                userId: 'merchant-user-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: null,
                metadataJson: {
                    alertKind: 'ATTENTION',
                    branchId: 'branch_1',
                    branchName: 'Downtown Branch',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                    stockQuantity: 2,
                    lowStockThreshold: 3,
                },
                readAt: new Date('2026-05-01T10:05:00.000Z'),
                orderId: null,
                deliveryId: null,
                conversationId: null,
                messageId: null,
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
                updatedAt: new Date('2026-05-01T10:05:00.000Z'),
                order: null,
                delivery: null,
                conversation: null,
                message: null,
                deliveries: [],
            },
        ]);
        await expect(service.bulkMarkInventoryAlertsRead('merchant-user-1', {
            notificationIds: ['notification-inventory-1'],
        })).resolves.toMatchObject({
            markedCount: 1,
            notifications: [
                {
                    notificationId: 'notification-inventory-1',
                    readAt: '2026-05-01T10:05:00.000Z',
                    inventoryAlert: {
                        alertKind: admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
                        status: admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN,
                    },
                },
            ],
        });
        expect(notificationDeliveryService.emitNotificationBulkRead).toHaveBeenCalledWith('merchant-user-1', expect.objectContaining({
            markedCount: 1,
        }));
        expect(notificationDeliveryService.emitUnreadCountUpdated).toHaveBeenCalledWith('merchant-user-1', {
            unreadCount: 1,
        });
        expect(notificationDeliveryService.emitUnreadFacetsUpdated).toHaveBeenCalledWith('merchant-user-1', expect.objectContaining({
            totalUnreadCount: 1,
        }));
        expect(notificationDeliveryService.emitNotificationPresetsUpdated).toHaveBeenCalledWith('merchant-user-1', expect.arrayContaining([
            expect.objectContaining({
                key: 'ALL',
                unreadCount: 1,
            }),
        ]));
    });
    it('requires either notificationIds or markAllMatching for inventory bulk read', async () => {
        await expect(service.bulkMarkInventoryAlertsRead('merchant-user-1', {})).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('creates a notification and maps it to the center entity', async () => {
        repository.countUnreadByUserId.mockResolvedValue(4);
        repository.create.mockResolvedValue({
            id: 'notification-2',
            userId: 'user-2',
            type: client_1.NotificationType.MESSAGE_RECEIVED,
            title: 'New message',
            body: 'You have a new order chat message.',
            navigationPath: '/messages/conversation-1',
            metadataJson: { source: 'chat' },
            readAt: null,
            orderId: 'order-2',
            deliveryId: null,
            conversationId: 'conversation-1',
            messageId: 'message-1',
            createdAt: new Date('2026-04-23T11:00:00.000Z'),
            updatedAt: new Date('2026-04-23T11:00:00.000Z'),
            order: {
                orderCode: 'ORD-002',
                status: 'RIDER_ASSIGNED',
            },
            delivery: null,
            conversation: {
                type: 'ORDER_CHAT',
            },
            message: {
                type: 'TEXT',
                createdAt: new Date('2026-04-23T11:00:00.000Z'),
            },
            deliveries: [
                {
                    id: 'delivery-attempt-1',
                    channel: client_1.NotificationChannel.PUSH,
                    status: client_1.NotificationDeliveryStatus.SENT,
                    providerMessageId: 'provider-1',
                    failureCode: null,
                    failureMessage: null,
                    queuedAt: new Date('2026-04-23T11:00:01.000Z'),
                    sentAt: new Date('2026-04-23T11:00:02.000Z'),
                    deliveredAt: null,
                    createdAt: new Date('2026-04-23T11:00:01.000Z'),
                    updatedAt: new Date('2026-04-23T11:00:02.000Z'),
                },
            ],
        });
        await expect(service.createNotification({
            userId: 'user-2',
            type: client_1.NotificationType.MESSAGE_RECEIVED,
            title: 'New message',
            body: 'You have a new order chat message.',
            conversationId: 'conversation-1',
            messageId: 'message-1',
        })).resolves.toMatchObject({
            notificationId: 'notification-2',
            conversationType: 'ORDER_CHAT',
            messageType: 'TEXT',
            inventoryAlert: null,
            deliveries: [
                {
                    channel: client_1.NotificationChannel.PUSH,
                    status: client_1.NotificationDeliveryStatus.SENT,
                },
            ],
        });
        expect(notificationDeliveryService.emitNotificationCreated).toHaveBeenCalledWith(expect.objectContaining({
            notificationId: 'notification-2',
        }));
        expect(notificationDeliveryService.emitUnreadCountUpdated).toHaveBeenCalledWith('user-2', {
            unreadCount: 4,
        });
        expect(notificationDeliveryService.emitUnreadFacetsUpdated).toHaveBeenCalledWith('user-2', expect.objectContaining({
            totalUnreadCount: 4,
        }));
        expect(notificationDeliveryService.emitNotificationPresetsUpdated).toHaveBeenCalledWith('user-2', expect.arrayContaining([
            expect.objectContaining({
                key: 'ALL',
                unreadCount: 4,
            }),
        ]));
    });
    it('returns the unread count', async () => {
        repository.countUnreadByUserId.mockResolvedValue(4);
        await expect(service.getUnreadCount('user-3')).resolves.toBe(4);
    });
    it('detects a recent duplicate merchant inventory alert by signature', async () => {
        repository.listRecentInventoryAlertsByUserIdSince.mockResolvedValue([
            {
                id: 'notification-dup-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                metadataJson: {
                    branchId: 'branch_1',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                },
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
            },
        ]);
        await expect(service.hasRecentMerchantInventoryAlert({
            userId: 'user-3',
            resourceType: 'MENU_ITEM',
            resourceId: 'item_1',
            attentionLevel: 'LOW_STOCK',
            since: new Date('2026-05-01T09:45:00.000Z'),
        })).resolves.toBe(true);
        expect(auditService.listInventoryAlertLifecycleLogs).toHaveBeenCalledWith([
            'notification-dup-1',
        ]);
    });
    it('ignores recently resolved attention alerts so a recovered stock drop can reopen the cycle', async () => {
        repository.listRecentInventoryAlertsByUserIdSince.mockResolvedValue([
            {
                id: 'notification-resolved-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                metadataJson: {
                    branchId: 'branch_1',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                },
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
            },
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            {
                action: 'inventory_alerts.resolved',
                resourceId: 'notification-resolved-1',
                metadata: {
                    note: 'Auto-resolved after stock restoration.',
                },
                actorUser: null,
                createdAt: '2026-05-01T10:05:00.000Z',
            },
        ]);
        await expect(service.hasRecentMerchantInventoryAlert({
            userId: 'user-3',
            resourceType: 'MENU_ITEM',
            resourceId: 'item_1',
            attentionLevel: 'LOW_STOCK',
            since: new Date('2026-05-01T09:45:00.000Z'),
        })).resolves.toBe(false);
    });
    it('keeps a dismissed attention alert suppressed when no recovery happened yet', async () => {
        repository.listRecentInventoryAlertsByUserIdSince.mockResolvedValue([
            {
                id: 'notification-dismissed-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                metadataJson: {
                    branchId: 'branch_1',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                },
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
            },
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            {
                action: 'inventory_alerts.dismissed',
                resourceId: 'notification-dismissed-1',
                metadata: {
                    note: 'Noise until next restock cycle.',
                },
                actorUser: null,
                createdAt: '2026-05-01T10:05:00.000Z',
            },
        ]);
        await expect(service.hasRecentMerchantInventoryAlert({
            userId: 'user-3',
            resourceType: 'MENU_ITEM',
            resourceId: 'item_1',
            attentionLevel: 'LOW_STOCK',
            since: new Date('2026-05-01T09:45:00.000Z'),
        })).resolves.toBe(true);
    });
    it('ignores dismissed attention alerts after a later compensation closes that shortage cycle', async () => {
        repository.listRecentInventoryAlertsByUserIdSince.mockResolvedValue([
            {
                id: 'notification-dismissed-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                metadataJson: {
                    branchId: 'branch_1',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    attentionLevel: 'LOW_STOCK',
                },
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
            },
            {
                id: 'notification-comp-1',
                type: client_1.NotificationType.SYSTEM_ALERT,
                metadataJson: {
                    alertKind: 'COMPENSATION',
                    branchId: 'branch_1',
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    resourceLabel: 'Mohinga',
                    restoredQuantity: 2,
                    stockQuantity: 5,
                    lowStockThreshold: 3,
                    orderId: 'order_1',
                    orderCode: 'ORD-001',
                },
                createdAt: new Date('2026-05-01T10:10:00.000Z'),
            },
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            {
                action: 'inventory_alerts.dismissed',
                resourceId: 'notification-dismissed-1',
                metadata: {
                    note: 'Noise until next restock cycle.',
                },
                actorUser: null,
                createdAt: '2026-05-01T10:05:00.000Z',
            },
        ]);
        await expect(service.hasRecentMerchantInventoryAlert({
            userId: 'user-3',
            resourceType: 'MENU_ITEM',
            resourceId: 'item_1',
            attentionLevel: 'LOW_STOCK',
            since: new Date('2026-05-01T09:45:00.000Z'),
        })).resolves.toBe(false);
    });
    it('marks a notification as read when it exists', async () => {
        repository.countUnreadByUserId.mockResolvedValue(3);
        repository.markRead.mockResolvedValue({
            id: 'notification-3',
            userId: 'user-3',
            type: client_1.NotificationType.SYSTEM_ALERT,
            title: 'System alert',
            body: 'There was an update to your account.',
            navigationPath: null,
            metadataJson: null,
            readAt: new Date('2026-04-23T12:00:00.000Z'),
            orderId: null,
            deliveryId: null,
            conversationId: null,
            messageId: null,
            createdAt: new Date('2026-04-23T11:55:00.000Z'),
            updatedAt: new Date('2026-04-23T12:00:00.000Z'),
            order: null,
            delivery: null,
            conversation: null,
            message: null,
            deliveries: [],
        });
        await expect(service.markNotificationRead('user-3', 'notification-3')).resolves.toMatchObject({
            notificationId: 'notification-3',
            readAt: '2026-04-23T12:00:00.000Z',
            inventoryAlert: null,
        });
        expect(notificationDeliveryService.emitNotificationRead).toHaveBeenCalledWith(expect.objectContaining({
            notificationId: 'notification-3',
        }));
        expect(notificationDeliveryService.emitUnreadCountUpdated).toHaveBeenCalledWith('user-3', {
            unreadCount: 3,
        });
        expect(notificationDeliveryService.emitUnreadFacetsUpdated).toHaveBeenCalledWith('user-3', expect.objectContaining({
            totalUnreadCount: 3,
        }));
        expect(notificationDeliveryService.emitNotificationPresetsUpdated).toHaveBeenCalledWith('user-3', expect.arrayContaining([
            expect.objectContaining({
                key: 'ALL',
                unreadCount: 3,
            }),
        ]));
    });
    it('creates a notification delivery attempt', async () => {
        repository.createDeliveryAttempt.mockResolvedValue({ id: 'attempt-1' });
        await service.createDeliveryAttempt({
            notificationId: 'notification-4',
            channel: client_1.NotificationChannel.SMS,
            status: client_1.NotificationDeliveryStatus.QUEUED,
        });
        expect(repository.createDeliveryAttempt).toHaveBeenCalledWith({
            notificationId: 'notification-4',
            channel: client_1.NotificationChannel.SMS,
            status: client_1.NotificationDeliveryStatus.QUEUED,
        });
    });
});
//# sourceMappingURL=notifications.service.spec.js.map