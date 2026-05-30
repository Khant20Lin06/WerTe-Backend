# Operations Runbook

## Command Reference

- `npm run start:dev`: run the backend in watch mode for local development.
- `npm run build`: compile the NestJS application into `dist/`.
- `npm run start:prod`: run the compiled production build.
- `npm run typecheck`: run a strict TypeScript build check without emitting files.
- `npm run test:unit`: run the isolated unit test suite.
- `npm run test:integration`: run the mocked integration harness against a real Nest application instance.
- `npm run test:all`: run the unit and integration suites together.
- `npm run verify:quick`: validate Prisma config and regenerate the client before typechecking. Requires `.env` or equivalent Prisma env vars.
- `npm run verify`: run Prisma validation/generation, typecheck, unit tests, and integration tests in one command.
- `npm run docker:up`: build and start the Docker Compose stack.
- `npm run docker:down`: stop the Docker Compose stack.
- `npm run docker:ps`: inspect current Docker Compose container health and state.
- `npm run docker:logs`: tail application logs from the Docker Compose stack.
- `npm run docker:migrate`: run the migration container on demand.
- `npm run docker:smoke`: hit the readiness endpoint after the Docker stack starts.
- `npm run prisma:prepare`: validate the Prisma schema and regenerate the client.
- `npm run prisma:migrate`: create and apply a local Prisma migration.
- `npm run prisma:migrate:deploy`: apply checked-in Prisma migrations in CI or production.

## Local Development Workflow

1. Copy `.env.example` to `.env`.
2. Start infrastructure dependencies with `docker compose up -d postgres redis`.
3. Install packages with `npm install`.
4. Generate Prisma client with `npm run prisma:prepare`.
5. Apply the current schema with `npm run prisma:migrate`.
6. Start the backend with `npm run start:dev`.
7. Use `npm run verify` before handing work off or opening a PR.

## Docker Workflow

1. Ensure Docker Desktop or the Docker daemon is running.
2. Run `npm run docker:up`.
3. Run `npm run docker:ps` and confirm `postgres`, `redis`, `migrate`, and `app` are healthy.
4. Run `npm run docker:smoke` to confirm readiness through the API surface.
5. Use `npm run docker:logs` when investigating runtime issues.
6. Stop the stack with `npm run docker:down`.

## Provider Webhook Operations

- Payment callbacks enter through `POST /api/v1/provider-webhooks/:provider/payments`.
- Refund callbacks enter through `POST /api/v1/provider-webhooks/:provider/refunds`.
- Webhook routes are public by design, but payload trust is decided by HMAC signature verification and persisted verification status.
- The app reads provider secrets from the most specific environment variable first, for example `STRIPE_PAYMENT_WEBHOOK_SIGNING_SECRET`, then shared fallbacks such as `STRIPE_WEBHOOK_SIGNING_SECRET` and `PROVIDER_WEBHOOK_SIGNING_SECRET`.
- If no signing secret is configured, signature verification is marked `SKIPPED`; use that only for local or explicitly trusted provider environments.
- Accepted callbacks are persisted first and then queued on `provider-webhooks` with `process-payment-provider-event` or `process-refund-provider-event`.
- Lifecycle processing is idempotent: `PROCESSED` events are never replayed, while `FAILED` and `IGNORED` events can be retried by reconciliation.
- Reconciliation is wired as the `reconcile-provider-events` queue job and requeues processable payment/refund events with `retryTerminal: true`.
- A release handoff should check stored provider event rows for growing `RECEIVED`, `FAILED`, or `IGNORED` counts and confirm the `provider-webhooks` worker is running.

## Release Checklist

1. Confirm `.env` contains production-safe secrets and connection strings.
2. Run `npm run prisma:prepare`.
3. Run `npm run verify`.
4. Run `docker compose config` to verify the deployment manifest is valid.
5. Run `npm run docker:up`.
6. Run `npm run docker:smoke`.
7. Review `npm run docker:logs` for startup warnings before handing the environment over.

## Testing Strategy

- Unit tests live in `test/unit` and validate service, policy, controller, and job behavior in isolation.
- Integration tests live in `test/integration` and boot a real Nest application with mocked Prisma/Redis providers.
- The current integration harness intentionally validates route wiring, guards, DTO validation, interceptors, and response envelopes without requiring a live database.
- The next layer of production-hardening should add live infrastructure-backed integration or e2e flows on top of this harness.
- See [integration-test-harness.md](C:/Users/Admin/OneDrive/Desktop/WerTee/food-delivery-backend/docs/integration-test-harness.md) for the override/auth/fixture patterns used by the current flow tests.

## Migration Runbook

- Create a migration draft with `npm run prisma:migrate:create` when you want to review SQL before applying it.
- Apply local schema changes with `npm run prisma:migrate`.
- Check migration state with `npm run prisma:migrate:status`.
- Apply checked-in migrations with `npm run prisma:migrate:deploy` in production or CI.
- Use `npm run prisma:migrate:reset` only for disposable local environments because it drops all data.

## Troubleshooting

### Docker daemon is unavailable

If `docker compose` reports an error similar to `dockerDesktopLinuxEngine not found`, start Docker Desktop first and rerun the command.

### Prisma validation fails

- Confirm `.env` exists and contains a valid `DATABASE_URL`.
- Run `npm run prisma:validate` and `npm run prisma:generate` again after fixing environment variables.
- `npm run verify:quick` and `npm run verify` use the same Prisma env requirements, so they will fail until `DATABASE_URL` is available.

### Integration tests fail during bootstrap

- Confirm the required environment variables are still present in `test/integration/setup-env.ts`.
- If a new provider depends on Prisma or Redis at bootstrap time, override it in `test/integration/helpers/create-integration-app.ts`.
- If a protected route needs auth in an integration test, reuse `test/integration/helpers/create-auth-session-harness.ts` instead of bypassing guards.

### Application starts but health checks fail

- Check `DATABASE_URL` and `REDIS_URL`.
- Review application logs with `npm run docker:logs` or the local terminal output.
- Verify that `prisma migrate deploy` completed successfully in the `migrate` container before `app` starts.

### Docker smoke test fails

- Confirm the app container is healthy in `npm run docker:ps`.
- Check whether `APP_PORT` or `APP_PREFIX` were changed from the defaults.
- If the app was started outside Docker, rerun `npm run docker:smoke` only after the health endpoint is reachable at `http://127.0.0.1:3000/api/v1/health/ready`.
