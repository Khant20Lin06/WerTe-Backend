"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorContextEntity = exports.userIdentityInclude = void 0;
exports.buildActorContext = buildActorContext;
const client_1 = require("@prisma/client");
exports.userIdentityInclude = client_1.Prisma.validator()({
    customerProfile: {
        select: {
            id: true,
        },
    },
    riderProfile: {
        select: {
            id: true,
            status: true,
        },
    },
    merchantProfile: {
        select: {
            id: true,
            status: true,
        },
    },
    staffProfile: {
        select: {
            id: true,
            merchantId: true,
            role: true,
            status: true,
            branchAssignments: {
                select: { branchId: true },
            },
        },
    },
});
class ActorContextEntity {
}
exports.ActorContextEntity = ActorContextEntity;
function buildActorContext(user) {
    return {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        status: user.status,
        customerProfileId: user.customerProfile?.id,
        riderId: user.riderProfile?.id,
        riderStatus: user.riderProfile?.status,
        merchantId: user.merchantProfile?.id,
        merchantStatus: user.merchantProfile?.status,
        staffMemberId: user.staffProfile?.id,
        staffRole: user.staffProfile?.role,
        staffStatus: user.staffProfile?.status,
        staffBranchIds: user.staffProfile?.branchAssignments.map((a) => a.branchId),
        staffMerchantId: user.staffProfile?.merchantId,
    };
}
//# sourceMappingURL=actor-context.entity.js.map