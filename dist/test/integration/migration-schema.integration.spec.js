"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_integration_app_1 = require("./helpers/create-integration-app");
const create_prisma_service_mock_1 = require("./helpers/create-prisma-service.mock");
describe('Migration & schema smoke', () => {
    it('app bootstraps and readiness probe reflects database health', async () => {
        const prisma = (0, create_prisma_service_mock_1.createPrismaServiceMock)();
        const harness = await (0, create_integration_app_1.createIntegrationApp)({ prisma });
        try {
            const response = await harness.client.get('/api/v1/health/ready');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                data: { status: 'ok', checks: { database: { status: 'up' } } },
            });
            expect(prisma.checkHealth).toHaveBeenCalled();
        }
        finally {
            await harness.close();
        }
    });
    it('Prisma client exposes all expected model delegates after prisma generate', () => {
        const { PrismaClient } = jest.requireActual('@prisma/client');
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
        ];
        for (const model of expectedModels) {
            expect(client).toHaveProperty(model, expect.anything());
        }
        void client.$disconnect();
    });
    it('seed data shapes are valid for upsert (no schema mismatch)', () => {
        const { UserRole, UserStatus, ZoneStatus } = jest.requireActual('@prisma/client');
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
        const fs = jest.requireActual('fs');
        const path = jest.requireActual('path');
        const migrationsDir = path.resolve(__dirname, '../../prisma/migrations');
        const entries = fs
            .readdirSync(migrationsDir)
            .filter((name) => !name.endsWith('.toml') && !name.startsWith('.'));
        expect(entries.length).toBe(19);
        const timestamps = entries.map((e) => e.split('_')[0]);
        const unique = new Set(timestamps);
        expect(unique.size).toBe(entries.length);
    });
});
//# sourceMappingURL=migration-schema.integration.spec.js.map