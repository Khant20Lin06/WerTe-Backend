import { ProviderEventProcessingStatus, ProviderEventVerificationStatus } from '@prisma/client';
export declare function isTerminalProviderEventProcessingStatus(status: ProviderEventProcessingStatus): boolean;
export declare function isProviderEventVerifiedForProcessing(status: ProviderEventVerificationStatus): boolean;
export declare function shouldProcessProviderEvent(input: {
    processingStatus: ProviderEventProcessingStatus;
    retryTerminal?: boolean;
}): boolean;
