import { AppLogger } from '../../../src/infrastructure/logging/app.logger';

export function createAppLoggerMock(): jest.Mocked<AppLogger> {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
    setLogLevels: jest.fn(),
    logEvent: jest.fn(),
    warnEvent: jest.fn(),
    errorEvent: jest.fn(),
    debugEvent: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;
}
