"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const admin_dispatch_controller_1 = require("../../../../src/modules/dispatch/controllers/admin-dispatch.controller");
describe('AdminDispatchController', () => {
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
    it('delegates rider assignment requests to the dispatch assignment service', async () => {
        const dispatchAssignmentService = {
            assignRiderToOrder: jest.fn().mockResolvedValue({
                orderId: 'order_1',
                orderCode: 'ORD-00000001',
                customerProfileId: 'cust_prof_1',
                branchId: 'branch_1',
                addressId: 'addr_1',
                cartId: 'cart_1',
                status: client_1.OrderStatus.RIDER_ASSIGNED,
                currencyCode: 'MMK',
                subtotalAmount: '6500',
                discountAmount: '0',
                deliveryFee: '500',
                totalAmount: '7000',
                placedAt: '2026-04-19T10:00:00.000Z',
                updatedAt: '2026-04-19T10:05:00.000Z',
                availableActions: ['admin_cancel', 'admin_override_status'],
                customer: {
                    customerProfileId: 'cust_prof_1',
                    userId: 'usr_customer_1',
                    phone: '09123456789',
                    userStatus: client_1.UserStatus.ACTIVE,
                    fullName: 'Mg Mg',
                    avatarUrl: null,
                },
                branch: {
                    branchId: 'branch_1',
                    branchName: 'Downtown Branch',
                    branchStatus: 'ACTIVE',
                    township: 'Botahtaung',
                    merchantId: 'merchant_1',
                    merchantUserId: 'usr_merchant_1',
                    merchantName: 'Merchant One',
                    merchantStatus: 'ACTIVE',
                },
                delivery: {
                    deliveryId: 'delivery_1',
                    riderId: 'rider_1',
                    etaMinutes: 18,
                    rider: {
                        riderId: 'rider_1',
                        userId: 'usr_rider_1',
                        phone: '0999999999',
                        userStatus: client_1.UserStatus.ACTIVE,
                        displayName: 'Ko Aung',
                        vehicleType: 'bike',
                        currentTownship: 'Pabedan',
                        status: client_1.RiderStatus.ACTIVE,
                    },
                },
                deliveryAddress: {
                    addressId: 'addr_1',
                    label: 'Home',
                    line1: 'No. 1, Main Road',
                    line2: null,
                    landmark: null,
                    township: 'Botahtaung',
                    city: 'Yangon',
                    postalCode: null,
                    deliveryInstructions: null,
                    latitude: '16.834',
                    longitude: '96.176',
                },
                items: [],
                timeline: [],
            }),
        };
        const controller = new admin_dispatch_controller_1.AdminDispatchController(dispatchAssignmentService);
        const result = await controller.assignRider(currentUser, 'order_1', {
            riderId: 'rider_1',
            etaMinutes: 18,
            reasonCode: 'admin_assigned_rider_manual_dispatch',
            note: 'Dispatcher manually assigned the nearest rider.',
        });
        expect(dispatchAssignmentService.assignRiderToOrder).toHaveBeenCalledWith(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_1',
            etaMinutes: 18,
            reasonCode: 'admin_assigned_rider_manual_dispatch',
            note: 'Dispatcher manually assigned the nearest rider.',
        });
        expect(result).toMatchObject({
            orderId: 'order_1',
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            delivery: {
                deliveryId: 'delivery_1',
                riderId: 'rider_1',
            },
        });
    });
});
//# sourceMappingURL=admin-dispatch.controller.spec.js.map