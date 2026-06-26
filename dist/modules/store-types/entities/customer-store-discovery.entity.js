"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerStoreDiscoveryInclude = void 0;
const client_1 = require("@prisma/client");
exports.customerStoreDiscoveryInclude = client_1.Prisma.validator()({
    merchant: {
        select: {
            id: true,
            name: true,
            status: true,
        },
    },
    storeTypes: {
        where: {
            status: client_1.BranchStoreTypeStatus.APPROVED,
            storeType: {
                isActive: true,
                deletedAt: null,
            },
        },
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
            storeType: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    sortOrder: true,
                },
            },
        },
    },
});
//# sourceMappingURL=customer-store-discovery.entity.js.map