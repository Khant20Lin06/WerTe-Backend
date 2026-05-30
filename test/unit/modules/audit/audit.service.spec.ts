import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  UserRole,
} from '@prisma/client';

import { AuditRepository } from '../../../../src/modules/audit/repositories/audit.repository';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<AuditRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      listRecent: jest.fn(),
      findByResource: jest.fn(),
      findByOrderId: jest.fn(),
    } as unknown as jest.Mocked<AuditRepository>;

    service = new AuditService(repository);
  });

  it('logs an audit action and returns the mapped entity', async () => {
    repository.create.mockResolvedValue({
      id: 'audit-1',
      actorType: AuditActorType.USER,
      actorUserId: 'user-1',
      actorRole: UserRole.ADMIN,
      actionSource: AuditActionSource.API,
      action: 'order.cancelled_by_admin',
      resourceType: AuditResourceType.ORDER,
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
        role: UserRole.ADMIN,
        phone: '+959123456789',
      },
      targetUser: {
        id: 'user-2',
        role: UserRole.CUSTOMER,
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
    } as never);

    await expect(
      service.logAction({
        actorUserId: 'user-1',
        actorRole: UserRole.ADMIN,
        action: 'order.cancelled_by_admin',
        resourceType: AuditResourceType.ORDER,
        resourceId: 'order-1',
      }),
    ).resolves.toMatchObject({
      auditLogId: 'audit-1',
      orderCode: 'ORD-001',
      branchName: 'Downtown Branch',
      actorUser: {
        userId: 'user-1',
        role: UserRole.ADMIN,
      },
    });
  });

  it('lists recent audit logs', async () => {
    repository.listRecent.mockResolvedValue([
      {
        id: 'audit-2',
        actorType: AuditActorType.SYSTEM,
        actorUserId: null,
        actorRole: null,
        actionSource: AuditActionSource.JOB,
        action: 'notifications.push_queued',
        resourceType: AuditResourceType.NOTIFICATION,
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
    ] as never[]);

    await expect(service.listRecent()).resolves.toMatchObject([
      {
        auditLogId: 'audit-2',
        actorType: AuditActorType.SYSTEM,
        actionSource: AuditActionSource.JOB,
        resourceType: AuditResourceType.NOTIFICATION,
      },
    ]);
  });

  it('lists audit logs by resource', async () => {
    repository.findByResource.mockResolvedValue([] as never[]);

    await service.listByResource(AuditResourceType.MESSAGE, 'message-1');

    expect(repository.findByResource).toHaveBeenCalledWith(
      AuditResourceType.MESSAGE,
      'message-1',
      50,
    );
  });

  it('lists audit logs by order id', async () => {
    repository.findByOrderId.mockResolvedValue([] as never[]);

    await service.listByOrderId('order-9', 10);

    expect(repository.findByOrderId).toHaveBeenCalledWith('order-9', 10);
  });
});
