"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthenticatedUser = makeAuthenticatedUser;
const client_1 = require("@prisma/client");
function makeAuthenticatedUser(overrides) {
    return {
        userId: 'usr_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
        },
        ...overrides,
    };
}
//# sourceMappingURL=authenticated-user.factory.js.map