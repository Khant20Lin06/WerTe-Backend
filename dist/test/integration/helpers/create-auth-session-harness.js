"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthSessionHarness = createAuthSessionHarness;
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const actor_context_entity_1 = require("../../../src/modules/users/entities/actor-context.entity");
function buildSessionUser(input) {
    return {
        id: input.userId,
        role: input.role,
        phone: input.phone,
        status: input.status ?? client_1.UserStatus.ACTIVE,
        customerProfile: input.customerProfileId === undefined
            ? null
            : { id: input.customerProfileId },
        merchantProfile: input.merchantId === undefined ? null : { id: input.merchantId },
        riderProfile: input.riderId === undefined ? null : { id: input.riderId },
    };
}
async function createAuthSessionHarness(inputs) {
    const jwtService = new jwt_1.JwtService();
    const fixtures = {};
    const sessions = new Map();
    for (const input of inputs) {
        const user = buildSessionUser(input);
        const actorContext = (0, actor_context_entity_1.buildActorContext)(user);
        const accessToken = await jwtService.signAsync({
            sub: input.userId,
            role: input.role,
            sessionId: input.sessionId,
            type: 'access',
        }, {
            secret: process.env.JWT_ACCESS_SECRET,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
            expiresIn: '15m',
        });
        const session = {
            id: input.sessionId,
            userId: input.userId,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            user,
        };
        sessions.set(input.sessionId, session);
        fixtures[input.key] = {
            key: input.key,
            accessToken,
            actorContext,
            currentUser: {
                userId: input.userId,
                sessionId: input.sessionId,
                role: input.role,
                tokenType: 'access',
                actorContext,
            },
            session,
        };
    }
    const usersService = {
        buildActorContext: jest.fn((user) => (0, actor_context_entity_1.buildActorContext)(user)),
        isSuspended: jest.fn((user) => user.status === client_1.UserStatus.SUSPENDED),
        isPending: jest.fn((user) => user.status === client_1.UserStatus.PENDING),
        findById: jest.fn(),
        findByPhone: jest.fn(),
        findActiveByPhone: jest.fn(),
        findActorContextById: jest.fn(),
    };
    const authRepository = {
        findSessionById: jest.fn(async (sessionId) => {
            return sessions.get(sessionId) ?? null;
        }),
        createSession: jest.fn(),
        rotateSession: jest.fn(),
        revokeSession: jest.fn(),
        registerPushToken: jest.fn(),
        touchLastLogin: jest.fn(),
    };
    return {
        authRepository,
        usersService,
        actors: fixtures,
    };
}
//# sourceMappingURL=create-auth-session-harness.js.map