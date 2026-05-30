import { ConversationType } from '@prisma/client';
export declare function requiresAssignedRiderConversationType(type: ConversationType): boolean;
export declare function isOperationsConversationType(type: ConversationType): boolean;
export declare function includesSystemParticipant(type: ConversationType): boolean;
