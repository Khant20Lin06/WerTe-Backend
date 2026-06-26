"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin_audit_controller_1 = require("../../../../src/modules/audit/controllers/admin-audit.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AdminAuditController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    it('delegates recent audit log listing to the read service', async () => {
        const auditReadService = {
            listAdminAuditLogs: jest.fn().mockResolvedValue([]),
        };
        const controller = new admin_audit_controller_1.AdminAuditController(auditReadService);
        await controller.list(currentUser, { limit: 20 });
        expect(auditReadService.listAdminAuditLogs).toHaveBeenCalledWith(currentUser, { limit: 20 });
    });
    it('delegates order audit log listing to the read service', async () => {
        const auditReadService = {
            listAdminOrderAuditLogs: jest.fn().mockResolvedValue([]),
        };
        const controller = new admin_audit_controller_1.AdminAuditController(auditReadService);
        await controller.listOrderLogs(currentUser, 'order_1', { limit: 10 });
        expect(auditReadService.listAdminOrderAuditLogs).toHaveBeenCalledWith(currentUser, 'order_1', { limit: 10 });
    });
    it('delegates resource audit log listing to the read service', async () => {
        const auditReadService = {
            listAdminResourceAuditLogs: jest.fn().mockResolvedValue([]),
        };
        const controller = new admin_audit_controller_1.AdminAuditController(auditReadService);
        await controller.listResourceLogs(currentUser, 'MESSAGE', 'message_1', { limit: 5 });
        expect(auditReadService.listAdminResourceAuditLogs).toHaveBeenCalledWith(currentUser, 'MESSAGE', 'message_1', { limit: 5 });
    });
    it('delegates branch menu scope audit log listing to the read service', async () => {
        const auditReadService = {
            listAdminBranchMenuScopeAuditLogs: jest.fn().mockResolvedValue([]),
        };
        const controller = new admin_audit_controller_1.AdminAuditController(auditReadService);
        await controller.listBranchMenuScopeLogs(currentUser, 'branch_1', {
            limit: 12,
        });
        expect(auditReadService.listAdminBranchMenuScopeAuditLogs).toHaveBeenCalledWith(currentUser, 'branch_1', { limit: 12 });
    });
});
//# sourceMappingURL=admin-audit.controller.spec.js.map