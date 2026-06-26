"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_reports_controller_1 = require("../../../../src/modules/reports/controllers/admin-reports.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AdminReportsController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)();
    it('delegates inventory alert overview lookup to the reports service', async () => {
        const adminReportsService = {
            getInventoryAlertOverview: jest
                .fn()
                .mockResolvedValue({ totalAlertsCount: 3 }),
        };
        const controller = new admin_reports_controller_1.AdminReportsController(adminReportsService);
        await expect(controller.overview(currentUser, {
            days: 7,
            branchId: 'branch_1',
        })).resolves.toMatchObject({
            totalAlertsCount: 3,
        });
        expect(adminReportsService.getInventoryAlertOverview).toHaveBeenCalledWith(currentUser, {
            days: 7,
            branchId: 'branch_1',
        });
    });
    it('delegates inventory alert trend lookup to the reports service', async () => {
        const adminReportsService = {
            getInventoryAlertTrends: jest.fn().mockResolvedValue({
                periodDays: 7,
                buckets: [],
            }),
        };
        const controller = new admin_reports_controller_1.AdminReportsController(adminReportsService);
        await expect(controller.trends(currentUser, {
            merchantUserId: 'usr_merchant_1',
        })).resolves.toMatchObject({
            periodDays: 7,
            buckets: [],
        });
        expect(adminReportsService.getInventoryAlertTrends).toHaveBeenCalledWith(currentUser, {
            merchantUserId: 'usr_merchant_1',
        });
    });
});
//# sourceMappingURL=admin-reports.controller.spec.js.map