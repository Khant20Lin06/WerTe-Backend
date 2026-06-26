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
exports.UsersRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const actor_context_entity_1 = require("../entities/actor-context.entity");
let UsersRepository = class UsersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: actor_context_entity_1.userIdentityInclude,
        });
    }
    findByPhone(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
            include: actor_context_entity_1.userIdentityInclude,
        });
    }
    listActiveByRoles(roles) {
        if (roles.length === 0) {
            return Promise.resolve([]);
        }
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: roles,
                },
                status: client_1.UserStatus.ACTIVE,
            },
            include: actor_context_entity_1.userIdentityInclude,
            orderBy: [{ role: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map