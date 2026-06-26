"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaServiceMock = createPrismaServiceMock;
function createDelegateMock() {
    const target = {};
    return new Proxy(target, {
        get(currentTarget, property) {
            if (!(property in currentTarget)) {
                currentTarget[property] = jest.fn();
            }
            return currentTarget[property];
        },
    });
}
function createPrismaServiceMock(overrides) {
    const delegates = new Map();
    const base = {
        checkHealth: jest.fn().mockResolvedValue({
            latencyMs: 1,
            status: 'up',
        }),
        runInTransaction: jest.fn(async (callback) => callback(createDelegateMock())),
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]),
        ...overrides,
    };
    return new Proxy(base, {
        get(target, property) {
            if (property in target) {
                return target[property];
            }
            if (!delegates.has(property)) {
                delegates.set(property, createDelegateMock());
            }
            return delegates.get(property);
        },
    });
}
//# sourceMappingURL=create-prisma-service.mock.js.map