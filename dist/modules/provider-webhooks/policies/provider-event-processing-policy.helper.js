"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTerminalProviderEventProcessingStatus = isTerminalProviderEventProcessingStatus;
exports.isProviderEventVerifiedForProcessing = isProviderEventVerifiedForProcessing;
exports.shouldProcessProviderEvent = shouldProcessProviderEvent;
const client_1 = require("@prisma/client");
const RETRYABLE_TERMINAL_PROCESSING_STATUSES = new Set([
    client_1.ProviderEventProcessingStatus.FAILED,
    client_1.ProviderEventProcessingStatus.IGNORED,
]);
const TERMINAL_PROCESSING_STATUSES = new Set([
    client_1.ProviderEventProcessingStatus.PROCESSED,
    ...RETRYABLE_TERMINAL_PROCESSING_STATUSES,
]);
const PROCESSABLE_VERIFICATION_STATUSES = new Set([
    client_1.ProviderEventVerificationStatus.VERIFIED,
    client_1.ProviderEventVerificationStatus.SKIPPED,
]);
function isTerminalProviderEventProcessingStatus(status) {
    return TERMINAL_PROCESSING_STATUSES.has(status);
}
function isProviderEventVerifiedForProcessing(status) {
    return PROCESSABLE_VERIFICATION_STATUSES.has(status);
}
function shouldProcessProviderEvent(input) {
    if (!isTerminalProviderEventProcessingStatus(input.processingStatus)) {
        return true;
    }
    return (input.retryTerminal === true &&
        RETRYABLE_TERMINAL_PROCESSING_STATUSES.has(input.processingStatus));
}
//# sourceMappingURL=provider-event-processing-policy.helper.js.map