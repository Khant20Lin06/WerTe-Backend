import { Prisma } from '@prisma/client';

export function asJsonObject(
  value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): Record<string, Prisma.JsonValue | Prisma.InputJsonValue> | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, Prisma.JsonValue | Prisma.InputJsonValue>;
}
