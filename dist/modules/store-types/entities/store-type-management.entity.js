"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeTypeManagementInclude = void 0;
const client_1 = require("@prisma/client");
exports.storeTypeManagementInclude = client_1.Prisma.validator()({
    _count: {
        select: {
            branchAssignments: true,
            branchPrimaries: true,
            merchantPrimaries: true,
        },
    },
});
//# sourceMappingURL=store-type-management.entity.js.map