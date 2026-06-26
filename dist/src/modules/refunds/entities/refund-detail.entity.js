"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundDetailEntity = void 0;
exports.buildRefundDetailEntity = buildRefundDetailEntity;
const refund_summary_entity_1 = require("./refund-summary.entity");
class RefundDetailEntity extends refund_summary_entity_1.RefundSummaryEntity {
}
exports.RefundDetailEntity = RefundDetailEntity;
function buildRefundDetailEntity(refund, attempts) {
    return {
        ...refund,
        attempts,
    };
}
//# sourceMappingURL=refund-detail.entity.js.map