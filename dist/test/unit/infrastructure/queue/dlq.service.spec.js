"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dlq_service_1 = require("../../../../src/infrastructure/queue/dlq.service");
const mockRedis = {
    zadd: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    zcard: jest.fn().mockResolvedValue(0),
    zrange: jest.fn().mockResolvedValue([]),
    zrevrange: jest.fn().mockResolvedValue([]),
    zrem: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    scan: jest.fn().mockResolvedValue(['0', []]),
    on: jest.fn(),
};
jest.mock('ioredis', () => {
    const mock = jest.fn().mockImplementation(() => mockRedis);
    return { default: mock, __esModule: true };
});
describe('DlqService', () => {
    let service;
    const makeConfigService = () => ({
        getOrThrow: jest.fn().mockReturnValue('redis://localhost:6379'),
    });
    const makeLogger = () => ({
        errorEvent: jest.fn(),
        logEvent: jest.fn(),
    });
    const makeEntry = (overrides = {}) => ({
        id: 'job_123',
        queueName: 'provider-webhooks',
        jobName: 'process-payment-provider-event',
        payload: { paymentId: 'pay_1' },
        failedAt: '2026-06-19T10:00:00.000Z',
        lastError: 'Connection timeout',
        attempts: 3,
        createdAt: '2026-06-19T09:55:00.000Z',
        ...overrides,
    });
    beforeEach(() => {
        jest.clearAllMocks();
        service = new dlq_service_1.DlqService(makeConfigService(), makeLogger());
    });
    describe('push()', () => {
        it('stores serialized entry in a sorted set scored by failedAt timestamp', async () => {
            const entry = makeEntry();
            await service.push(entry);
            const expectedScore = new Date(entry.failedAt).getTime();
            expect(mockRedis.zadd).toHaveBeenCalledWith('dlq:provider-webhooks:process-payment-provider-event', expectedScore, JSON.stringify(entry));
        });
        it('sets 30-day TTL on the sorted set key', async () => {
            await service.push(makeEntry());
            expect(mockRedis.expire).toHaveBeenCalledWith('dlq:provider-webhooks:process-payment-provider-event', 60 * 60 * 24 * 30);
        });
        it('logs an error event with job details', async () => {
            const logger = makeLogger();
            service = new dlq_service_1.DlqService(makeConfigService(), logger);
            const entry = makeEntry();
            await service.push(entry);
            expect(logger.errorEvent).toHaveBeenCalledWith('Job moved to dead-letter queue.', expect.objectContaining({
                id: entry.id,
                queueName: entry.queueName,
                jobName: entry.jobName,
                attempts: entry.attempts,
                lastError: entry.lastError,
            }), 'DlqService');
        });
    });
    describe('list()', () => {
        it('returns empty array when no DLQ keys exist', async () => {
            mockRedis.scan.mockResolvedValueOnce(['0', []]);
            const result = await service.list();
            expect(result).toEqual([]);
        });
        it('returns parsed entries from a specific queue+job key, newest first', async () => {
            const entry1 = makeEntry({ id: 'job_1', failedAt: '2026-06-19T09:00:00.000Z' });
            const entry2 = makeEntry({ id: 'job_2', failedAt: '2026-06-19T10:00:00.000Z' });
            mockRedis.zrevrange.mockResolvedValueOnce([
                JSON.stringify(entry2),
                JSON.stringify(entry1),
            ]);
            const result = await service.list('provider-webhooks', 'process-payment-provider-event');
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('job_2');
            expect(result[1].id).toBe('job_1');
        });
        it('skips malformed entries without throwing', async () => {
            mockRedis.zrevrange.mockResolvedValueOnce([
                'not-valid-json',
                JSON.stringify(makeEntry()),
            ]);
            const result = await service.list('provider-webhooks', 'process-payment-provider-event');
            expect(result).toHaveLength(1);
        });
    });
    describe('count()', () => {
        it('returns zcard result for a specific queue+job', async () => {
            mockRedis.zcard.mockResolvedValueOnce(5);
            const result = await service.count('provider-webhooks', 'process-payment-provider-event');
            expect(result).toBe(5);
            expect(mockRedis.zcard).toHaveBeenCalledWith('dlq:provider-webhooks:process-payment-provider-event');
        });
        it('returns 0 when no DLQ keys exist (global count)', async () => {
            mockRedis.scan.mockResolvedValueOnce(['0', []]);
            const result = await service.count();
            expect(result).toBe(0);
        });
    });
    describe('remove()', () => {
        it('removes matching entry by jobId and returns true', async () => {
            const entry = makeEntry();
            mockRedis.zrange.mockResolvedValueOnce([JSON.stringify(entry)]);
            const result = await service.remove(entry.queueName, entry.jobName, entry.id);
            expect(result).toBe(true);
            expect(mockRedis.zrem).toHaveBeenCalledWith('dlq:provider-webhooks:process-payment-provider-event', JSON.stringify(entry));
        });
        it('returns false when jobId is not found', async () => {
            mockRedis.zrange.mockResolvedValueOnce([JSON.stringify(makeEntry({ id: 'other_job' }))]);
            const result = await service.remove('provider-webhooks', 'process-payment-provider-event', 'nonexistent');
            expect(result).toBe(false);
            expect(mockRedis.zrem).not.toHaveBeenCalled();
        });
    });
    describe('pruneExpired()', () => {
        it('returns 0 when no DLQ keys exist', async () => {
            mockRedis.scan.mockResolvedValueOnce(['0', []]);
            const result = await service.pruneExpired();
            expect(result).toBe(0);
        });
        it('removes entries older than 30 days and returns total removed count', async () => {
            mockRedis.scan.mockResolvedValueOnce([
                '0',
                ['dlq:provider-webhooks:process-payment-provider-event'],
            ]);
            mockRedis.zremrangebyscore.mockResolvedValueOnce(3);
            const result = await service.pruneExpired();
            expect(result).toBe(3);
            expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith('dlq:provider-webhooks:process-payment-provider-event', '-inf', expect.any(Number));
        });
    });
});
//# sourceMappingURL=dlq.service.spec.js.map