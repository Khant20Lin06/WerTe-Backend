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
exports.ZonesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const zone_management_entity_1 = require("../entities/zone-management.entity");
const zone_read_entity_1 = require("../entities/zone-read.entity");
let ZonesRepository = class ZonesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.zone.findUnique({
            where: { id },
            select: zone_read_entity_1.zoneReadSelect,
        });
    }
    findByCode(code) {
        return this.prisma.zone.findUnique({
            where: { code },
            select: zone_read_entity_1.zoneReadSelect,
        });
    }
    findManagementById(id) {
        return this.prisma.zone.findUnique({
            where: { id },
            select: zone_management_entity_1.zoneManagementSelect,
        });
    }
    findManagementByCode(code) {
        return this.prisma.zone.findUnique({
            where: { code },
            select: zone_management_entity_1.zoneManagementSelect,
        });
    }
    listAll() {
        return this.prisma.zone.findMany({
            select: zone_management_entity_1.zoneManagementSelect,
            orderBy: [{ name: 'asc' }],
        });
    }
    listActive() {
        return this.prisma.zone.findMany({
            where: { status: client_1.ZoneStatus.ACTIVE },
            select: zone_read_entity_1.zoneReadSelect,
            orderBy: [{ name: 'asc' }],
        });
    }
    listByBranchId(branchId) {
        return this.prisma.zone.findMany({
            where: {
                branchZones: {
                    some: {
                        branchId,
                    },
                },
            },
            select: zone_read_entity_1.zoneReadSelect,
            orderBy: [{ name: 'asc' }],
        });
    }
    listByIds(ids) {
        return this.prisma.zone.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            select: zone_read_entity_1.zoneReadSelect,
            orderBy: [{ name: 'asc' }],
        });
    }
    create(data) {
        return this.prisma.zone.create({
            data,
            select: zone_management_entity_1.zoneManagementSelect,
        });
    }
    update(id, data) {
        return this.prisma.zone.update({
            where: { id },
            data,
            select: zone_management_entity_1.zoneManagementSelect,
        });
    }
};
exports.ZonesRepository = ZonesRepository;
exports.ZonesRepository = ZonesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZonesRepository);
//# sourceMappingURL=zones.repository.js.map