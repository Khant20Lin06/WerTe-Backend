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
exports.AuditEventService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const system_authenticated_actor_helper_1 = require("../../auth/entities/system-authenticated-actor.helper");
const audit_service_1 = require("./audit.service");
let AuditEventService = class AuditEventService {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async publishOrderEvent(input) {
        const resource = this.resolveOrderEventResource(input.code, input.order.orderId, input.metadataJson);
        const isSystemActor = (0, system_authenticated_actor_helper_1.isSystemAuthenticatedActor)(input.currentUser);
        await this.auditService.logAction({
            actorType: isSystemActor ? client_1.AuditActorType.SYSTEM : client_1.AuditActorType.USER,
            actorUserId: isSystemActor ? null : input.currentUser.userId,
            actorRole: isSystemActor ? null : input.currentUser.role,
            actionSource: isSystemActor
                ? client_1.AuditActionSource.SYSTEM
                : client_1.AuditActionSource.API,
            action: this.mapSystemMessageCodeToAuditAction(input.code),
            resourceType: resource.resourceType,
            resourceId: resource.resourceId,
            resourceLabel: input.order.orderCode,
            orderId: input.order.orderId,
            conversationId: input.conversation.conversationId,
            messageId: input.message.messageId,
            metadataJson: {
                systemMessageCode: input.code,
                ...(isSystemActor
                    ? { systemActorId: input.currentUser.userId }
                    : {}),
                ...(this.normalizeMetadata(input.metadataJson) ?? {}),
            },
        });
    }
    async publishConversationMessage(input) {
        await this.auditService.logAction({
            actorUserId: input.currentUser.userId,
            actorRole: input.currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'messaging.message_sent',
            resourceType: client_1.AuditResourceType.MESSAGE,
            resourceId: input.message.messageId,
            resourceLabel: input.conversation.title ?? input.conversation.conversationId,
            orderId: input.order?.orderId ?? null,
            conversationId: input.conversation.conversationId,
            messageId: input.message.messageId,
            metadataJson: {
                messageType: input.message.type,
                attachmentCount: input.message.attachments.length,
            },
        });
    }
    mapSystemMessageCodeToAuditAction(code) {
        switch (code) {
            case client_1.SystemMessageCode.ORDER_PLACED:
                return 'orders.placed';
            case client_1.SystemMessageCode.ORDER_ACCEPTED:
                return 'orders.accepted';
            case client_1.SystemMessageCode.ORDER_REJECTED:
                return 'orders.rejected';
            case client_1.SystemMessageCode.ORDER_PREPARING:
                return 'orders.preparing';
            case client_1.SystemMessageCode.RIDER_ASSIGNED:
                return 'dispatch.rider_assigned';
            case client_1.SystemMessageCode.RIDER_ACCEPTED:
                return 'deliveries.rider_accepted';
            case client_1.SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
                return 'deliveries.rider_rejected_assignment';
            case client_1.SystemMessageCode.ORDER_PICKED_UP:
                return 'deliveries.picked_up';
            case client_1.SystemMessageCode.ORDER_ON_THE_WAY:
                return 'deliveries.on_the_way';
            case client_1.SystemMessageCode.ORDER_DELIVERED:
                return 'deliveries.delivered';
            case client_1.SystemMessageCode.ORDER_CANCELLED:
                return 'orders.cancelled';
            case client_1.SystemMessageCode.FAILED_DELIVERY:
                return 'deliveries.failed';
            case client_1.SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
                return 'deliveries.merchant_handoff_confirmed';
            case client_1.SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
                return 'deliveries.proof_submitted';
            case client_1.SystemMessageCode.ADMIN_INTERVENTION:
                return 'orders.admin_intervention';
            case client_1.SystemMessageCode.PAYMENT_PENDING:
                return 'payments.pending';
            case client_1.SystemMessageCode.PAYMENT_SUCCEEDED:
                return 'payments.succeeded';
            case client_1.SystemMessageCode.PAYMENT_FAILED:
                return 'payments.failed';
            case client_1.SystemMessageCode.PAYMENT_CANCELLED:
                return 'payments.cancelled';
            case client_1.SystemMessageCode.REFUND_REQUESTED:
                return 'refunds.requested';
            case client_1.SystemMessageCode.REFUND_SUCCEEDED:
                return 'refunds.succeeded';
            case client_1.SystemMessageCode.REFUND_FAILED:
                return 'refunds.failed';
            default:
                return 'orders.system_event';
        }
    }
    resolveOrderEventResource(code, orderId, metadata) {
        const metadataRecord = this.normalizeMetadata(metadata);
        switch (code) {
            case client_1.SystemMessageCode.PAYMENT_PENDING:
            case client_1.SystemMessageCode.PAYMENT_SUCCEEDED:
            case client_1.SystemMessageCode.PAYMENT_FAILED:
            case client_1.SystemMessageCode.PAYMENT_CANCELLED:
                return {
                    resourceType: client_1.AuditResourceType.PAYMENT,
                    resourceId: this.readMetadataString(metadataRecord, 'paymentId') ?? orderId,
                };
            case client_1.SystemMessageCode.REFUND_REQUESTED:
            case client_1.SystemMessageCode.REFUND_SUCCEEDED:
            case client_1.SystemMessageCode.REFUND_FAILED:
                return {
                    resourceType: client_1.AuditResourceType.REFUND,
                    resourceId: this.readMetadataString(metadataRecord, 'refundId') ?? orderId,
                };
            case client_1.SystemMessageCode.RIDER_ASSIGNED:
            case client_1.SystemMessageCode.RIDER_ACCEPTED:
            case client_1.SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
            case client_1.SystemMessageCode.ORDER_PICKED_UP:
            case client_1.SystemMessageCode.ORDER_ON_THE_WAY:
            case client_1.SystemMessageCode.ORDER_DELIVERED:
            case client_1.SystemMessageCode.FAILED_DELIVERY:
            case client_1.SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
            case client_1.SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
                return {
                    resourceType: client_1.AuditResourceType.DELIVERY,
                    resourceId: orderId,
                };
            default:
                return {
                    resourceType: client_1.AuditResourceType.ORDER,
                    resourceId: orderId,
                };
        }
    }
    normalizeMetadata(metadata) {
        if (metadata == null || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        return metadata;
    }
    readMetadataString(metadata, key) {
        if (metadata === null) {
            return null;
        }
        const value = metadata[key];
        return typeof value === 'string' && value.length > 0 ? value : null;
    }
};
exports.AuditEventService = AuditEventService;
exports.AuditEventService = AuditEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditEventService);
//# sourceMappingURL=audit-event.service.js.map