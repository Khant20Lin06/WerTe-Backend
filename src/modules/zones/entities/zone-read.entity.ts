import { Prisma, ZoneStatus } from '@prisma/client';

export const zoneReadSelect = Prisma.validator<Prisma.ZoneSelect>()({
  id: true,
  code: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type ZoneReadRecord = Prisma.ZoneGetPayload<{
  select: typeof zoneReadSelect;
}>;

export class ZoneReadEntity {
  zoneId!: string;
  code!: string;
  name!: string;
  description?: string | null;
  status!: ZoneStatus;
}

export function buildZoneRead(zone: ZoneReadRecord): ZoneReadEntity {
  return {
    zoneId: zone.id,
    code: zone.code,
    name: zone.name,
    description: zone.description,
    status: zone.status,
  };
}
