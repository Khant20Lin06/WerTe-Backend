"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const delivery_query_service_1 = require("../../../../src/modules/deliveries/services/delivery-query.service");
describe('DeliveryQueryService', () => {
    const riderUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        const repository = {
            findById: jest.fn(),
            findByOrderId: jest.fn(),
            findRiderActiveDelivery: jest.fn(),
            findRiderDeliveryById: jest.fn(),
        };
        const service = new delivery_query_service_1.DeliveryQueryService(repository);
        return { repository, service };
    };
    it('returns null when the rider has no active delivery yet', async () => {
        const { repository, service } = makeService();
        repository.findRiderActiveDelivery.mockResolvedValue(null);
        await expect(service.getRiderActiveDelivery(riderUser)).resolves.toBeNull();
        expect(repository.findRiderActiveDelivery).toHaveBeenCalledWith('rider_1');
    });
    it('throws forbidden when the actor has no rider scope', async () => {
        const { service } = makeService();
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '0990000000',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        await expect(service.getRiderActiveDelivery(currentUser)).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
        });
    });
});
//# sourceMappingURL=delivery-query.service.spec.js.map