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
exports.AddressesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const address_ownership_entity_1 = require("../entities/address-ownership.entity");
let AddressesRepository = class AddressesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.address.findUnique({
            where: { id },
            include: address_ownership_entity_1.addressOwnershipInclude,
        });
    }
    listByCustomerProfileId(customerProfileId) {
        return this.prisma.address.findMany({
            where: { customerProfileId },
            include: address_ownership_entity_1.addressOwnershipInclude,
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findDefaultByCustomerProfileId(customerProfileId) {
        return this.prisma.address.findFirst({
            where: {
                customerProfileId,
                isDefault: true,
            },
            include: address_ownership_entity_1.addressOwnershipInclude,
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        });
    }
    countByCustomerProfileId(customerProfileId, client = this.prisma) {
        return client.address.count({
            where: { customerProfileId },
        });
    }
    clearDefaultByCustomerProfileId(customerProfileId, client = this.prisma) {
        return client.address.updateMany({
            where: {
                customerProfileId,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        });
    }
    create(data, client = this.prisma) {
        return client.address.create({
            data,
            include: address_ownership_entity_1.addressOwnershipInclude,
        });
    }
    update(id, data, client = this.prisma) {
        return client.address.update({
            where: { id },
            data,
            include: address_ownership_entity_1.addressOwnershipInclude,
        });
    }
    delete(id, client = this.prisma) {
        return client.address.delete({
            where: { id },
            include: address_ownership_entity_1.addressOwnershipInclude,
        });
    }
    findLatestByCustomerProfileId(customerProfileId, client = this.prisma) {
        return client.address.findFirst({
            where: { customerProfileId },
            include: address_ownership_entity_1.addressOwnershipInclude,
            orderBy: [{ createdAt: 'desc' }],
        });
    }
};
exports.AddressesRepository = AddressesRepository;
exports.AddressesRepository = AddressesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressesRepository);
//# sourceMappingURL=addresses.repository.js.map