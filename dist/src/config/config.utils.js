"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoolean = parseBoolean;
exports.parseCsv = parseCsv;
function parseBoolean(value, defaultValue) {
    if (value == null || value.trim() == '') {
        return defaultValue;
    }
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}
function parseCsv(value) {
    if (value == null || value.trim() == '') {
        return [];
    }
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}
//# sourceMappingURL=config.utils.js.map