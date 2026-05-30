import { RiderStatus, UserStatus } from '@prisma/client';

import { isDispatchEligibleRider } from '../../../../src/modules/dispatch/policies/dispatch-assignment-policy.helper';

describe('dispatch assignment policy helper', () => {
  it('returns true only for active, online, available riders', () => {
    expect(
      isDispatchEligibleRider({
        status: RiderStatus.ACTIVE,
        user: {
          status: UserStatus.ACTIVE,
        },
        availability: {
          isOnline: true,
          isAvailable: true,
        },
      }),
    ).toBe(true);

    expect(
      isDispatchEligibleRider({
        status: RiderStatus.SUSPENDED,
        user: {
          status: UserStatus.ACTIVE,
        },
        availability: {
          isOnline: true,
          isAvailable: true,
        },
      }),
    ).toBe(false);

    expect(
      isDispatchEligibleRider({
        status: RiderStatus.ACTIVE,
        user: {
          status: UserStatus.SUSPENDED,
        },
        availability: {
          isOnline: true,
          isAvailable: true,
        },
      }),
    ).toBe(false);

    expect(
      isDispatchEligibleRider({
        status: RiderStatus.ACTIVE,
        user: {
          status: UserStatus.ACTIVE,
        },
        availability: {
          isOnline: true,
          isAvailable: false,
        },
      }),
    ).toBe(false);

    expect(
      isDispatchEligibleRider({
        status: RiderStatus.ACTIVE,
        user: {
          status: UserStatus.ACTIVE,
        },
        availability: null,
      }),
    ).toBe(false);
  });
});
