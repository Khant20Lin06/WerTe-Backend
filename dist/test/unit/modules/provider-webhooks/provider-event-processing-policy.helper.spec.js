"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const provider_event_processing_policy_helper_1 = require("../../../../src/modules/provider-webhooks/policies/provider-event-processing-policy.helper");
describe('provider event processing policy helper', () => {
    it('treats processed, failed, and ignored events as terminal', () => {
        expect((0, provider_event_processing_policy_helper_1.isTerminalProviderEventProcessingStatus)(client_1.ProviderEventProcessingStatus.RECEIVED)).toBe(false);
        expect((0, provider_event_processing_policy_helper_1.isTerminalProviderEventProcessingStatus)(client_1.ProviderEventProcessingStatus.PROCESSED)).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.isTerminalProviderEventProcessingStatus)(client_1.ProviderEventProcessingStatus.FAILED)).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.isTerminalProviderEventProcessingStatus)(client_1.ProviderEventProcessingStatus.IGNORED)).toBe(true);
    });
    it('only retries failed or ignored terminal events when reconciliation asks', () => {
        expect((0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        })).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            retryTerminal: true,
        })).toBe(false);
        expect((0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
        })).toBe(false);
        expect((0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            retryTerminal: true,
        })).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: client_1.ProviderEventProcessingStatus.IGNORED,
            retryTerminal: true,
        })).toBe(true);
    });
    it('allows verified or intentionally skipped signatures into processing', () => {
        expect((0, provider_event_processing_policy_helper_1.isProviderEventVerifiedForProcessing)(client_1.ProviderEventVerificationStatus.VERIFIED)).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.isProviderEventVerifiedForProcessing)(client_1.ProviderEventVerificationStatus.SKIPPED)).toBe(true);
        expect((0, provider_event_processing_policy_helper_1.isProviderEventVerifiedForProcessing)(client_1.ProviderEventVerificationStatus.FAILED)).toBe(false);
    });
});
//# sourceMappingURL=provider-event-processing-policy.helper.spec.js.map