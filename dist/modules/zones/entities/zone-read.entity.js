"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneReadEntity = exports.zoneReadSelect = void 0;
exports.buildZoneRead = buildZoneRead;
const client_1 = require("@prisma/client");
exports.zoneReadSelect = client_1.Prisma.validator()({
    id: true,
    code: true,
    name: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});
class ZoneReadEntity {
}
exports.ZoneReadEntity = ZoneReadEntity;
function buildZoneRead(zone) {
    return {
        zoneId: zone.id,
        code: zone.code,
        name: zone.name,
        description: zone.description,
        status: zone.status,
    };
}
//# sourceMappingURL=zone-read.entity.js.map