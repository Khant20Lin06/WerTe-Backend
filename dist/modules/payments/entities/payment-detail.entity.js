"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDetailEntity = void 0;
exports.buildPaymentDetailEntity = buildPaymentDetailEntity;
const payment_summary_entity_1 = require("./payment-summary.entity");
class PaymentDetailEntity extends payment_summary_entity_1.PaymentSummaryEntity {
}
exports.PaymentDetailEntity = PaymentDetailEntity;
function buildPaymentDetailEntity(payment, attempts) {
    return {
        ...payment,
        attempts,
    };
}
//# sourceMappingURL=payment-detail.entity.js.map