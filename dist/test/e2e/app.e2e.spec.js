"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_repository_1 = require("../../src/modules/auth/repositories/auth.repository");
const users_service_1 = require("../../src/modules/users/services/users.service");
const create_auth_session_harness_1 = require("../integration/helpers/create-auth-session-harness");
const create_integration_app_1 = require("../integration/helpers/create-integration-app");
describe('E2E — System infrastructure', () => {
    let harness;
    beforeAll(async () => {
        harness = await (0, create_integration_app_1.createIntegrationApp)();
    });
    afterAll(async () => {
        await harness.close();
    });
    it('GET /api/v1/health/live returns 200 with liveness payload', async () => {
        const res = await harness.client.get('/api/v1/health/live');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: { status: 'ok' },
        });
    });
    it('GET /api/v1/health/ready returns 200 and reports database component', async () => {
        const res = await harness.client.get('/api/v1/health/ready');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: {
                checks: {
                    database: { status: 'up' },
                },
            },
        });
    });
    it('GET /api/v1/metrics returns Prometheus text format', async () => {
        const res = await harness.client.get('/api/v1/metrics');
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toMatch(/^#\s+(HELP|TYPE)/m);
    });
});
describe('E2E — Authentication guard', () => {
    let harness;
    beforeAll(async () => {
        harness = await (0, create_integration_app_1.createIntegrationApp)();
    });
    afterAll(async () => {
        await harness.close();
    });
    it('returns 401 when Authorization header is absent on a protected route', async () => {
        const res = await harness.client.get('/api/v1/customer/cart?branchId=branch_1');
        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'UNAUTHORIZED' },
        });
    });
    it('returns 401 when Authorization header carries a malformed token', async () => {
        const res = await harness.client.get('/api/v1/customer/cart?branchId=branch_1', {
            headers: { authorization: 'Bearer not-a-real-jwt' },
        });
        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'UNAUTHORIZED' },
        });
    });
});
describe('E2E — Roles guard', () => {
    let harness;
    let merchantToken;
    let customerToken;
    beforeAll(async () => {
        const auth = await (0, create_auth_session_harness_1.createAuthSessionHarness)([
            {
                key: 'merchant',
                userId: 'usr_merchant_roles',
                role: client_1.UserRole.MERCHANT,
                phone: '09111111111',
                sessionId: 'sess_roles_merchant',
                merchantId: 'merchant_1',
            },
            {
                key: 'customer',
                userId: 'usr_customer_roles',
                role: client_1.UserRole.CUSTOMER,
                phone: '09222222222',
                sessionId: 'sess_roles_customer',
                customerProfileId: 'cust_prof_roles',
            },
        ]);
        harness = await (0, create_integration_app_1.createIntegrationApp)({
            overrides: [
                { provide: auth_repository_1.AuthRepository, useValue: auth.authRepository },
                { provide: users_service_1.UsersService, useValue: auth.usersService },
            ],
        });
        merchantToken = auth.actors.merchant.accessToken;
        customerToken = auth.actors.customer.accessToken;
    });
    afterAll(async () => {
        await harness.close();
    });
    it('returns 403 when a MERCHANT token hits a CUSTOMER-only route', async () => {
        const res = await harness.client
            .withBearerToken(merchantToken)
            .get('/api/v1/customer/cart?branchId=branch_1');
        expect(res.status).toBe(403);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'FORBIDDEN' },
        });
    });
    it('returns 403 when a CUSTOMER token hits an ADMIN-only route', async () => {
        const res = await harness.client
            .withBearerToken(customerToken)
            .get('/api/v1/admin/store-types');
        expect(res.status).toBe(403);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'FORBIDDEN' },
        });
    });
});
describe('E2E — ValidationPipe and Pagination limit guard', () => {
    let harness;
    let customerToken;
    beforeAll(async () => {
        const auth = await (0, create_auth_session_harness_1.createAuthSessionHarness)([
            {
                key: 'customer',
                userId: 'usr_customer_validation',
                role: client_1.UserRole.CUSTOMER,
                phone: '09333333333',
                sessionId: 'sess_validation_customer',
                customerProfileId: 'cust_prof_validation',
            },
        ]);
        harness = await (0, create_integration_app_1.createIntegrationApp)({
            overrides: [
                { provide: auth_repository_1.AuthRepository, useValue: auth.authRepository },
                { provide: users_service_1.UsersService, useValue: auth.usersService },
            ],
        });
        customerToken = auth.actors.customer.accessToken;
    });
    afterAll(async () => {
        await harness.close();
    });
    it('returns 400 with validation details when a required query param is missing', async () => {
        const res = await harness.client
            .withBearerToken(customerToken)
            .get('/api/v1/customer/cart');
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'BAD_REQUEST' },
        });
    });
    it('returns 400 when limit query param exceeds 100 on a paginated endpoint', async () => {
        const res = await harness.client
            .withBearerToken(customerToken)
            .get('/api/v1/notifications?limit=9999');
        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            error: {},
        });
    });
});
//# sourceMappingURL=app.e2e.spec.js.map