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
exports.ZonesService = void 0;
const common_1 = require("@nestjs/common");
const zone_read_entity_1 = require("../entities/zone-read.entity");
const zones_repository_1 = require("../repositories/zones.repository");
let ZonesService = class ZonesService {
    constructor(zonesRepository) {
        this.zonesRepository = zonesRepository;
    }
    findById(id) {
        return this.zonesRepository.findById(id);
    }
    findByCode(code) {
        return this.zonesRepository.findByCode(code);
    }
    listActive() {
        return this.zonesRepository.listActive();
    }
    listByBranchId(branchId) {
        return this.zonesRepository.listByBranchId(branchId);
    }
    listByIds(ids) {
        return this.zonesRepository.listByIds(ids);
    }
    listAll() {
        return this.zonesRepository.listAll();
    }
    findManagementById(id) {
        return this.zonesRepository.findManagementById(id);
    }
    findManagementByCode(code) {
        return this.zonesRepository.findManagementByCode(code);
    }
    buildReadModel(zone) {
        return (0, zone_read_entity_1.buildZoneRead)(zone);
    }
};
exports.ZonesService = ZonesService;
exports.ZonesService = ZonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zones_repository_1.ZonesRepository])
], ZonesService);
//# sourceMappingURL=zones.service.js.map