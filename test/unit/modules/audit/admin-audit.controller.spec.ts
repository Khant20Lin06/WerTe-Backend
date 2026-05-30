import { UserRole, UserStatus } from '@prisma/client';

import { AdminAuditController } from '../../../../src/modules/audit/controllers/admin-audit.controller';
import { AuditReadService } from '../../../../src/modules/audit/services/audit-read.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminAuditController', () => {
  const currentUser = makeAuthenticatedUser({
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  it('delegates recent audit log listing to the read service', async () => {
    const auditReadService = {
      listAdminAuditLogs: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditReadService>;
    const controller = new AdminAuditController(auditReadService);

    await controller.list(currentUser, { limit: 20 });

    expect(auditReadService.listAdminAuditLogs).toHaveBeenCalledWith(
      currentUser,
      { limit: 20 },
    );
  });

  it('delegates order audit log listing to the read service', async () => {
    const auditReadService = {
      listAdminOrderAuditLogs: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditReadService>;
    const controller = new AdminAuditController(auditReadService);

    await controller.listOrderLogs(currentUser, 'order_1', { limit: 10 });

    expect(auditReadService.listAdminOrderAuditLogs).toHaveBeenCalledWith(
      currentUser,
      'order_1',
      { limit: 10 },
    );
  });

  it('delegates resource audit log listing to the read service', async () => {
    const auditReadService = {
      listAdminResourceAuditLogs: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditReadService>;
    const controller = new AdminAuditController(auditReadService);

    await controller.listResourceLogs(
      currentUser,
      'MESSAGE',
      'message_1',
      { limit: 5 },
    );

    expect(auditReadService.listAdminResourceAuditLogs).toHaveBeenCalledWith(
      currentUser,
      'MESSAGE',
      'message_1',
      { limit: 5 },
    );
  });

  it('delegates branch menu scope audit log listing to the read service', async () => {
    const auditReadService = {
      listAdminBranchMenuScopeAuditLogs: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<AuditReadService>;
    const controller = new AdminAuditController(auditReadService);

    await controller.listBranchMenuScopeLogs(currentUser, 'branch_1', {
      limit: 12,
    });

    expect(auditReadService.listAdminBranchMenuScopeAuditLogs).toHaveBeenCalledWith(
      currentUser,
      'branch_1',
      { limit: 12 },
    );
  });
});
