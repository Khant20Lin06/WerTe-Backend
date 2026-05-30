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
const notification_center_entity_1 = require("../entities/notification-center.entity");
let NotificationsRepository = class NotificationsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listByUserId(userId, limit = 20) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            include: notification_center_entity_1.notificationCenterInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
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
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map