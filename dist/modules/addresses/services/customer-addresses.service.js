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
exports.CustomerAddressesService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const customer_profiles_service_1 = require("../../customer-profiles/services/customer-profiles.service");
const address_dto_1 = require("../dto/address.dto");
const address_policy_service_1 = require("../policies/address-policy.service");
const addresses_repository_1 = require("../repositories/addresses.repository");
let CustomerAddressesService = class CustomerAddressesService {
    constructor(prisma, customerProfilesService, addressesRepository, addressPolicyService) {
        this.prisma = prisma;
        this.customerProfilesService = customerProfilesService;
        this.addressesRepository = addressesRepository;
        this.addressPolicyService = addressPolicyService;
    }
    async listCurrentCustomerAddresses(currentUser) {
        const profile = await this.resolveCurrentCustomerProfile(currentUser);
        const addresses = await this.addressesRepository.listByCustomerProfileId(profile.id);
        return addresses.map((address) => (0, address_dto_1.toAddressDto)(address));
    }
    async createCurrentCustomerAddress(currentUser, payload) {
        const profile = await this.resolveCurrentCustomerProfile(currentUser);
        const address = await this.prisma.runInTransaction(async (tx) => {
            const existingCount = await this.addressesRepository.countByCustomerProfileId(profile.id, tx);
            const shouldBecomeDefault = payload.isDefault === true || existingCount === 0;
            if (shouldBecomeDefault) {
                await this.addressesRepository.clearDefaultByCustomerProfileId(profile.id, tx);
            }
            return this.addressesRepository.create({
                customerProfileId: profile.id,
                label: payload.label,
                line1: payload.line1,
                line2: payload.line2,
                landmark: payload.landmark,
                township: payload.township,
                city: payload.city,
                postalCode: payload.postalCode,
                deliveryInstructions: payload.deliveryInstructions,
                latitude: payload.latitude,
                longitude: payload.longitude,
                isDefault: shouldBecomeDefault,
            }, tx);
        });
        return (0, address_dto_1.toAddressDto)(address);
    }
    async updateCurrentCustomerAddress(currentUser, addressId, payload) {
        const address = await this.resolveOwnedAddress(currentUser, addressId);
        if (payload.isDefault === false && address.isDefault) {
            throw new app_exception_1.AppException('A customer must always keep one default address. Set another address as default before unsetting this one.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        const updatedAddress = await this.prisma.runInTransaction(async (tx) => {
            const shouldBecomeDefault = payload.isDefault === true || (payload.isDefault === undefined && address.isDefault);
            if (payload.isDefault === true && !address.isDefault) {
                await this.addressesRepository.clearDefaultByCustomerProfileId(address.customerProfile.id, tx);
            }
            return this.addressesRepository.update(address.id, {
                ...(payload.label !== undefined ? { label: payload.label } : {}),
                ...(payload.line1 !== undefined ? { line1: payload.line1 } : {}),
                ...(payload.line2 !== undefined ? { line2: payload.line2 } : {}),
                ...(payload.landmark !== undefined
                    ? { landmark: payload.landmark }
                    : {}),
                ...(payload.township !== undefined
                    ? { township: payload.township }
                    : {}),
                ...(payload.city !== undefined ? { city: payload.city } : {}),
                ...(payload.postalCode !== undefined
                    ? { postalCode: payload.postalCode }
                    : {}),
                ...(payload.deliveryInstructions !== undefined
                    ? { deliveryInstructions: payload.deliveryInstructions }
                    : {}),
                ...(payload.latitude !== undefined
                    ? { latitude: payload.latitude }
                    : {}),
                ...(payload.longitude !== undefined
                    ? { longitude: payload.longitude }
                    : {}),
                isDefault: shouldBecomeDefault,
            }, tx);
        });
        return (0, address_dto_1.toAddressDto)(updatedAddress);
    }
    async deleteCurrentCustomerAddress(currentUser, addressId) {
        const address = await this.resolveOwnedAddress(currentUser, addressId);
        const deletedAddress = await this.prisma.runInTransaction(async (tx) => {
            const removedAddress = await this.addressesRepository.delete(address.id, tx);
            if (removedAddress.isDefault) {
                const fallbackAddress = await this.addressesRepository.findLatestByCustomerProfileId(removedAddress.customerProfile.id, tx);
                if (fallbackAddress !== null) {
                    await this.addressesRepository.update(fallbackAddress.id, {
                        isDefault: true,
                    }, tx);
                }
            }
            return removedAddress;
        });
        return {
            deletedAddressId: deletedAddress.id,
        };
    }
    async resolveCurrentCustomerProfile(currentUser) {
        const actorCustomerProfileId = currentUser.actorContext.customerProfileId;
        const profile = actorCustomerProfileId !== undefined
            ? await this.customerProfilesService.findOwnedByUserId(currentUser.userId, actorCustomerProfileId)
            : await this.customerProfilesService.findByUserId(currentUser.userId);
        if (profile === null) {
            throw new app_exception_1.AppException('Customer profile was not found for the authenticated user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.addressPolicyService.canListAddresses(currentUser, profile)) {
            throw new app_exception_1.AppException('You are not allowed to manage addresses for this customer profile.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return profile;
    }
    async resolveOwnedAddress(currentUser, addressId) {
        const address = await this.addressesRepository.findById(addressId);
        if (address === null) {
            throw new app_exception_1.AppException('Address was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.addressPolicyService.canManageAddress(currentUser, address)) {
            throw new app_exception_1.AppException('You are not allowed to manage this address.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return address;
    }
};
exports.CustomerAddressesService = CustomerAddressesService;
exports.CustomerAddressesService = CustomerAddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_profiles_service_1.CustomerProfilesService,
        addresses_repository_1.AddressesRepository,
        address_policy_service_1.AddressPolicyService])
], CustomerAddressesService);
//# sourceMappingURL=customer-addresses.service.js.map