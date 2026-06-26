"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const branch_cache_service_1 = require("../../../../src/modules/branches/services/branch-cache.service");
describe('BranchCacheService', () => {
    const makeBranch = (overrides) => ({
        id: 'br_1',
        merchantId: 'merch_1',
        name: 'Downtown Branch',
        contactPhone: '0942000000',
        line1: 'No. 10, Merchant Street',
        township: 'Botahtaung',
        latitude: new client_1.Prisma.Decimal('16.7792'),
        longitude: new client_1.Prisma.Decimal('96.1735'),
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.BranchStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        merchant: {
            id: 'merch_1',
            userId: 'usr_1',
            name: 'Tea House',
            storeType: 'restaurant',
            status: client_1.MerchantStatus.ACTIVE,
            user: {
                id: 'usr_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
            },
        },
        branchZones: [
            {
                zoneId: 'zone_1',
                zone: {
                    id: 'zone_1',
                    code: 'YGN-DT',
                    name: 'Downtown',
                    status: client_1.ZoneStatus.ACTIVE,
                },
            },
        ],
        operatingHours: null,
        staffAssignments: [],
        ...overrides,
    });
    const makeRedis = (stored = {}) => ({
        get: jest.fn((key) => Promise.resolve(stored[key] ?? null)),
        set: jest.fn(() => Promise.resolve('OK')),
        del: jest.fn(() => Promise.resolve(1)),
    });
    const makeCacheMetrics = () => ({
        hit: jest.fn(),
        miss: jest.fn(),
    });
    describe('getById', () => {
        it('returns null on cache miss', async () => {
            const service = new branch_cache_service_1.BranchCacheService(makeRedis(), makeCacheMetrics());
            expect(await service.getById('br_1')).toBeNull();
        });
        it('returns parsed record on cache hit', async () => {
            const branch = makeBranch();
            const serialized = JSON.stringify(branch);
            const redis = makeRedis({ 'branch:id:br_1': serialized });
            const service = new branch_cache_service_1.BranchCacheService(redis, makeCacheMetrics());
            const result = await service.getById('br_1');
            expect(result).toEqual(JSON.parse(serialized));
        });
    });
    describe('setById', () => {
        it('stores branch under id key with TTL', async () => {
            const redis = makeRedis();
            const service = new branch_cache_service_1.BranchCacheService(redis, makeCacheMetrics());
            const branch = makeBranch();
            await service.setById(branch);
            expect(redis.set).toHaveBeenCalledWith('branch:id:br_1', JSON.stringify(branch), 'EX', 600);
        });
    });
    describe('getListByMerchantId', () => {
        it('returns null on cache miss', async () => {
            const service = new branch_cache_service_1.BranchCacheService(makeRedis(), makeCacheMetrics());
            expect(await service.getListByMerchantId('merch_1')).toBeNull();
        });
        it('returns parsed array on cache hit', async () => {
            const branches = [makeBranch(), makeBranch({ id: 'br_2', name: 'North Branch' })];
            const serialized = JSON.stringify(branches);
            const redis = makeRedis({ 'branch:merchant:merch_1': serialized });
            const service = new branch_cache_service_1.BranchCacheService(redis, makeCacheMetrics());
            const result = await service.getListByMerchantId('merch_1');
            expect(result).toEqual(JSON.parse(serialized));
            expect(result).toHaveLength(2);
        });
    });
    describe('setListByMerchantId', () => {
        it('stores branch list under merchant key with TTL', async () => {
            const redis = makeRedis();
            const service = new branch_cache_service_1.BranchCacheService(redis, makeCacheMetrics());
            const branches = [makeBranch()];
            await service.setListByMerchantId('merch_1', branches);
            expect(redis.set).toHaveBeenCalledWith('branch:merchant:merch_1', JSON.stringify(branches), 'EX', 600);
        });
    });
    describe('invalidate', () => {
        it('deletes both id and merchant list keys', async () => {
            const redis = makeRedis();
            const service = new branch_cache_service_1.BranchCacheService(redis, makeCacheMetrics());
            await service.invalidate('br_1', 'merch_1');
            expect(redis.del).toHaveBeenCalledWith('branch:id:br_1', 'branch:merchant:merch_1');
        });
    });
});
//# sourceMappingURL=branch-cache.service.spec.js.map