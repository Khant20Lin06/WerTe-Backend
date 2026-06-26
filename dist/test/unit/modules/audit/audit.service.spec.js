"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const audit_service_1 = require("../../../../src/modules/audit/services/audit.service");
describe('AuditService', () => {
    let service;
    let repository;
    beforeEach(() => {
        repository = {
            create: jest.fn(),
            listRecent: jest.fn(),
            findByResource: jest.fn(),
            findByOrderId: jest.fn(),
        };
        service = new audit_service_1.AuditService(repository);
    });
    it('logs an audit action and returns the mapped entity', async () => {
        repository.create.mockResolvedValue({
            id: 'audit-1',
            actorType: client_1.AuditActorType.USER,
            actorUserId: 'user-1',
            actorRole: client_1.UserRole.ADMIN,
            actionSource: client_1.AuditActionSource.API,
            action: 'order.cancelled_by_admin',
            resourceType: client_1.AuditResourceType.ORDER,
            resourceId: 'order-1',
            resourceLabel: 'ORD-001',
            targetUserId: 'user-2',
            orderId: 'order-1',
            deliveryId: null,
            conversationId: null,
            messageId: null,
            branchId: 'branch-1',
            metadataJson: { reasonCode: 'manual_review' },
            ipAddress: '127.0.0.1',
            userAgent: 'jest',
            createdAt: new Date('2026-04-23T13:00:00.000Z'),
            actorUser: {
                id: 'user-1',
                role: client_1.UserRole.ADMIN,
                phone: '+959123456789',
            },
            targetUser: {
                id: 'user-2',
                role: client_1.UserRole.CUSTOMER,
                phone: '+959111111111',
            },
            order: {
                id: 'order-1',
                orderCode: 'ORD-001',
                status: 'CANCELLED',
            },
            delivery: null,
            conversation: null,
            message: null,
            branch: {
                id: 'branch-1',
                name: 'Downtown Branch',
            },
        });
        await expect(service.logAction({
            actorUserId: 'user-1',
            actorRole: client_1.UserRole.ADMIN,
            action: 'order.cancelled_by_admin',
            resourceType: client_1.AuditResourceType.ORDER,
            resourceId: 'order-1',
        })).resolves.toMatchObject({
            auditLogId: 'audit-1',
            orderCode: 'ORD-001',
            branchName: 'Downtown Branch',
            actorUser: {
                userId: 'user-1',
                role: client_1.UserRole.ADMIN,
            },
        });
    });
    it('lists recent audit logs', async () => {
        repository.listRecent.mockResolvedValue([
            {
                id: 'audit-2',
                actorType: client_1.AuditActorType.SYSTEM,
                actorUserId: null,
                actorRole: null,
                actionSource: client_1.AuditActionSource.JOB,
                action: 'notifications.push_queued',
                resourceType: client_1.AuditResourceType.NOTIFICATION,
                resourceId: 'notification-1',
                resourceLabel: null,
                targetUserId: null,
                orderId: null,
                deliveryId: null,
                conversationId: null,
                messageId: null,
                branchId: null,
                metadataJson: null,
                ipAddress: null,
                userAgent: null,
                createdAt: new Date('2026-04-23T13:30:00.000Z'),
                actorUser: null,
                targetUser: null,
                order: null,
                delivery: null,
                conversation: null,
                message: null,
                branch: null,
            },
        ]);
        await expect(service.listRecent()).resolves.toMatchObject([
            {
                auditLogId: 'audit-2',
                actorType: client_1.AuditActorType.SYSTEM,
                actionSource: client_1.AuditActionSource.JOB,
                resourceType: client_1.AuditResourceType.NOTIFICATION,
            },
        ]);
    });
    it('lists audit logs by resource', async () => {
        repository.findByResource.mockResolvedValue([]);
        await service.listByResource(client_1.AuditResourceType.MESSAGE, 'message-1');
        expect(repository.findByResource).toHaveBeenCalledWith(client_1.AuditResourceType.MESSAGE, 'message-1', 50);
    });
    it('lists audit logs by order id', async () => {
        repository.findByOrderId.mockResolvedValue([]);
        await service.listByOrderId('order-9', 10);
        expect(repository.findByOrderId).toHaveBeenCalledWith('order-9', 10);
    });
});
//# sourceMappingURL=audit.service.spec.js.map