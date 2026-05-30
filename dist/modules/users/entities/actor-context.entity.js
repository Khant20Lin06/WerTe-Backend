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
        },
    },
    merchantProfile: {
        select: {
            id: true,
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
        merchantId: user.merchantProfile?.id,
    };
}
//# sourceMappingURL=actor-context.entity.js.map