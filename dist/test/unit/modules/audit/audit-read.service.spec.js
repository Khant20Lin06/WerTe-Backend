"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const audit_read_service_1 = require("../../../../src/modules/audit/services/audit-read.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AuditReadService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    it('lists recent audit logs for admins', async () => {
        const auditService = {
            listRecent: jest.fn().mockResolvedValue([]),
        };
        const service = new audit_read_service_1.AuditReadService(auditService);
        await service.listAdminAuditLogs(currentUser, { limit: 25 });
        expect(auditService.listRecent).toHaveBeenCalledWith(25);
    });
    it('lists order audit logs for admins', async () => {
        const auditService = {
            listByOrderId: jest.fn().mockResolvedValue([]),
        };
        const service = new audit_read_service_1.AuditReadService(auditService);
        await service.listAdminOrderAuditLogs(currentUser, 'order_1', { limit: 10 });
        expect(auditService.listByOrderId).toHaveBeenCalledWith('order_1', 10);
    });
    it('lists resource audit logs for admins', async () => {
        const auditService = {
            listByResource: jest.fn().mockResolvedValue([]),
        };
        const service = new audit_read_service_1.AuditReadService(auditService);
        await service.listAdminResourceAuditLogs(currentUser, 'MESSAGE', 'message_1', { limit: 5 });
        expect(auditService.listByResource).toHaveBeenCalledWith('MESSAGE', 'message_1', 5);
    });
    it('lists branch menu scope audit logs for admins', async () => {
        const auditService = {
            listBranchMenuScopeLogs: jest.fn().mockResolvedValue([]),
        };
        const service = new audit_read_service_1.AuditReadService(auditService);
        await service.listAdminBranchMenuScopeAuditLogs(currentUser, 'branch_1', {
            limit: 15,
        });
        expect(auditService.listBranchMenuScopeLogs).toHaveBeenCalledWith('branch_1', 15);
    });
    it('rejects non-admin audit reads', async () => {
        const auditService = {};
        const service = new audit_read_service_1.AuditReadService(auditService);
        expect(() => service.listAdminAuditLogs((0, authenticated_user_factory_1.makeAuthenticatedUser)(), {})).toThrow(app_exception_1.AppException);
    });
});
//# sourceMappingURL=audit-read.service.spec.js.map