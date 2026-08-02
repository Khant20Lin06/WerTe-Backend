import { AppLogger } from '../../infrastructure/logging/app.logger';

const DEFAULT_TIMEOUT_MS = 3_000;

/**
 * Runs a post-commit side effect that must never fail the caller's request
 * or stall it for long. The primary operation (an order, a status change,
 * etc.) is already saved by the time these run — a failure or a hang here
 * is logged and swallowed rather than propagated or awaited indefinitely.
 *
 * The timeout matters independently of error handling: some dependencies
 * (BullMQ's Redis connection in particular) are configured with
 * `maxRetriesPerRequest: null` because BullMQ manages its own retry
 * semantics — that setting is required for BullMQ's reliability guarantees,
 * but it also means a command issued while that connection is mid-reconnect
 * can sit unresolved for many seconds rather than rejecting quickly. A
 * try/catch alone doesn't help if the promise never settles, so this races
 * the operation against a timeout rather than just catching its rejection.
 * Verified live: without the timeout race, a single order placement with
 * Redis down took 11+ seconds and tripped the global request timeout,
 * turning an otherwise-successful order into a 500 for the customer.
 */
export async function runBestEffort(
  description: string,
  fn: () => Promise<unknown>,
  logger: AppLogger,
  context: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  try {
    await Promise.race([
      fn(),
      new Promise((_resolve, reject) => {
        setTimeout(
          () => reject(new Error(`Timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } catch (error) {
    logger.errorEvent(
      `Post-commit side effect failed: ${description}.`,
      { error: String(error) },
      context,
    );
  }
}
