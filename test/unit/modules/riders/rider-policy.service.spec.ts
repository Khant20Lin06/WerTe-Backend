import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';
import { RiderPolicyService } from '../../../../src/modules/riders/policies/rider-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('RiderPolicyService', () => {
  const service = new RiderPolicyService();

  const rider: RiderOwnershipRecord = {
    id: 'rider_1',
    userId: 'usr_rider_1',
    displayName: 'Ko Aung',
    vehicleType: 'bike',
    plateNumber: null,
    currentTownship: 'Kamaryut',
    weeklySchedule: null,
    status: RiderStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_rider_1',
      phone: '0977777777',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
    },
    availability: null,
  };

  it('allows the owning rider to access the rider profile', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_rider_1',
      role: UserRole.RIDER,
      actorContext: {
        userId: 'usr_rider_1',
        phone: '0977777777',
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderId: 'rider_1',
      },
    });

    expect(service.canAccessRider(currentUser, rider)).toBe(true);
  });

  it('denies access when the actor is not the owning rider', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_rider_2',
      role: UserRole.RIDER,
      actorContext: {
        userId: 'usr_rider_2',
        phone: '0970000000',
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderId: 'rider_1',
      },
    });

    expect(service.canAccessRider(currentUser, rider)).toBe(false);
  });
});
