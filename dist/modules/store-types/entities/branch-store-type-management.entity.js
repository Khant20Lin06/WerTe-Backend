"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchStoreTypeManagementInclude = void 0;
const client_1 = require("@prisma/client");
exports.branchStoreTypeManagementInclude = client_1.Prisma.validator()({
    branch: {
        select: {
            id: true,
            name: true,
            status: true,
            storeType: true,
            primaryStoreTypeId: true,
            merchant: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    storeType: {
        select: {
            id: true,
            code: true,
            name: true,
            isActive: true,
            isSystem: true,
            deletedAt: true,
        },
    },
    requestedBy: {
        select: {
            id: true,
            role: true,
        },
    },
    approvedBy: {
        select: {
            id: true,
            role: true,
        },
    },
});
//# sourceMappingURL=branch-store-type-management.entity.js.map