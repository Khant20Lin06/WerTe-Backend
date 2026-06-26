"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_service_1 = require("../../src/app.service");
describe('AppService', () => {
    const makePrisma = (healthResult = { latencyMs: 12, status: 'up' }) => ({
        checkHealth: jest.fn().mockResolvedValue(healthResult),
    });
    const makeRedis = () => ({
        ping: jest.fn().mockResolvedValue('PONG'),
    });
    const makeQueueService = (handlerCount = 1) => ({
        listRegisteredHandlers: jest.fn().mockReturnValue(Array.from({ length: handlerCount }, (_, i) => ({
            queueName: 'test',
            jobName: `job_${i}`,
        }))),
    });
    it('returns a live status payload', () => {
        const service = new app_service_1.AppService(makePrisma(), makeRedis(), makeQueueService());
        const result = service.live();
        expect(result.status).toBe('ok');
        expect(result.timestamp).toEqual(expect.any(String));
    });
    it('returns ok when all checks pass', async () => {
        const prisma = makePrisma();
        const service = new app_service_1.AppService(prisma, makeRedis(), makeQueueService());
        const result = await service.ready();
        expect(prisma.checkHealth).toHaveBeenCalledTimes(1);
        expect(result.status).toBe('ok');
        expect(result.checks.database).toEqual({ latencyMs: 12, status: 'up' });
        expect(result.checks.cache).toMatchObject({ status: 'up' });
        expect(result.checks.queue).toMatchObject({ status: 'up' });
    });
    it('returns degraded when database is down', async () => {
        const prisma = {
            checkHealth: jest.fn().mockRejectedValue(new Error('Connection refused')),
        };
        const service = new app_service_1.AppService(prisma, makeRedis(), makeQueueService());
        const result = await service.ready();
        expect(result.status).toBe('degraded');
        expect(result.checks.database).toMatchObject({ status: 'down' });
    });
    it('returns degraded when Redis is down', async () => {
        const redis = {
            ping: jest.fn().mockRejectedValue(new Error('Redis unreachable')),
        };
        const service = new app_service_1.AppService(makePrisma(), redis, makeQueueService());
        const result = await service.ready();
        expect(result.status).toBe('degraded');
        expect(result.checks.cache).toMatchObject({ status: 'down' });
    });
    it('returns degraded when no queue handlers are registered', async () => {
        const service = new app_service_1.AppService(makePrisma(), makeRedis(), makeQueueService(0));
        const result = await service.ready();
        expect(result.status).toBe('degraded');
        expect(result.checks.queue).toMatchObject({ status: 'down' });
    });
});
//# sourceMappingURL=app.service.spec.js.map