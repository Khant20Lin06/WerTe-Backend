"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_stores_controller_1 = require("../../../../src/modules/store-types/controllers/customer-stores.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('CustomerStoresController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_customer_1',
        role: client_1.UserRole.CUSTOMER,
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09111111111',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'customer_profile_1',
        },
    });
    it('delegates customer store discovery filtering to the discovery service', async () => {
        const customerStoreDiscoveryService = {
            listDiscoverableStores: jest.fn().mockResolvedValue([]),
            getDiscoverableStoreFacets: jest.fn().mockResolvedValue({
                totalStoreCount: 0,
                storeTypes: [],
                townships: [],
            }),
            getDiscoverableStoreDetail: jest.fn().mockResolvedValue({}),
            getDiscoverableStoreCatalogEntry: jest.fn().mockResolvedValue({}),
        };
        const controller = new customer_stores_controller_1.CustomerStoresController(customerStoreDiscoveryService);
        await controller.list(currentUser, {
            storeTypeCode: 'grocery',
            keyword: 'city',
        });
        await controller.facets(currentUser, {
            storeTypeCodes: ['grocery', 'pharmacy'],
        });
        await controller.detail(currentUser, 'branch_1');
        await controller.catalog(currentUser, 'branch_1', {
            storeTypeCode: 'pharmacy',
        });
        expect(customerStoreDiscoveryService.listDiscoverableStores).toHaveBeenCalledWith(currentUser, {
            storeTypeCode: 'grocery',
            keyword: 'city',
        });
        expect(customerStoreDiscoveryService.getDiscoverableStoreFacets).toHaveBeenCalledWith(currentUser, {
            storeTypeCodes: ['grocery', 'pharmacy'],
        });
        expect(customerStoreDiscoveryService.getDiscoverableStoreDetail).toHaveBeenCalledWith(currentUser, 'branch_1');
        expect(customerStoreDiscoveryService.getDiscoverableStoreCatalogEntry).toHaveBeenCalledWith(currentUser, 'branch_1', {
            storeTypeCode: 'pharmacy',
        });
    });
});
//# sourceMappingURL=customer-stores.controller.spec.js.map