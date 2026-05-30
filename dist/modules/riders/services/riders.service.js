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
exports.RidersService = void 0;
const common_1 = require("@nestjs/common");
const rider_ownership_entity_1 = require("../entities/rider-ownership.entity");
const riders_repository_1 = require("../repositories/riders.repository");
let RidersService = class RidersService {
    constructor(ridersRepository) {
        this.ridersRepository = ridersRepository;
    }
    findById(id) {
        return this.ridersRepository.findById(id);
    }
    findByUserId(userId) {
        return this.ridersRepository.findByUserId(userId);
    }
    async findOwnedByUserId(userId, riderId) {
        const rider = await this.findById(riderId);
        if (rider === null || !this.belongsToUser(rider, userId)) {
            return null;
        }
        return rider;
    }
    buildOwnership(rider) {
        return (0, rider_ownership_entity_1.buildRiderOwnership)(rider);
    }
    belongsToUser(rider, userId) {
        return rider.user.id === userId;
    }
};
exports.RidersService = RidersService;
exports.RidersService = RidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [riders_repository_1.RidersRepository])
], RidersService);
//# sourceMappingURL=riders.service.js.map