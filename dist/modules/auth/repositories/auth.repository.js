"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = exports.userSessionInclude = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const actor_context_entity_1 = require("../../users/entities/actor-context.entity");
exports.userSessionInclude = client_1.Prisma.validator()({
    user: {
        include: actor_context_entity_1.userIdentityInclude,
    },
});
let AuthRepository = class AuthRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    touchLastLogin(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }
    createSession(params) {
        return this.prisma.userSession.create({
            data: {
                id: params.id,
                userId: params.userId,
                refreshTokenHash: params.refreshTokenHash,
                expiresAt: params.expiresAt,
                deviceId: params.deviceId ?? null,
                userAgent: params.userAgent ?? null,
                ipAddress: params.ipAddress ?? null,
                lastUsedAt: new Date(),
            },
            include: exports.userSessionInclude,
        });
    }
    findSessionById(sessionId) {
        return this.prisma.userSession.findUnique({
            where: { id: sessionId },
            include: exports.userSessionInclude,
        });
    }
    rotateSession(sessionId, refreshTokenHash, expiresAt, metadata) {
        return this.prisma.userSession.update({
            where: { id: sessionId },
            data: {
                refreshTokenHash,
                expiresAt,
                lastUsedAt: new Date(),
                deviceId: metadata?.deviceId ?? undefined,
                userAgent: metadata?.userAgent ?? undefined,
                ipAddress: metadata?.ipAddress ?? undefined,
            },
            include: exports.userSessionInclude,
        });
    }
    revokeSession(sessionId) {
        return this.prisma.userSession.updateMany({
            where: {
                id: sessionId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    registerPushToken(params) {
        const lastSeenAt = new Date();
        return this.prisma.$transaction(async (tx) => {
            await tx.pushToken.deleteMany({
                where: {
                    token: params.token,
                    NOT: {
                        userId: params.userId,
                        deviceId: params.deviceId,
                    },
                },
            });
            return tx.pushToken.upsert({
                where: {
                    userId_deviceId: {
                        userId: params.userId,
                        deviceId: params.deviceId,
                    },
                },
                create: {
                    userId: params.userId,
                    deviceId: params.deviceId,
                    platform: params.platform,
                    token: params.token,
                    lastSeenAt,
                },
                update: {
                    platform: params.platform,
                    token: params.token,
                    lastSeenAt,
                },
            });
        });
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map