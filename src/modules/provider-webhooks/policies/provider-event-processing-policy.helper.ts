import {
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

const RETRYABLE_TERMINAL_PROCESSING_STATUSES =
  new Set<ProviderEventProcessingStatus>([
    ProviderEventProcessingStatus.FAILED,
    ProviderEventProcessingStatus.IGNORED,
  ]);

const TERMINAL_PROCESSING_STATUSES = new Set<ProviderEventProcessingStatus>([
  ProviderEventProcessingStatus.PROCESSED,
  ...RETRYABLE_TERMINAL_PROCESSING_STATUSES,
]);

const PROCESSABLE_VERIFICATION_STATUSES =
  new Set<ProviderEventVerificationStatus>([
    ProviderEventVerificationStatus.VERIFIED,
    ProviderEventVerificationStatus.SKIPPED,
  ]);

export function isTerminalProviderEventProcessingStatus(
  status: ProviderEventProcessingStatus,
): boolean {
  return TERMINAL_PROCESSING_STATUSES.has(status);
}

export function isProviderEventVerifiedForProcessing(
  status: ProviderEventVerificationStatus,
): boolean {
  return PROCESSABLE_VERIFICATION_STATUSES.has(status);
}

export function shouldProcessProviderEvent(input: {
  processingStatus: ProviderEventProcessingStatus;
  retryTerminal?: boolean;
}): boolean {
  if (!isTerminalProviderEventProcessingStatus(input.processingStatus)) {
    return true;
  }

  return (
    input.retryTerminal === true &&
    RETRYABLE_TERMINAL_PROCESSING_STATUSES.has(input.processingStatus)
  );
}
