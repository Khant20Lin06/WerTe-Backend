import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AddressOwnershipRecord } from '../entities/address-ownership.entity';

export class AddressDto {
  @ApiProperty({
    description: 'Address identifier.',
    example: 'addr_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Customer-facing address label.',
    example: 'Home',
  })
  label!: string;

  @ApiProperty({
    description: 'Primary address line.',
    example: 'No. 1, Main Road',
  })
  line1!: string;

  @ApiPropertyOptional({
    description: 'Secondary address line.',
    example: 'Apartment 5B',
  })
  line2?: string | null;

  @ApiPropertyOptional({
    description: 'Nearby landmark to help riders locate the customer.',
    example: 'Near City Mart',
  })
  landmark?: string | null;

  @ApiProperty({
    description: 'Township or local delivery zone label.',
    example: 'Thingangyun',
  })
  township!: string;

  @ApiPropertyOptional({
    description: 'City name.',
    example: 'Yangon',
  })
  city?: string | null;

  @ApiPropertyOptional({
    description: 'Postal code for the address.',
    example: '11071',
  })
  postalCode?: string | null;

  @ApiPropertyOptional({
    description: 'Additional rider instructions.',
    example: 'Call when arriving at the gate.',
  })
  deliveryInstructions?: string | null;

  @ApiProperty({
    description: 'Whether this address is the default checkout address.',
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({
    description: 'Latitude coordinate serialized as string.',
    example: '16.834',
  })
  latitude!: string;

  @ApiProperty({
    description: 'Longitude coordinate serialized as string.',
    example: '96.176',
  })
  longitude!: string;

  @ApiProperty({
    description: 'Address creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Address last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toAddressDto(address: AddressOwnershipRecord): AddressDto {
  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    landmark: address.landmark,
    township: address.township,
    city: address.city,
    postalCode: address.postalCode,
    deliveryInstructions: address.deliveryInstructions,
    isDefault: address.isDefault,
    latitude: address.latitude.toString(),
    longitude: address.longitude.toString(),
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}
