# Food Delivery Backend

NestJS modular monolith scaffold for a production-grade food delivery platform.

## Stack

- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- WebSocket gateway
- Swagger / OpenAPI

## Startup

### Docker Compose

1. Copy `.env.example` to `.env` if you need to customize secrets or ports for local work.
2. Run `npm run docker:up`.
3. Run `npm run docker:ps` to confirm `postgres`, `redis`, `migrate`, and `app` are healthy.
4. Run `npm run docker:smoke` to verify readiness through the public health endpoint.
5. Open `http://localhost:3000/api/v1` for the API and `http://localhost:3000/api/v1/health/live` for the liveness check.
6. Use `npm run docker:logs` to inspect the running application.
7. Stop the stack with `npm run docker:down`.

### Local Development

1. Copy `.env.example` to `.env`.
2. Run `docker compose up -d postgres redis`.
3. Run `npm install`.
4. Run `npm run prisma:prepare`.
5. Run `npm run prisma:migrate`.
6. Run `npm run start:dev`.
7. Run `npm run verify` before handing work off.

## Prisma Migrations

- The schema baseline is tracked in `prisma/migrations/20260424000100_initial_schema_baseline`.
- Use `pnpm run prisma:migrate:create` to create a new migration without applying it immediately.
- Use `pnpm run prisma:migrate` during development to create and apply local migrations.
- Use `pnpm run prisma:migrate:deploy` in production or CI to apply checked-in migrations.
- Use `pnpm run prisma:migrate:status` to verify migration state.
- Use `pnpm run prisma:migrate:reset` only for local reset workflows because it drops all data.

## Module Boundaries

- Domain modules live under `src/modules`.
- Shared concerns live in `src/common`.
- Technical adapters live in `src/infrastructure`.
- Background jobs live in `src/jobs`.

## Scripts

- `npm run typecheck`: strict TypeScript build check without emitting files.
- `npm run test:unit`: run the isolated unit suite.
- `npm run test:integration`: run the Nest integration harness with mocked Prisma/Redis providers.
- `npm run test:all`: run the unit and integration suites together.
- `npm run verify:quick`: validate Prisma config and run the build typecheck without running tests. Requires `.env` or equivalent Prisma env vars.
- `npm run verify`: run Prisma validation/generation, typecheck, unit tests, and integration tests in one command.
- `npm run docker:up`: build and start the Docker Compose stack.
- `npm run docker:down`: stop the Docker Compose stack.
- `npm run docker:ps`: inspect current Docker Compose service health and status.
- `npm run docker:logs`: tail application logs from Docker Compose.
- `npm run docker:migrate`: run the migrate container on demand.
- `npm run docker:smoke`: hit the readiness endpoint of the running Docker Compose app.
- `npm run prisma:prepare`: validate the Prisma schema and regenerate the client.

## Documentation

- See [docs/operations-runbook.md](C:/Users/Admin/OneDrive/Desktop/WerTee/food-delivery-backend/docs/operations-runbook.md) for the local workflow, migration runbook, testing strategy, and troubleshooting notes.
- See [docs/integration-test-harness.md](C:/Users/Admin/OneDrive/Desktop/WerTee/food-delivery-backend/docs/integration-test-harness.md) for how to extend the integration setup, auth harness, and flow fixtures.
