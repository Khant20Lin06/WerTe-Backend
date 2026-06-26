"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const merchant_store_types_controller_1 = require("../../../../src/modules/store-types/controllers/merchant-store-types.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('MerchantStoreTypesController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_merchant_1',
        role: client_1.UserRole.MERCHANT,
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    });
    it('delegates merchant store type browse and request flows to the request service', async () => {
        const merchantStoreTypeRequestService = {
            listAvailableStoreTypes: jest.fn().mockResolvedValue([]),
            listCurrentMerchantBranchStoreTypes: jest.fn().mockResolvedValue([]),
            requestCurrentMerchantBranchStoreType: jest.fn().mockResolvedValue({
                branchId: 'branch_1',
                storeTypeId: 'store_type_grocery',
            }),
        };
        const controller = new merchant_store_types_controller_1.MerchantStoreTypesController(merchantStoreTypeRequestService);
        await controller.listAvailable(currentUser);
        await controller.listBranchAssignments(currentUser, 'branch_1');
        await controller.request(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            reason: 'Launching grocery next week.',
        });
        expect(merchantStoreTypeRequestService.listAvailableStoreTypes).toHaveBeenCalledWith(currentUser);
        expect(merchantStoreTypeRequestService.listCurrentMerchantBranchStoreTypes).toHaveBeenCalledWith(currentUser, 'branch_1');
        expect(merchantStoreTypeRequestService.requestCurrentMerchantBranchStoreType).toHaveBeenCalledWith(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            reason: 'Launching grocery next week.',
        });
    });
});
//# sourceMappingURL=merchant-store-types.controller.spec.js.map