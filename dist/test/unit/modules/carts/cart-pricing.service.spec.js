"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const cart_pricing_service_1 = require("../../../../src/modules/carts/services/cart-pricing.service");
describe('CartPricingService', () => {
    const makeMenuItem = (overrides) => ({
        id: 'item_1',
        branchId: 'branch_1',
        categoryId: 'cat_1',
        name: 'Mohinga',
        description: 'Signature breakfast item',
        imageUrl: null,
        imageUrlsJson: null,
        sku: null,
        barcode: null,
        brand: null,
        attributesJson: null,
        basePrice: new client_1.Prisma.Decimal('2500'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isAvailable: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            merchant: {
                id: 'merchant_1',
                user: {
                    id: 'usr_merchant_1',
                    phone: '0999999999',
                    role: 'MERCHANT',
                    status: 'ACTIVE',
                },
            },
        },
        storeTypes: [],
        category: {
            id: 'cat_1',
            name: 'Popular',
            isActive: true,
        },
        ...overrides,
    });
    const makeOption = (overrides) => ({
        id: 'option_1',
        groupId: 'group_1',
        name: 'Thin rice noodle',
        priceDelta: new client_1.Prisma.Decimal('250'),
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        group: {
            id: 'group_1',
            menuItemId: 'item_1',
            name: 'Choose noodle type',
            description: 'Required selection',
            kind: client_1.ItemOptionGroupKind.ADD_ON,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 0,
            isActive: true,
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
            menuItem: makeMenuItem(),
        },
        ...overrides,
    });
    it('computes unit price snapshots from base price plus selected option deltas', () => {
        const service = new cart_pricing_service_1.CartPricingService({});
        const result = service.computeUnitPriceSnapshot(makeMenuItem(), [
            makeOption(),
            makeOption({
                id: 'option_2',
                name: 'Thick rice noodle',
                priceDelta: new client_1.Prisma.Decimal('500'),
            }),
        ]);
        expect(result.toString()).toBe('3250');
    });
    it('computes line totals from quantity and unit price snapshots', () => {
        const service = new cart_pricing_service_1.CartPricingService({});
        const result = service.computeLineTotal(3, new client_1.Prisma.Decimal('2750'));
        expect(result.toString()).toBe('8250');
    });
    it('computes cart totals from cart item snapshots', () => {
        const service = new cart_pricing_service_1.CartPricingService({});
        const result = service.computeCartTotals([
            {
                quantity: 2,
                lineTotal: new client_1.Prisma.Decimal('5500'),
            },
            {
                quantity: 1,
                lineTotal: new client_1.Prisma.Decimal('3000'),
            },
        ]);
        expect(result).toEqual({
            totalQuantity: 3,
            subtotalAmount: expect.any(client_1.Prisma.Decimal),
            totalAmount: expect.any(client_1.Prisma.Decimal),
        });
        expect(result.subtotalAmount.toString()).toBe('8500');
        expect(result.totalAmount.toString()).toBe('8500');
    });
    it('recomputes and persists zero totals for an empty cart', async () => {
        const cartsRepository = {
            listCartItemsByCartIdWithClient: jest.fn().mockResolvedValue([]),
            updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
        };
        const service = new cart_pricing_service_1.CartPricingService(cartsRepository);
        const result = await service.recomputeCartTotals('cart_1', {});
        expect(cartsRepository.updateCart).toHaveBeenCalledWith('cart_1', expect.objectContaining({
            totalQuantity: 0,
            subtotalAmount: expect.any(client_1.Prisma.Decimal),
            totalAmount: expect.any(client_1.Prisma.Decimal),
        }), expect.anything());
        expect(result.subtotalAmount.toString()).toBe('0');
        expect(result.totalAmount.toString()).toBe('0');
    });
});
//# sourceMappingURL=cart-pricing.service.spec.js.map