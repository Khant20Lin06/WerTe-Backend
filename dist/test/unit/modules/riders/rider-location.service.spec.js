"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_location_service_1 = require("../../../../src/modules/riders/services/rider-location.service");
function makeRider(overrides) {
    return {
        id: 'rider_1',
        userId: 'usr_rider_1',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Pabedan',
        status: client_1.RiderStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
        },
        availability: {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
        },
        ...overrides,
    };
}
function makeCurrentLocation(overrides) {
    return {
        riderId: 'rider_1',
        deliveryId: 'delivery_1',
        latitude: {
            toString: () => '16.834',
        },
        longitude: {
            toString: () => '96.176',
        },
        heading: null,
        speed: null,
        accuracyMeters: null,
        recordedAt: new Date('2026-04-19T10:12:00.000Z'),
        createdAt: new Date('2026-04-19T10:12:00.000Z'),
        updatedAt: new Date('2026-04-19T10:12:00.000Z'),
        ...overrides,
    };
}
describe('RiderLocationService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_rider_1',
        role: client_1.UserRole.RIDER,
        actorContext: {
            userId: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        },
    });
    const makeService = () => {
        const prisma = {
            runInTransaction: jest
                .fn()
                .mockImplementation(async (operation) => operation({})),
        };
        const riderAccountService = {
            resolveOwnedRider: jest.fn(),
        };
        const ridersRepository = {
            findCurrentLocationByRiderId: jest.fn(),
            upsertCurrentLocation: jest.fn(),
            createLocationHistory: jest.fn(),
        };
        const deliveriesRepository = {
            findRiderActiveDelivery: jest.fn(),
        };
        const service = new rider_location_service_1.RiderLocationService(prisma, riderAccountService, ridersRepository, deliveriesRepository);
        return {
            prisma,
            riderAccountService,
            ridersRepository,
            deliveriesRepository,
            service,
        };
    };
    it('persists current rider location and appends location history with active delivery context', async () => {
        const { prisma, riderAccountService, ridersRepository, deliveriesRepository, service, } = makeService();
        riderAccountService.resolveOwnedRider.mockResolvedValue(makeRider());
        deliveriesRepository.findRiderActiveDelivery.mockResolvedValue({
            id: 'delivery_1',
        });
        ridersRepository.findCurrentLocationByRiderId.mockResolvedValue(null);
        ridersRepository.upsertCurrentLocation.mockResolvedValue(makeCurrentLocation());
        ridersRepository.createLocationHistory.mockResolvedValue({});
        const result = await service.ingestCurrentRiderLocation(currentUser, {
            latitude: 16.834,
            longitude: 96.176,
            recordedAt: '2026-04-19T10:12:00.000Z',
        });
        expect(prisma.runInTransaction).toHaveBeenCalled();
        expect(ridersRepository.upsertCurrentLocation).toHaveBeenCalledWith('rider_1', expect.objectContaining({
            deliveryId: 'delivery_1',
            latitude: 16.834,
            longitude: 96.176,
        }), {});
        expect(ridersRepository.createLocationHistory).toHaveBeenCalledWith('rider_1', expect.objectContaining({
            deliveryId: 'delivery_1',
        }), {});
        expect(result).toMatchObject({
            riderId: 'rider_1',
            deliveryId: 'delivery_1',
            duplicate: false,
        });
    });
    it('returns duplicate=true and skips writes when the payload matches the current snapshot', async () => {
        const { prisma, riderAccountService, ridersRepository, deliveriesRepository, service, } = makeService();
        riderAccountService.resolveOwnedRider.mockResolvedValue(makeRider());
        deliveriesRepository.findRiderActiveDelivery.mockResolvedValue({
            id: 'delivery_1',
        });
        ridersRepository.findCurrentLocationByRiderId.mockResolvedValue(makeCurrentLocation());
        const result = await service.ingestCurrentRiderLocation(currentUser, {
            latitude: 16.834,
            longitude: 96.176,
            recordedAt: '2026-04-19T10:12:00.000Z',
        });
        expect(prisma.runInTransaction).not.toHaveBeenCalled();
        expect(ridersRepository.upsertCurrentLocation).not.toHaveBeenCalled();
        expect(ridersRepository.createLocationHistory).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            duplicate: true,
            deliveryId: 'delivery_1',
        });
    });
    it('rejects location ingest when the rider is offline and has no active delivery', async () => {
        const { riderAccountService, ridersRepository, deliveriesRepository, service, } = makeService();
        riderAccountService.resolveOwnedRider.mockResolvedValue(makeRider({
            availability: {
                isOnline: false,
                isAvailable: false,
                lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
                updatedAt: new Date('2026-04-19T10:00:00.000Z'),
            },
        }));
        deliveriesRepository.findRiderActiveDelivery.mockResolvedValue(null);
        await expect(service.ingestCurrentRiderLocation(currentUser, {
            latitude: 16.834,
            longitude: 96.176,
            recordedAt: '2026-04-19T10:12:00.000Z',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
        expect(ridersRepository.upsertCurrentLocation).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=rider-location.service.spec.js.map