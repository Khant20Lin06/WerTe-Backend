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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const address_ownership_entity_1 = require("../entities/address-ownership.entity");
const addresses_repository_1 = require("../repositories/addresses.repository");
let AddressesService = class AddressesService {
    constructor(addressesRepository) {
        this.addressesRepository = addressesRepository;
    }
    findById(id) {
        return this.addressesRepository.findById(id);
    }
    listByCustomerProfileId(customerProfileId) {
        return this.addressesRepository.listByCustomerProfileId(customerProfileId);
    }
    findDefaultByCustomerProfileId(customerProfileId) {
        return this.addressesRepository.findDefaultByCustomerProfileId(customerProfileId);
    }
    async findOwnedByUserId(userId, addressId) {
        const address = await this.findById(addressId);
        if (address === null || !this.belongsToUser(address, userId)) {
            return null;
        }
        return address;
    }
    buildOwnership(address) {
        return (0, address_ownership_entity_1.buildAddressOwnership)(address);
    }
    belongsToUser(address, userId) {
        return address.customerProfile.user.id === userId;
    }
    belongsToCustomerProfile(address, customerProfileId) {
        return address.customerProfile.id === customerProfileId;
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [addresses_repository_1.AddressesRepository])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map