import { RiderStatus, UserStatus } from '@prisma/client';

type DispatchEligibleRider = {
  status: RiderStatus;
  user: {
    status: UserStatus;
  };
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
  } | null;
};

export function isDispatchEligibleRider(
  rider: DispatchEligibleRider,
): boolean {
  return (
    rider.status === RiderStatus.ACTIVE &&
    rider.user.status === UserStatus.ACTIVE &&
    rider.availability?.isOnline === true &&
    rider.availability?.isAvailable === true
  );
}
