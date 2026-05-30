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
exports.ZoneManagementService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const zone_dto_1 = require("../dto/zone.dto");
const zone_policy_service_1 = require("../policies/zone-policy.service");
const zones_repository_1 = require("../repositories/zones.repository");
let ZoneManagementService = class ZoneManagementService {
    constructor(zonesRepository, zonePolicyService) {
        this.zonesRepository = zonesRepository;
        this.zonePolicyService = zonePolicyService;
    }
    async listZones(currentUser) {
        this.assertCanManageZones(currentUser);
        const zones = await this.zonesRepository.listAll();
        return zones.map((zone) => (0, zone_dto_1.toZoneDto)(zone));
    }
    async getZone(currentUser, zoneId) {
        this.assertCanManageZones(currentUser);
        const zone = await this.zonesRepository.findManagementById(zoneId);
        if (zone === null) {
            throw new app_exception_1.AppException('Zone was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return (0, zone_dto_1.toZoneDto)(zone);
    }
    async createZone(currentUser, payload) {
        this.assertCanManageZones(currentUser);
        await this.assertCodeAvailable(payload.code);
        const zone = await this.zonesRepository.create({
            code: payload.code,
            name: payload.name,
            description: payload.description,
            status: payload.status,
        });
        return (0, zone_dto_1.toZoneDto)(zone);
    }
    async updateZone(currentUser, zoneId, payload) {
        this.assertCanManageZones(currentUser);
        const existingZone = await this.zonesRepository.findManagementById(zoneId);
        if (existingZone === null) {
            throw new app_exception_1.AppException('Zone was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (payload.code !== undefined &&
            payload.code.length > 0 &&
            payload.code !== existingZone.code) {
            await this.assertCodeAvailable(payload.code, existingZone.id);
        }
        const updatedZone = await this.zonesRepository.update(zoneId, {
            ...(payload.code !== undefined ? { code: payload.code } : {}),
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.description !== undefined
                ? { description: payload.description }
                : {}),
            ...(payload.status !== undefined ? { status: payload.status } : {}),
        });
        return (0, zone_dto_1.toZoneDto)(updatedZone);
    }
    async listActiveZones(currentUser) {
        if (!this.zonePolicyService.canReadActiveZones(currentUser)) {
            throw new app_exception_1.AppException('You are not allowed to read active zones.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const zones = await this.zonesRepository.listActive();
        return zones.map((zone) => (0, zone_dto_1.toZoneDto)(zone));
    }
    assertCanManageZones(currentUser) {
        if (!this.zonePolicyService.canManageZones(currentUser)) {
            throw new app_exception_1.AppException('You are not allowed to manage zones.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
    async assertCodeAvailable(code, currentZoneId) {
        const existingZone = await this.zonesRepository.findManagementByCode(code);
        if (existingZone !== null && existingZone.id !== currentZoneId) {
            throw new app_exception_1.AppException('Zone code is already in use.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
                details: {
                    code,
                },
            });
        }
    }
};
exports.ZoneManagementService = ZoneManagementService;
exports.ZoneManagementService = ZoneManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zones_repository_1.ZonesRepository,
        zone_policy_service_1.ZonePolicyService])
], ZoneManagementService);
//# sourceMappingURL=zone-management.service.js.map