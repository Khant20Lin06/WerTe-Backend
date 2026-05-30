# Integration Test Harness

## Purpose

The integration suite boots a real Nest application and validates:

- route wiring
- guards and role checks
- DTO validation
- global interceptors and exception filters
- response envelope shape

It intentionally does **not** require a live Postgres or Redis instance. Prisma and Redis are overridden with mocks so the suite stays fast and deterministic.

## Key Files

- `test/integration/setup-env.ts`: default environment values required for app bootstrap.
- `test/integration/helpers/create-integration-app.ts`: bootstraps the Nest app with override support.
- `test/integration/helpers/create-prisma-service.mock.ts`: Prisma mock factory used by the harness.
- `test/integration/helpers/create-redis-service.mock.ts`: Redis mock factory used by the harness.
- `test/integration/helpers/create-auth-session-harness.ts`: reusable authenticated actor/session helper for guarded routes.
- `test/integration/helpers/critical-flow.fixtures.ts`: shared entities for cart, checkout, order, messaging, notification, and audit route tests.

## Recommended Pattern

1. Build auth fixtures with `createAuthSessionHarness(...)`.
2. Override business services instead of mocking deep repositories when testing route behavior.
3. Use `createIntegrationApp({ overrides: [...] })` to inject the service doubles you need.
4. Call routes through `IntegrationTestClient`.
5. Assert both HTTP status codes and response envelope shape.

## Authenticated Route Testing

Use `createAuthSessionHarness(...)` when a route is protected by JWT and roles.

It gives you:

- signed access tokens that match the configured JWT env values
- mocked `AuthRepository.findSessionById(...)`
- mocked `UsersService` actor-context helpers
- ready-to-use actor records for customer, merchant, rider, admin, or support flows

This keeps the real guards active while still avoiding database-backed session setup.

## When To Override Providers

Override a provider when:

- it performs real database work
- it depends on live Redis state
- it triggers side effects that are not relevant to the route contract
- you only want to assert controller orchestration and payload mapping

Good candidates:

- `CustomerCartService`
- `CheckoutPreviewService`
- `OrderCreationService`
- `MerchantOrderHandlingService`
- `DispatchAssignmentService`
- `MessagingRestService`
- `NotificationsRestService`
- `AuditReadService`

## Fixture Guidance

Keep fixture entities close to the DTO shapes returned by the controller layer.

Recommended rules:

- prefer entity-level fixtures over raw Prisma records
- use stable IDs like `order_1`, `branch_1`, `con_1`
- keep timestamps deterministic
- include only the nested fields the route actually serializes

When a new route needs a reusable payload, add it to `critical-flow.fixtures.ts` instead of duplicating literal objects across specs.

## Current Coverage

The harness currently covers:

- health endpoints
- customer commerce flow
- merchant/admin operations flow
- messaging, notifications, and audit route surfaces

## Next Extension Layer

If we want deeper realism later, the next step is not to replace this harness. It is to add a second layer with real Postgres/Redis-backed e2e tests on top of it.

That gives us:

- fast route-contract checks from the current harness
- slower but higher-fidelity infrastructure-backed scenarios for release confidence
