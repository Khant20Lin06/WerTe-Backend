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
exports.AuditRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const branchMenuScopeAuditActions = [
    'menu_categories.scope_created',
    'menu_categories.scope_updated',
    'menu_items.scope_created',
    'menu_items.scope_updated',
];
const branchInventoryAdjustmentAuditActions = [
    'menu_items.inventory_adjusted',
    'item_options.inventory_adjusted',
];
const inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged';
const inventoryAlertResolutionAction = 'inventory_alerts.resolved';
const inventoryAlertDismissalAction = 'inventory_alerts.dismissed';
const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent';
const inventoryAlertEscalationAction = 'inventory_alerts.escalated';
let AuditRepository = class AuditRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(payload) {
        return this.prisma.auditLog.create({
            data: {
                actorType: payload.actorType ?? client_1.AuditActorType.USER,
                actorUserId: payload.actorUserId ?? null,
                actorRole: payload.actorRole ?? null,
                actionSource: payload.actionSource ?? client_1.AuditActionSource.API,
                action: payload.action,
                resourceType: payload.resourceType,
                resourceId: payload.resourceId,
                resourceLabel: payload.resourceLabel ?? null,
                targetUserId: payload.targetUserId ?? null,
                orderId: payload.orderId ?? null,
                deliveryId: payload.deliveryId ?? null,
                conversationId: payload.conversationId ?? null,
                messageId: payload.messageId ?? null,
                branchId: payload.branchId ?? null,
                metadataJson: payload.metadataJson,
                ipAddress: payload.ipAddress ?? null,
                userAgent: payload.userAgent ?? null,
            },
            include: audit_log_entity_1.auditLogInclude,
        });
    }
    listRecent(limit = 50) {
        return this.prisma.auditLog.findMany({
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findByResource(resourceType, resourceId, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: {
                resourceType,
                resourceId,
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findByOrderId(orderId, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: {
                orderId,
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findBranchMenuScopeLogs(branchId, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: {
                branchId,
                resourceType: {
                    in: [client_1.AuditResourceType.MENU_CATEGORY, client_1.AuditResourceType.MENU_ITEM],
                },
                action: {
                    in: [...branchMenuScopeAuditActions],
                },
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findBranchInventoryAdjustmentLogs(branchId, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: {
                branchId,
                resourceType: {
                    in: [client_1.AuditResourceType.MENU_ITEM, client_1.AuditResourceType.ITEM_OPTION],
                },
                action: {
                    in: [...branchInventoryAdjustmentAuditActions],
                },
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findInventoryAlertAcknowledgementLogs(notificationIds) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.auditLog.findMany({
            where: {
                resourceType: client_1.AuditResourceType.NOTIFICATION,
                resourceId: {
                    in: notificationIds,
                },
                action: inventoryAlertAcknowledgementAction,
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findInventoryAlertLifecycleLogs(notificationIds) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.auditLog.findMany({
            where: {
                resourceType: client_1.AuditResourceType.NOTIFICATION,
                resourceId: {
                    in: notificationIds,
                },
                action: {
                    in: [
                        inventoryAlertAcknowledgementAction,
                        inventoryAlertResolutionAction,
                        inventoryAlertDismissalAction,
                    ],
                },
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
    findInventoryAlertFollowUpLogs(notificationIds) {
        if (notificationIds.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.auditLog.findMany({
            where: {
                resourceType: client_1.AuditResourceType.NOTIFICATION,
                resourceId: {
                    in: notificationIds,
                },
                action: {
                    in: [inventoryAlertReminderAction, inventoryAlertEscalationAction],
                },
            },
            include: audit_log_entity_1.auditLogInclude,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }
};
exports.AuditRepository = AuditRepository;
exports.AuditRepository = AuditRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditRepository);
//# sourceMappingURL=audit.repository.js.map