"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisServiceMock = createRedisServiceMock;
function createRedisServiceMock(overrides) {
    return {
        connect: jest.fn(),
        disconnect: jest.fn(),
        quit: jest.fn(),
        duplicate: jest.fn(),
        status: 'ready',
        ping: jest.fn().mockResolvedValue('PONG'),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        pttl: jest.fn().mockResolvedValue(-2),
        ...overrides,
    };
}
//# sourceMappingURL=create-redis-service.mock.js.map