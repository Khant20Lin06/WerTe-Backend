import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import {
  canIngestRiderLocation,
  isDuplicateRiderLocation,
} from '../../../../src/modules/riders/policies/rider-location-policy.helper';
import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';

function makeRider(
  overrides?: Partial<RiderOwnershipRecord>,
): RiderOwnershipRecord {
  return {
    id: 'rider_1',
    userId: 'usr_rider_1',
    displayName: 'Ko Aung',
    vehicleType: 'bike',
    currentTownship: 'Pabedan',
    status: RiderStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_rider_1',
      phone: '0999999999',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
    },
    availability: {
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    },
    ...overrides,
  };
}

describe('rider location policy helper', () => {
  it('allows location ingest for active riders that are online or actively delivering', () => {
    expect(canIngestRiderLocation(makeRider(), false)).toBe(true);
    expect(
      canIngestRiderLocation(
        makeRider({
          availability: {
            isOnline: false,
            isAvailable: false,
            lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
          },
        }),
        true,
      ),
    ).toBe(true);
    expect(
      canIngestRiderLocation(
        makeRider({
          availability: {
            isOnline: false,
            isAvailable: false,
            lastStatusChangedAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-19T10:00:00.000Z'),
          },
        }),
        false,
      ),
    ).toBe(false);
    expect(
      canIngestRiderLocation(
        makeRider({
          status: RiderStatus.SUSPENDED,
        }),
        true,
      ),
    ).toBe(false);
  });

  it('detects duplicate rider locations only when every tracked field matches', () => {
    const currentLocation = {
      riderId: 'rider_1',
      deliveryId: 'delivery_1',
      latitude: { toString: () => '16.834' },
      longitude: { toString: () => '96.176' },
      heading: null,
      speed: null,
      accuracyMeters: null,
      recordedAt: new Date('2026-04-19T10:12:00.000Z'),
    };

    expect(
      isDuplicateRiderLocation(currentLocation as never, {
        deliveryId: 'delivery_1',
        latitude: 16.834,
        longitude: 96.176,
        heading: null,
        speed: null,
        accuracyMeters: null,
        recordedAt: new Date('2026-04-19T10:12:00.000Z'),
      }),
    ).toBe(true);

    expect(
      isDuplicateRiderLocation(currentLocation as never, {
        deliveryId: 'delivery_1',
        latitude: 16.834,
        longitude: 96.177,
        heading: null,
        speed: null,
        accuracyMeters: null,
        recordedAt: new Date('2026-04-19T10:12:00.000Z'),
      }),
    ).toBe(false);
  });
});
