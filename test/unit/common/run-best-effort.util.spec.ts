import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { runBestEffort } from '../../../src/common/utils/run-best-effort.util';

describe('runBestEffort', () => {
  const makeLogger = () =>
    ({ errorEvent: jest.fn() }) as unknown as jest.Mocked<AppLogger>;

  it('resolves silently when the operation succeeds', async () => {
    const logger = makeLogger();
    const fn = jest.fn().mockResolvedValue('ok');

    await runBestEffort('do the thing', fn, logger, 'TestContext');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(logger.errorEvent).not.toHaveBeenCalled();
  });

  it('swallows a rejection and logs it instead of throwing', async () => {
    const logger = makeLogger();
    const fn = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(
      runBestEffort('do the thing', fn, logger, 'TestContext'),
    ).resolves.toBeUndefined();

    expect(logger.errorEvent).toHaveBeenCalledWith(
      'Post-commit side effect failed: do the thing.',
      { error: expect.stringContaining('boom') },
      'TestContext',
    );
  });

  it('gives up and logs once the timeout elapses, even if the operation never settles', async () => {
    const logger = makeLogger();
    // Simulates the exact live-verified failure mode: a BullMQ command
    // issued while its Redis connection is mid-reconnect, which never
    // rejects on its own because maxRetriesPerRequest is null for that
    // connection.
    const neverSettles = jest.fn(() => new Promise<never>(() => {}));

    const start = Date.now();
    await runBestEffort('enqueue something', neverSettles, logger, 'TestContext', 50);
    const elapsed = Date.now() - start;

    // Bounded by the timeout, not left hanging.
    expect(elapsed).toBeLessThan(1_000);
    expect(logger.errorEvent).toHaveBeenCalledWith(
      'Post-commit side effect failed: enqueue something.',
      { error: expect.stringContaining('Timed out after 50ms') },
      'TestContext',
    );
  });

  it('does not log after a late resolution once the timeout has already fired', async () => {
    const logger = makeLogger();
    let resolveLate: (() => void) | undefined;
    const slowFn = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLate = resolve;
        }),
    );

    await runBestEffort('slow op', slowFn, logger, 'TestContext', 20);
    expect(logger.errorEvent).toHaveBeenCalledTimes(1);

    // Resolving after the fact must not cause a second, unhandled log call
    // or an unhandled rejection warning.
    resolveLate?.();
    await new Promise((r) => setTimeout(r, 10));
    expect(logger.errorEvent).toHaveBeenCalledTimes(1);
  });
});
