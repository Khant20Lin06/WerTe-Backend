import { UserRole } from '@prisma/client';

import { AuthRepository } from '../../src/modules/auth/repositories/auth.repository';
import { UsersService } from '../../src/modules/users/services/users.service';
import { createAuthSessionHarness } from '../integration/helpers/create-auth-session-harness';
import { createIntegrationApp } from '../integration/helpers/create-integration-app';

/**
 * E2E tests — full NestJS stack started on a random port, hit over HTTP.
 *
 * Every request goes through: middleware → guards → pipes → controller → interceptors.
 *
 * prom-client registers metrics globally per process. Running multiple
 * createIntegrationApp() calls within one test process causes "metric already
 * registered" errors. To avoid this, each describe block spins up exactly one
 * app instance via beforeAll/afterAll.
 */

describe('E2E — System infrastructure', () => {
  let harness: Awaited<ReturnType<typeof createIntegrationApp>>;

  beforeAll(async () => {
    harness = await createIntegrationApp();
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
    // In the mock test environment, Redis and queue checks may report degraded.
    // Assert that the response has the correct shape and database is up.
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
    expect(res.body as string).toMatch(/^#\s+(HELP|TYPE)/m);
  });
});

describe('E2E — Authentication guard', () => {
  let harness: Awaited<ReturnType<typeof createIntegrationApp>>;

  beforeAll(async () => {
    harness = await createIntegrationApp();
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
  // A single app instance holds both MERCHANT and CUSTOMER sessions so that
  // both role-check scenarios use the same overridden AuthRepository mock.
  let harness: Awaited<ReturnType<typeof createIntegrationApp>>;
  let merchantToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'merchant',
        userId: 'usr_merchant_roles',
        role: UserRole.MERCHANT,
        phone: '09111111111',
        sessionId: 'sess_roles_merchant',
        merchantId: 'merchant_1',
      },
      {
        key: 'customer',
        userId: 'usr_customer_roles',
        role: UserRole.CUSTOMER,
        phone: '09222222222',
        sessionId: 'sess_roles_customer',
        customerProfileId: 'cust_prof_roles',
      },
    ] as const);

    harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
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
  let harness: Awaited<ReturnType<typeof createIntegrationApp>>;
  let customerToken: string;

  beforeAll(async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'customer',
        userId: 'usr_customer_validation',
        role: UserRole.CUSTOMER,
        phone: '09333333333',
        sessionId: 'sess_validation_customer',
        customerProfileId: 'cust_prof_validation',
      },
    ] as const);

    harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
      ],
    });
    customerToken = auth.actors.customer.accessToken;
  });

  afterAll(async () => {
    await harness.close();
  });

  it('returns 400 with validation details when a required query param is missing', async () => {
    // branchId is required on GET /customer/cart — omitting it triggers ValidationPipe 400.
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
    // limit=9999 violates @Max(100) in the notifications list DTO → 400.
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
