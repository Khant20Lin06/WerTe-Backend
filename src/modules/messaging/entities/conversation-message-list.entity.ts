import {
  ConversationParticipantRole,
  MessageAttachmentType,
  MessageAttachmentVisibility,
  MessageDeliveryStatus,
  MessageSenderKind,
  MessageType,
  Prisma,
  SystemMessageCode,
  UserRole,
} from '@prisma/client';

import { canParticipantViewAttachment } from '../policies/message-attachment-visibility.helper';

export const conversationMessageSelect =
  Prisma.validator<Prisma.MessageSelect>()({
    id: true,
    conversationId: true,
    senderKind: true,
    senderId: true,
    type: true,
    systemEventCode: true,
    body: true,
    metadataJson: true,
    deletedAt: true,
    createdAt: true,
    sender: {
      select: {
        id: true,
        role: true,
        customerProfile: {
          select: {
            fullName: true,
          },
        },
        riderProfile: {
          select: {
            displayName: true,
          },
        },
        merchantProfile: {
          select: {
            name: true,
          },
        },
      },
    },
    attachments: {
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        type: true,
        visibility: true,
        storageKey: true,
        fileName: true,
        mimeType: true,
        fileSizeBytes: true,
        width: true,
        height: true,
        createdAt: true,
      },
    },
    receipts: {
      orderBy: [{ id: 'asc' }],
      select: {
        userId: true,
        status: true,
        deliveredAt: true,
        readAt: true,
      },
    },
  });

export type ConversationMessageRecord = Prisma.MessageGetPayload<{
  select: typeof conversationMessageSelect;
}>;

export class ConversationMessageAttachmentEntity {
  type!: MessageAttachmentType;
  visibility!: MessageAttachmentVisibility;
  storageKey!: string;
  fileName!: string | null;
  mimeType!: string | null;
  fileSizeBytes!: number | null;
  width!: number | null;
  height!: number | null;
  createdAt!: string;
}

export class ConversationMessageReceiptEntity {
  userId!: string;
  status!: MessageDeliveryStatus;
  deliveredAt!: string | null;
  readAt!: string | null;
}

export class ConversationMessageEntity {
  messageId!: string;
  conversationId!: string;
  senderKind!: MessageSenderKind;
  senderId!: string | null;
  senderRole!: UserRole | 'SYSTEM' | null;
  senderDisplayName!: string | null;
  type!: MessageType;
  systemEventCode!: SystemMessageCode | null;
  body!: string;
  metadataJson!: Prisma.JsonValue | null;
  deletedAt!: string | null;
  createdAt!: string;
  isOwnMessage!: boolean;
  attachments!: ConversationMessageAttachmentEntity[];
  receipts!: ConversationMessageReceiptEntity[];
}

export class ConversationMessageListEntity {
  conversationId!: string;
  nextCursor!: string | null;
  hasMore!: boolean;
  messages!: ConversationMessageEntity[];
}

export function buildConversationMessage(
  record: ConversationMessageRecord,
  input: {
    currentUserId: string;
    viewerRole: ConversationParticipantRole;
  },
): ConversationMessageEntity {
  return {
    messageId: record.id,
    conversationId: record.conversationId,
    senderKind: record.senderKind,
    senderId: record.senderId ?? null,
    senderRole:
      record.senderKind === 'SYSTEM'
        ? 'SYSTEM'
        : record.sender?.role ?? null,
    senderDisplayName:
      record.senderKind === 'SYSTEM'
        ? 'System'
        : resolveSenderDisplayName(record),
    type: record.type,
    systemEventCode: record.systemEventCode ?? null,
    body: record.body,
    metadataJson: (record.metadataJson as Prisma.JsonValue | null) ?? null,
    deletedAt: record.deletedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    isOwnMessage:
      record.senderKind === 'USER' && record.senderId === input.currentUserId,
    attachments: record.attachments
      .filter((attachment) =>
        canParticipantViewAttachment(input.viewerRole, attachment.visibility),
      )
      .map((attachment) => ({
        type: attachment.type,
        visibility: attachment.visibility,
        storageKey: attachment.storageKey,
        fileName: attachment.fileName ?? null,
        mimeType: attachment.mimeType ?? null,
        fileSizeBytes: attachment.fileSizeBytes ?? null,
        width: attachment.width ?? null,
        height: attachment.height ?? null,
        createdAt: attachment.createdAt.toISOString(),
      })),
    receipts: record.receipts.map((receipt) => ({
      userId: receipt.userId,
      status: receipt.status,
      deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
      readAt: receipt.readAt?.toISOString() ?? null,
    })),
  };
}

export function buildConversationMessageList(
  conversationId: string,
  messages: ConversationMessageEntity[],
  nextCursor: string | null,
  hasMore: boolean,
): ConversationMessageListEntity {
  return {
    conversationId,
    nextCursor,
    hasMore,
    messages,
  };
}

function resolveSenderDisplayName(
  record: ConversationMessageRecord,
): string | null {
  switch (record.sender?.role) {
    case 'CUSTOMER':
      return record.sender.customerProfile?.fullName ?? 'Customer';
    case 'MERCHANT':
      return record.sender.merchantProfile?.name ?? 'Merchant';
    case 'RIDER':
      return record.sender.riderProfile?.displayName ?? 'Rider';
    case 'ADMIN':
      return 'Admin';
    case 'SUPPORT':
      return 'Support';
    default:
      return null;
  }
}
