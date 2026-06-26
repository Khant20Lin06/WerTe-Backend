"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppLoggerMock = createAppLoggerMock;
function createAppLoggerMock() {
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
    };
}
//# sourceMappingURL=create-app-logger.mock.js.map