"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVariantCombinationSignature = buildVariantCombinationSignature;
exports.buildVariantCombinationDefaultName = buildVariantCombinationDefaultName;
function buildVariantCombinationSignature(optionIds) {
    return [...new Set(optionIds.map((optionId) => optionId.trim()).filter(Boolean))]
        .sort()
        .join('|');
}
function buildVariantCombinationDefaultName(optionNames) {
    return optionNames
        .map((optionName) => optionName.trim())
        .filter(Boolean)
        .join(' / ');
}
//# sourceMappingURL=item-variant-combination.util.js.map