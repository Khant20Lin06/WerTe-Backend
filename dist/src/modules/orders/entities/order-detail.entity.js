"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDetailEntity = exports.OrderTimelineEntryEntity = exports.OrderDetailItemEntity = exports.OrderDetailInventoryLotAllocationEntity = exports.OrderDetailSelectedOptionEntity = exports.OrderDetailAddressEntity = exports.orderDetailInclude = exports.orderTimelineSelect = void 0;
exports.buildOrderTimelineEntry = buildOrderTimelineEntry;
exports.buildOrderDetail = buildOrderDetail;
const client_1 = require("@prisma/client");
const order_summary_entity_1 = require("./order-summary.entity");
exports.orderTimelineSelect = client_1.Prisma.validator()({
    id: true,
    fromStatus: true,
    toStatus: true,
    changedByUserId: true,
    reasonCode: true,
    note: true,
    createdAt: true,
});
exports.orderDetailInclude = client_1.Prisma.validator()({
    ...order_summary_entity_1.orderSummaryInclude,
    items: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
            id: true,
            orderId: true,
            menuItemId: true,
            categoryId: true,
            nameSnapshot: true,
            descriptionSnapshot: true,
            imageUrlSnapshot: true,
            selectedVariantCombinationId: true,
            selectedVariantCombinationNameSnapshot: true,
            menuItemStockTrackedSnapshot: true,
            variantCombinationStockTrackedSnapshot: true,
            unitBasePriceSnapshot: true,
            unitPriceSnapshot: true,
            quantity: true,
            lineTotal: true,
            createdAt: true,
            updatedAt: true,
            inventoryLotAllocations: {
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    inventoryLotId: true,
                    batchNoSnapshot: true,
                    expiryDateSnapshot: true,
                    quantity: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            selectedOptions: {
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    orderItemId: true,
                    itemOptionId: true,
                    optionGroupId: true,
                    optionGroupNameSnapshot: true,
                    optionGroupKindSnapshot: true,
                    itemOptionStockTrackedSnapshot: true,
                    nameSnapshot: true,
                    priceDeltaSnapshot: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    },
    statusHistory: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: exports.orderTimelineSelect,
    },
});
class OrderDetailAddressEntity {
}
exports.OrderDetailAddressEntity = OrderDetailAddressEntity;
class OrderDetailSelectedOptionEntity {
}
exports.OrderDetailSelectedOptionEntity = OrderDetailSelectedOptionEntity;
class OrderDetailInventoryLotAllocationEntity {
}
exports.OrderDetailInventoryLotAllocationEntity = OrderDetailInventoryLotAllocationEntity;
class OrderDetailItemEntity {
}
exports.OrderDetailItemEntity = OrderDetailItemEntity;
class OrderTimelineEntryEntity {
}
exports.OrderTimelineEntryEntity = OrderTimelineEntryEntity;
class OrderDetailEntity extends order_summary_entity_1.OrderSummaryEntity {
}
exports.OrderDetailEntity = OrderDetailEntity;
function buildOrderTimelineEntry(entry) {
    return {
        orderStatusHistoryId: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedByUserId: entry.changedByUserId,
        reasonCode: entry.reasonCode,
        note: entry.note,
        createdAt: entry.createdAt.toISOString(),
    };
}
function buildOrderDetail(order) {
    const summary = (0, order_summary_entity_1.buildOrderSummary)(order);
    return {
        ...summary,
        deliveryAddress: {
            addressId: order.addressId,
            label: order.deliveryLabel,
            line1: order.deliveryLine1,
            line2: order.deliveryLine2,
            landmark: order.deliveryLandmark,
            township: order.deliveryTownship,
            city: order.deliveryCity,
            postalCode: order.deliveryPostalCode,
            deliveryInstructions: order.deliveryInstructions,
            latitude: order.deliveryLatitude === null ? null : order.deliveryLatitude.toString(),
            longitude: order.deliveryLongitude === null
                ? null
                : order.deliveryLongitude.toString(),
        },
        items: order.items.map((item) => ({
            orderItemId: item.id,
            menuItemId: item.menuItemId,
            categoryId: item.categoryId,
            nameSnapshot: item.nameSnapshot,
            descriptionSnapshot: item.descriptionSnapshot,
            imageUrlSnapshot: item.imageUrlSnapshot,
            selectedVariantCombinationId: item.selectedVariantCombinationId,
            selectedVariantCombinationNameSnapshot: item.selectedVariantCombinationNameSnapshot,
            unitBasePriceSnapshot: item.unitBasePriceSnapshot.toString(),
            unitPriceSnapshot: item.unitPriceSnapshot.toString(),
            quantity: item.quantity,
            lineTotal: item.lineTotal.toString(),
            inventoryLotAllocations: item.inventoryLotAllocations.map((allocation) => ({
                orderItemInventoryLotAllocationId: allocation.id,
                inventoryLotId: allocation.inventoryLotId,
                batchNoSnapshot: allocation.batchNoSnapshot,
                expiryDateSnapshot: allocation.expiryDateSnapshot?.toISOString() ?? null,
                quantity: allocation.quantity,
            })),
            selectedOptions: item.selectedOptions.map((selectedOption) => ({
                orderItemOptionId: selectedOption.id,
                itemOptionId: selectedOption.itemOptionId,
                optionGroupId: selectedOption.optionGroupId,
                optionGroupNameSnapshot: selectedOption.optionGroupNameSnapshot,
                optionGroupKindSnapshot: selectedOption.optionGroupKindSnapshot,
                nameSnapshot: selectedOption.nameSnapshot,
                priceDeltaSnapshot: selectedOption.priceDeltaSnapshot.toString(),
            })),
        })),
        timeline: order.statusHistory.map((entry) => buildOrderTimelineEntry(entry)),
    };
}
//# sourceMappingURL=order-detail.entity.js.map