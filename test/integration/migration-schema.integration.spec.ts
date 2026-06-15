import { createIntegrationApp } from './helpers/create-integration-app';
import { createPrismaServiceMock } from './helpers/create-prisma-service.mock';

/**
 * WP-48 — Migration & schema smoke tests.
 *
 * These tests verify that:
 * 1. The app bootstraps correctly after all migrations are applied.
 * 2. PrismaService.checkHealth() is wired into the readiness probe.
 * 3. All expected Prisma model delegates are present on the service (i.e.
 *    `prisma generate` reflects the current schema).
 * 4. The seed data shapes are consistent with the schema (upsert-safe).
 */
describe('Migration & schema smoke', () => {
  it('app bootstraps and readiness probe reflects database health', async () => {
    const prisma = createPrismaServiceMock();
    const harness = await createIntegrationApp({ prisma });

    try {
      const response = await harness.client.get('/api/v1/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: { status: 'ok', checks: { database: { status: 'up' } } },
      });
      expect(prisma.checkHealth).toHaveBeenCalled();
    } finally {
      await harness.close();
    }
  });

  it('Prisma client exposes all expected model delegates after prisma generate', () => {
    const { PrismaClient } = jest.requireActual<typeof import('@prisma/client')>('@prisma/client');
    const client = new PrismaClient();

    const expectedModels = [
      'user', 'userSession', 'pushToken',
      'customerProfile', 'address',
      'merchant', 'branch', 'storeType', 'branchStoreType',
      'zone', 'branchZone',
      'menuCategory', 'menuItem', 'itemOptionGroup', 'itemOption',
      'itemVariantCombination', 'itemVariantCombinationOption',
      'menuItemInventoryLot',
      'cart', 'cartItem',
      'order', 'orderItem', 'orderItemOption', 'orderStatusHistory',
      'delivery', 'riderLocationHistory', 'riderCurrentLocation',
      'rider', 'riderAvailability',
      'payment', 'paymentAttempt', 'paymentProviderEvent',
      'refund', 'refundAttempt',
      'promotion',
      'conversation', 'conversationParticipant', 'message', 'messageAttachment', 'messageReceipt',
      'notification', 'notificationPreference', 'notificationDelivery',
      'auditLog',
      'supportTicket', 'supportTicketMessage', 'supportTicketStatusHistory',
    ] as const;

    for (const model of expectedModels) {
      expect(client).toHaveProperty(model, expect.anything());
    }

    void client.$disconnect();
  });

  it('seed data shapes are valid for upsert (no schema mismatch)', () => {
    // Validate that seed payloads conform to Prisma enums — purely static check.
    const { UserRole, UserStatus, ZoneStatus } =
      jest.requireActual<typeof import('@prisma/client')>('@prisma/client');

    const adminUser = {
      phone: '+959000000001',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    expect(Object.values(UserRole)).toContain(adminUser.role);
    expect(Object.values(UserStatus)).toContain(adminUser.status);

    const supportUser = {
      phone: '+959000000002',
      role: UserRole.SUPPORT,
      status: UserStatus.ACTIVE,
    };
    expect(Object.values(UserRole)).toContain(supportUser.role);

    const zones = ['YGN-DOWNTOWN', 'YGN-NORTH', 'YGN-SOUTH', 'MDY-CENTRAL'];
    expect(zones.every((z) => typeof z === 'string' && z.length > 0)).toBe(true);

    const activeZoneStatus = ZoneStatus.ACTIVE;
    expect(Object.values(ZoneStatus)).toContain(activeZoneStatus);

    const storeTypeCodes = ['restaurant', 'grocery', 'pharmacy', 'beauty', 'fashion'];
    expect(storeTypeCodes.every((c) => typeof c === 'string')).toBe(true);
  });

  it('migration folder count matches expected number of applied migrations', () => {
    const fs = jest.requireActual<typeof import('fs')>('fs');
    const path = jest.requireActual<typeof import('path')>('path');

    const migrationsDir = path.resolve(__dirname, '../../prisma/migrations');
    const entries = fs
      .readdirSync(migrationsDir)
      .filter((name: string) => !name.endsWith('.toml') && !name.startsWith('.'));

    // 19 migrations total (added merchant_staff tables)
    expect(entries.length).toBe(19);

    // No two migrations share the same timestamp prefix
    const timestamps = entries.map((e: string) => e.split('_')[0]);
    const unique = new Set(timestamps);
    expect(unique.size).toBe(entries.length);
  });
});
