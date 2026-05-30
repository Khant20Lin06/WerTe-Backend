import { RiderStatus, UserStatus } from '@prisma/client';

import {
  RiderCurrentLocation,
  RiderOwnershipRecord,
} from '../entities/rider-ownership.entity';

type RiderLocationPayload = {
  deliveryId: string | null;
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracyMeters: number | null;
  recordedAt: Date;
};

export function canIngestRiderLocation(
  rider: RiderOwnershipRecord,
  hasActiveDelivery: boolean,
): boolean {
  if (
    rider.user.status !== UserStatus.ACTIVE ||
    rider.status !== RiderStatus.ACTIVE
  ) {
    return false;
  }

  return hasActiveDelivery || rider.availability?.isOnline === true;
}

export function isDuplicateRiderLocation(
  currentLocation: RiderCurrentLocation | null,
  payload: RiderLocationPayload,
): currentLocation is RiderCurrentLocation {
  if (currentLocation === null) {
    return false;
  }

  return (
    currentLocation.deliveryId === payload.deliveryId &&
    currentLocation.latitude.toString() === payload.latitude.toString() &&
    currentLocation.longitude.toString() === payload.longitude.toString() &&
    sameOptionalDecimal(currentLocation.heading, payload.heading) &&
    sameOptionalDecimal(currentLocation.speed, payload.speed) &&
    sameOptionalDecimal(
      currentLocation.accuracyMeters,
      payload.accuracyMeters,
    ) &&
    currentLocation.recordedAt.getTime() === payload.recordedAt.getTime()
  );
}

function sameOptionalDecimal(
  currentValue: { toString(): string } | null,
  nextValue: number | null,
): boolean {
  if (currentValue === null && nextValue === null) {
    return true;
  }

  if (currentValue === null || nextValue === null) {
    return false;
  }

  return currentValue.toString() === nextValue.toString();
}
