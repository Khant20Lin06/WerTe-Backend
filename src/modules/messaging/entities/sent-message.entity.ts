import {
  MessageAttachmentType,
  MessageAttachmentVisibility,
  MessageDeliveryStatus,
  MessageSenderKind,
  MessageType,
  Prisma,
  SystemMessageCode,
} from '@prisma/client';

export const sentMessageInclude = Prisma.validator<Prisma.MessageInclude>()({
  receipts: {
    orderBy: [{ id: 'asc' }],
    select: {
      userId: true,
      status: true,
      deliveredAt: true,
      readAt: true,
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
});

export type SentMessageRecord = Prisma.MessageGetPayload<{
  include: typeof sentMessageInclude;
}>;

export class SentMessageReceiptEntity {
  userId!: string;
  status!: MessageDeliveryStatus;
  deliveredAt!: string | null;
  readAt!: string | null;
}

export class SentMessageAttachmentEntity {
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

export class SentMessageEntity {
  messageId!: string;
  conversationId!: string;
  senderKind!: MessageSenderKind;
  senderId!: string | null;
  type!: MessageType;
  systemEventCode!: SystemMessageCode | null;
  body!: string;
  metadataJson!: Prisma.JsonValue | null;
  deletedAt!: string | null;
  createdAt!: string;
  receipts!: SentMessageReceiptEntity[];
  attachments!: SentMessageAttachmentEntity[];
}

export function buildSentMessage(record: SentMessageRecord): SentMessageEntity {
  return {
    messageId: record.id,
    conversationId: record.conversationId,
    senderKind: record.senderKind,
    senderId: record.senderId ?? null,
    type: record.type,
    systemEventCode: record.systemEventCode ?? null,
    body: record.body,
    metadataJson: (record.metadataJson as Prisma.JsonValue | null) ?? null,
    deletedAt: record.deletedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    receipts: record.receipts.map((receipt) => ({
      userId: receipt.userId,
      status: receipt.status,
      deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
      readAt: receipt.readAt?.toISOString() ?? null,
    })),
    attachments: record.attachments.map((attachment) => ({
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
  };
}
