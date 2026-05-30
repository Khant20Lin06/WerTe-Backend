import {
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import {
  isProviderEventVerifiedForProcessing,
  isTerminalProviderEventProcessingStatus,
  shouldProcessProviderEvent,
} from '../../../../src/modules/provider-webhooks/policies/provider-event-processing-policy.helper';

describe('provider event processing policy helper', () => {
  it('treats processed, failed, and ignored events as terminal', () => {
    expect(
      isTerminalProviderEventProcessingStatus(
        ProviderEventProcessingStatus.RECEIVED,
      ),
    ).toBe(false);
    expect(
      isTerminalProviderEventProcessingStatus(
        ProviderEventProcessingStatus.PROCESSED,
      ),
    ).toBe(true);
    expect(
      isTerminalProviderEventProcessingStatus(
        ProviderEventProcessingStatus.FAILED,
      ),
    ).toBe(true);
    expect(
      isTerminalProviderEventProcessingStatus(
        ProviderEventProcessingStatus.IGNORED,
      ),
    ).toBe(true);
  });

  it('only retries failed or ignored terminal events when reconciliation asks', () => {
    expect(
      shouldProcessProviderEvent({
        processingStatus: ProviderEventProcessingStatus.RECEIVED,
      }),
    ).toBe(true);
    expect(
      shouldProcessProviderEvent({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        retryTerminal: true,
      }),
    ).toBe(false);
    expect(
      shouldProcessProviderEvent({
        processingStatus: ProviderEventProcessingStatus.FAILED,
      }),
    ).toBe(false);
    expect(
      shouldProcessProviderEvent({
        processingStatus: ProviderEventProcessingStatus.FAILED,
        retryTerminal: true,
      }),
    ).toBe(true);
    expect(
      shouldProcessProviderEvent({
        processingStatus: ProviderEventProcessingStatus.IGNORED,
        retryTerminal: true,
      }),
    ).toBe(true);
  });

  it('allows verified or intentionally skipped signatures into processing', () => {
    expect(
      isProviderEventVerifiedForProcessing(
        ProviderEventVerificationStatus.VERIFIED,
      ),
    ).toBe(true);
    expect(
      isProviderEventVerifiedForProcessing(
        ProviderEventVerificationStatus.SKIPPED,
      ),
    ).toBe(true);
    expect(
      isProviderEventVerifiedForProcessing(
        ProviderEventVerificationStatus.FAILED,
      ),
    ).toBe(false);
  });
});
