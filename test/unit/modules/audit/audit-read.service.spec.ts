import { UserRole, UserStatus } from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { AuditReadService } from '../../../../src/modules/audit/services/audit-read.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AuditReadService', () => {
  const currentUser = makeAuthenticatedUser({
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('lists recent audit logs for admins', async () => {
    const auditService = {
      listRecent: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditReadService(auditService);

    await service.listAdminAuditLogs(currentUser, { limit: 25 });

    expect(auditService.listRecent).toHaveBeenCalledWith(25);
  });

  it('lists order audit logs for admins', async () => {
    const auditService = {
      listByOrderId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditReadService(auditService);

    await service.listAdminOrderAuditLogs(currentUser, 'order_1', { limit: 10 });

    expect(auditService.listByOrderId).toHaveBeenCalledWith('order_1', 10);
  });

  it('lists resource audit logs for admins', async () => {
    const auditService = {
      listByResource: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditReadService(auditService);

    await service.listAdminResourceAuditLogs(
      currentUser,
      'MESSAGE',
      'message_1',
      { limit: 5 },
    );

    expect(auditService.listByResource).toHaveBeenCalledWith(
      'MESSAGE',
      'message_1',
      5,
    );
  });

  it('lists branch menu scope audit logs for admins', async () => {
    const auditService = {
      listBranchMenuScopeLogs: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditReadService(auditService);

    await service.listAdminBranchMenuScopeAuditLogs(currentUser, 'branch_1', {
      limit: 15,
    });

    expect(auditService.listBranchMenuScopeLogs).toHaveBeenCalledWith(
      'branch_1',
      15,
    );
  });

  it('rejects non-admin audit reads', async () => {
    const auditService = {} as AuditService;
    const service = new AuditReadService(auditService);

    expect(() =>
      service.listAdminAuditLogs(makeAuthenticatedUser(), {}),
    ).toThrow(AppException);
  });
});
