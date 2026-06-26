"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoneManagementSelect = void 0;
const client_1 = require("@prisma/client");
exports.zoneManagementSelect = client_1.Prisma.validator()({
    id: true,
    code: true,
    name: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            branchZones: true,
        },
    },
});
//# sourceMappingURL=zone-management.entity.js.map