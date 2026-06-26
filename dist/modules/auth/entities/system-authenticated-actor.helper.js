"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSystemAuthenticatedActor = createSystemAuthenticatedActor;
exports.isSystemAuthenticatedActor = isSystemAuthenticatedActor;
const client_1 = require("@prisma/client");
const SYSTEM_ACTOR_PREFIX = 'system:';
function createSystemAuthenticatedActor(actorId, role = client_1.UserRole.SUPPORT) {
    const userId = actorId.startsWith(SYSTEM_ACTOR_PREFIX)
        ? actorId
        : `${SYSTEM_ACTOR_PREFIX}${actorId}`;
    return {
        userId,
        sessionId: userId,
        role,
        tokenType: 'access',
        actorContext: {
            userId,
            phone: 'system',
            role,
            status: client_1.UserStatus.ACTIVE,
        },
    };
}
function isSystemAuthenticatedActor(currentUser) {
    return (currentUser.userId.startsWith(SYSTEM_ACTOR_PREFIX) ||
        currentUser.sessionId.startsWith(SYSTEM_ACTOR_PREFIX));
}
//# sourceMappingURL=system-authenticated-actor.helper.js.map