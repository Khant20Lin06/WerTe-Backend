"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin_branch_store_types_controller_1 = require("../../../../src/modules/store-types/controllers/admin-branch-store-types.controller");
const admin_store_types_controller_1 = require("../../../../src/modules/store-types/controllers/admin-store-types.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('AdminStoreTypesController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_admin_1',
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    it('delegates store type registry operations to the management service', async () => {
        const storeTypeManagementService = {
            listStoreTypes: jest.fn().mockResolvedValue([
                {
                    id: 'store_type_restaurant',
                    code: 'restaurant',
                },
            ]),
            createStoreType: jest.fn().mockResolvedValue({
                id: 'store_type_grocery',
                code: 'grocery',
            }),
            archiveStoreType: jest.fn().mockResolvedValue({
                id: 'store_type_grocery',
                isActive: false,
            }),
        };
        const controller = new admin_store_types_controller_1.AdminStoreTypesController(storeTypeManagementService);
        await controller.list(currentUser);
        await controller.create(currentUser, {
            code: 'grocery',
            name: 'Grocery',
        });
        await controller.archive(currentUser, 'store_type_grocery');
        expect(storeTypeManagementService.listStoreTypes).toHaveBeenCalledWith(currentUser);
        expect(storeTypeManagementService.createStoreType).toHaveBeenCalledWith(currentUser, {
            code: 'grocery',
            name: 'Grocery',
        });
        expect(storeTypeManagementService.archiveStoreType).toHaveBeenCalledWith(currentUser, 'store_type_grocery');
    });
    it('delegates branch assignment lifecycle actions to the management service', async () => {
        const storeTypeManagementService = {
            assignBranchStoreType: jest.fn().mockResolvedValue({
                branchId: 'branch_1',
                storeTypeId: 'store_type_grocery',
            }),
            approveBranchStoreType: jest.fn().mockResolvedValue({
                status: client_1.BranchStoreTypeStatus.APPROVED,
            }),
            hideBranchStoreType: jest.fn().mockResolvedValue({
                status: client_1.BranchStoreTypeStatus.HIDDEN,
            }),
        };
        const controller = new admin_branch_store_types_controller_1.AdminBranchStoreTypesController(storeTypeManagementService);
        await controller.assign(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            isPrimary: true,
        });
        await controller.approve(currentUser, 'branch_1', 'store_type_grocery', {
            reason: 'Approved',
        });
        await controller.hide(currentUser, 'branch_1', 'store_type_grocery', {
            reason: 'Temporarily hidden',
        });
        expect(storeTypeManagementService.assignBranchStoreType).toHaveBeenCalledWith(currentUser, 'branch_1', expect.objectContaining({
            storeTypeId: 'store_type_grocery',
        }));
        expect(storeTypeManagementService.approveBranchStoreType).toHaveBeenCalledWith(currentUser, 'branch_1', 'store_type_grocery', expect.objectContaining({
            reason: 'Approved',
        }));
        expect(storeTypeManagementService.hideBranchStoreType).toHaveBeenCalledWith(currentUser, 'branch_1', 'store_type_grocery', expect.objectContaining({
            reason: 'Temporarily hidden',
        }));
    });
});
//# sourceMappingURL=admin-store-types.controller.spec.js.map