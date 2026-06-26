"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchOwnershipEntity = exports.BranchZoneSummaryEntity = exports.branchOwnershipInclude = void 0;
exports.buildBranchOwnership = buildBranchOwnership;
const client_1 = require("@prisma/client");
exports.branchOwnershipInclude = client_1.Prisma.validator()({
    merchant: {
        select: {
            id: true,
            userId: true,
            name: true,
            storeType: true,
            status: true,
            user: {
                select: {
                    id: true,
                    phone: true,
                    role: true,
                    status: true,
                },
            },
        },
    },
    branchZones: {
        select: {
            zoneId: true,
            zone: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                },
            },
        },
    },
    staffAssignments: {
        select: { staffId: true },
    },
});
class BranchZoneSummaryEntity {
}
exports.BranchZoneSummaryEntity = BranchZoneSummaryEntity;
class BranchOwnershipEntity {
}
exports.BranchOwnershipEntity = BranchOwnershipEntity;
function buildBranchOwnership(branch) {
    return {
        branchId: branch.id,
        merchantId: branch.merchant.id,
        merchantUserId: branch.merchant.user.id,
        merchantName: branch.merchant.name,
        merchantStoreType: branch.merchant.storeType,
        merchantStatus: branch.merchant.status,
        phone: branch.merchant.user.phone,
        role: branch.merchant.user.role,
        userStatus: branch.merchant.user.status,
        name: branch.name,
        township: branch.township,
        storeType: branch.storeType,
        status: branch.status,
        zones: branch.branchZones.map((branchZone) => ({
            zoneId: branchZone.zone.id,
            code: branchZone.zone.code,
            name: branchZone.zone.name,
            status: branchZone.zone.status,
        })),
    };
}
//# sourceMappingURL=branch-ownership.entity.js.map