import { Prisma } from '@prisma/client';
export declare function asJsonObject(value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined): Record<string, Prisma.JsonValue | Prisma.InputJsonValue> | null;
