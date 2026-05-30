import { AdminReportsController } from '../../../../src/modules/reports/controllers/admin-reports.controller';
import { AdminReportsService } from '../../../../src/modules/reports/services/admin-reports.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminReportsController', () => {
  const currentUser = makeAuthenticatedUser();

  it('delegates inventory alert overview lookup to the reports service', async () => {
    const adminReportsService = {
      getInventoryAlertOverview: jest
        .fn()
        .mockResolvedValue({ totalAlertsCount: 3 }),
    } as unknown as jest.Mocked<AdminReportsService>;
    const controller = new AdminReportsController(adminReportsService);

    await expect(
      controller.overview(currentUser, {
        days: 7,
        branchId: 'branch_1',
      }),
    ).resolves.toMatchObject({
      totalAlertsCount: 3,
    });

    expect(adminReportsService.getInventoryAlertOverview).toHaveBeenCalledWith(
      currentUser,
      {
        days: 7,
        branchId: 'branch_1',
      },
    );
  });

  it('delegates inventory alert trend lookup to the reports service', async () => {
    const adminReportsService = {
      getInventoryAlertTrends: jest.fn().mockResolvedValue({
        periodDays: 7,
        buckets: [],
      }),
    } as unknown as jest.Mocked<AdminReportsService>;
    const controller = new AdminReportsController(adminReportsService);

    await expect(
      controller.trends(currentUser, {
        merchantUserId: 'usr_merchant_1',
      }),
    ).resolves.toMatchObject({
      periodDays: 7,
      buckets: [],
    });

    expect(adminReportsService.getInventoryAlertTrends).toHaveBeenCalledWith(
      currentUser,
      {
        merchantUserId: 'usr_merchant_1',
      },
    );
  });
});
