"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const admin_inventory_alert_notification_entity_1 = require("../entities/admin-inventory-alert-notification.entity");
const notification_center_entity_1 = require("../entities/notification-center.entity");
const merchant_inventory_alert_preference_entity_1 = require("../entities/merchant-inventory-alert-preference.entity");
const pushNotificationDispatchInclude = client_1.Prisma.validator()({
    user: {
        select: {
            id: true,
            pushTokens: {
                select: {
                    id: true,
                    deviceId: true,
                    platform: true,
                    token: true,
                    lastSeenAt: true,
                },
            },
        },
    },
});
let NotificationsRepository = class NotificationsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listByUserId({ userId, limit = 20, type, unreadOnly = false, }) {
        return this.listPageByUserId({
            userId,
            limit,
            type,
            unreadOnly,
        }).then((page) => page.records);
    }
    async listPageByUserId({ userId, limit = 20, type, unreadOnly = false, cursor, }) {
        const boundedLimit = Math.min(Math.max(limit, 1), 500);
        const notifications = await this.prisma.notification.findMany({
            where: {
                userId,
                type,
                readAt: unreadOnly ? null : undefined,
            },
            include: notification_center_entity_1.notificationCenterInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            cursor: cursor === undefined
                ? undefined
                : {
                    id: cursor,
                },
            skip: cursor === undefined ? 0 : 1,
            take: boundedLimit + 1,
        });
        const hasMore = notifications.length > boundedLimit;
        const slice = hasMore ? notifications.slice(0, boundedLimit) : notifications;
        return {
            records: slice,
            nextCursor: hasMore ? slice[slice.length - 1]?.id ?? null : null,
            hasMore,
        };
    }
    listRecentInventoryAlerts(limit = 50) {
        return this.prisma.notification.findMany({
            where: {
                type: client_1.NotificationType.SYSTEM_ALERT,
            },
            include: admin_inventory_alert_notification_entity_1.adminInventoryAlertNotificationInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    listRecentInventoryAlertsByUserIdSince(userId, since, limit = 25) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                type: client_1.NotificationType.SYSTEM_ALERT,
                createdAt: {
                    gte: since,
                },
            },
            select: {
                id: true,
                type: true,
                metadataJson: true,
                createdAt: true,
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    listRecentInventoryAlertsByUserId(userId, limit = 200) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                type: client_1.NotificationType.SYSTEM_ALERT,
            },
            include: admin_inventory_alert_notification_entity_1.adminInventoryAlertNotificationInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    listUnreadInventoryAlertsByUserId(userId, limit) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                type: client_1.NotificationType.SYSTEM_ALERT,
                readAt: null,
            },
            include: notification_center_entity_1.notificationCenterInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findInventoryAlertsByIdsForUser(userId, notificationIds) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.notification.findMany({
            where: {
                userId,
                type: client_1.NotificationType.SYSTEM_ALERT,
                id: {
                    in: notificationIds,
                },
            },
            include: notification_center_entity_1.notificationCenterInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findInventoryAlertById(notificationId) {
        return this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                type: client_1.NotificationType.SYSTEM_ALERT,
            },
            include: admin_inventory_alert_notification_entity_1.adminInventoryAlertNotificationInclude,
        });
    }
    findInventoryAlertsByIds(notificationIds) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.notification.findMany({
            where: {
                id: {
                    in: notificationIds,
                },
                type: client_1.NotificationType.SYSTEM_ALERT,
            },
            include: admin_inventory_alert_notification_entity_1.adminInventoryAlertNotificationInclude,
        });
    }
    countUnreadByUserId(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                readAt: null,
            },
        });
    }
    create(payload) {
        return this.prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                navigationPath: payload.navigationPath ?? null,
                metadataJson: payload.metadataJson,
                orderId: payload.orderId ?? null,
                deliveryId: payload.deliveryId ?? null,
                conversationId: payload.conversationId ?? null,
                messageId: payload.messageId ?? null,
            },
            include: notification_center_entity_1.notificationCenterInclude,
        });
    }
    markRead(notificationId, userId, readAt = new Date()) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.notification.findFirst({
                where: {
                    id: notificationId,
                    userId,
                },
                include: notification_center_entity_1.notificationCenterInclude,
            });
            if (existing === null) {
                return null;
            }
            if (existing.readAt !== null) {
                return existing;
            }
            return tx.notification.update({
                where: {
                    id: notificationId,
                },
                data: {
                    readAt,
                },
                include: notification_center_entity_1.notificationCenterInclude,
            });
        });
    }
    markManyRead(notificationIds, userId, readAt = new Date()) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.notification.findMany({
                where: {
                    userId,
                    id: {
                        in: notificationIds,
                    },
                },
                include: notification_center_entity_1.notificationCenterInclude,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            });
            if (existing.length === 0) {
                return [];
            }
            const unreadIds = existing
                .filter((notification) => notification.readAt === null)
                .map((notification) => notification.id);
            if (unreadIds.length > 0) {
                await tx.notification.updateMany({
                    where: {
                        userId,
                        id: {
                            in: unreadIds,
                        },
                        readAt: null,
                    },
                    data: {
                        readAt,
                    },
                });
            }
            return tx.notification.findMany({
                where: {
                    userId,
                    id: {
                        in: existing.map((notification) => notification.id),
                    },
                },
                include: notification_center_entity_1.notificationCenterInclude,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            });
        });
    }
    createDeliveryAttempt(payload) {
        return this.prisma.notificationDelivery.create({
            data: {
                notificationId: payload.notificationId,
                channel: payload.channel,
                status: payload.status ?? client_1.NotificationDeliveryStatus.PENDING,
                providerMessageId: payload.providerMessageId ?? null,
                failureCode: payload.failureCode ?? null,
                failureMessage: payload.failureMessage ?? null,
                queuedAt: payload.queuedAt ?? null,
                sentAt: payload.sentAt ?? null,
                deliveredAt: payload.deliveredAt ?? null,
            },
        });
    }
    markQueuedPushDeliveriesSent(notificationId, providerMessageId, sentAt = new Date()) {
        return this.prisma.notificationDelivery.updateMany({
            where: {
                notificationId,
                channel: client_1.NotificationChannel.PUSH,
                status: {
                    in: [
                        client_1.NotificationDeliveryStatus.PENDING,
                        client_1.NotificationDeliveryStatus.QUEUED,
                    ],
                },
            },
            data: {
                status: client_1.NotificationDeliveryStatus.SENT,
                providerMessageId,
                sentAt,
            },
        });
    }
    findNotificationPreferenceByUserId(userId) {
        return this.prisma.notificationPreference.findUnique({
            where: {
                userId,
            },
        });
    }
    upsertNotificationPreferenceByUserId(userId, payload) {
        return this.prisma.notificationPreference.upsert({
            where: {
                userId,
            },
            create: {
                userId,
                inventoryAlertPushEnabled: payload.inventoryAlertPushEnabled,
                inventoryAlertQuietHoursEnabled: payload.inventoryAlertQuietHoursEnabled,
                inventoryAlertQuietHoursStartLocalTime: payload.inventoryAlertQuietHoursStartLocalTime,
                inventoryAlertQuietHoursEndLocalTime: payload.inventoryAlertQuietHoursEndLocalTime,
                inventoryAlertQuietHoursTimezone: payload.inventoryAlertQuietHoursTimezone,
            },
            update: {
                inventoryAlertPushEnabled: payload.inventoryAlertPushEnabled,
                inventoryAlertQuietHoursEnabled: payload.inventoryAlertQuietHoursEnabled,
                inventoryAlertQuietHoursStartLocalTime: payload.inventoryAlertQuietHoursStartLocalTime,
                inventoryAlertQuietHoursEndLocalTime: payload.inventoryAlertQuietHoursEndLocalTime,
                inventoryAlertQuietHoursTimezone: payload.inventoryAlertQuietHoursTimezone,
            },
        });
    }
    listNotificationPreferencesWithQuietHoursEnabled() {
        return this.prisma.notificationPreference.findMany({
            where: {
                inventoryAlertPushEnabled: true,
                inventoryAlertQuietHoursEnabled: true,
                inventoryAlertQuietHoursStartLocalTime: {
                    not: null,
                },
                inventoryAlertQuietHoursEndLocalTime: {
                    not: null,
                },
                inventoryAlertQuietHoursTimezone: {
                    not: null,
                },
            },
            select: merchant_inventory_alert_preference_entity_1.merchantInventoryAlertPreferenceSelect,
        });
    }
    markQueuedPushDeliveriesFailed(notificationId, failureCode, failureMessage) {
        return this.prisma.notificationDelivery.updateMany({
            where: {
                notificationId,
                channel: client_1.NotificationChannel.PUSH,
                status: {
                    in: [
                        client_1.NotificationDeliveryStatus.PENDING,
                        client_1.NotificationDeliveryStatus.QUEUED,
                    ],
                },
            },
            data: {
                status: client_1.NotificationDeliveryStatus.FAILED,
                failureCode,
                failureMessage,
            },
        });
    }
    findPushNotificationDispatchById(notificationId) {
        return this.prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
            include: pushNotificationDispatchInclude,
        });
    }
    deletePushTokensByIds(userId, pushTokenIds) {
        if (pushTokenIds.length === 0) {
            return Promise.resolve({
                count: 0,
            });
        }
        return this.prisma.pushToken.deleteMany({
            where: {
                userId,
                id: {
                    in: pushTokenIds,
                },
            },
        });
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map