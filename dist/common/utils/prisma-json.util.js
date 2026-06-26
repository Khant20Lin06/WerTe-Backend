"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asJsonObject = asJsonObject;
function asJsonObject(value) {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value;
}
//# sourceMappingURL=prisma-json.util.js.map