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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const actor_context_entity_1 = require("../entities/actor-context.entity");
const users_repository_1 = require("../repositories/users.repository");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    findById(id) {
        return this.usersRepository.findById(id);
    }
    findByPhone(phone) {
        return this.usersRepository.findByPhone(phone);
    }
    async findActiveByPhone(phone) {
        const user = await this.findByPhone(phone);
        if (user === null || !this.isActive(user)) {
            return null;
        }
        return user;
    }
    async findActorContextById(id) {
        const user = await this.findById(id);
        if (user === null) {
            return null;
        }
        return this.buildActorContext(user);
    }
    buildActorContext(user) {
        return (0, actor_context_entity_1.buildActorContext)(user);
    }
    isActive(user) {
        return user.status === client_1.UserStatus.ACTIVE;
    }
    isSuspended(user) {
        return user.status === client_1.UserStatus.SUSPENDED;
    }
    isPending(user) {
        return user.status === client_1.UserStatus.PENDING;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map