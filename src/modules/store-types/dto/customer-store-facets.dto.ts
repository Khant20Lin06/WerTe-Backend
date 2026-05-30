import { ApiProperty } from '@nestjs/swagger';

import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';

export class CustomerStoreTypeFacetDto {
  @ApiProperty({
    description: 'Store type identifier.',
    example: 'store_type_grocery',
  })
  id!: string;

  @ApiProperty({
    description: 'Store type code.',
    example: 'grocery',
  })
  code!: string;

  @ApiProperty({
    description: 'Store type display name.',
    example: 'Grocery',
  })
  name!: string;

  @ApiProperty({
    description: 'Number of customer-visible branches matching this store type.',
    example: 12,
  })
  count!: number;
}

export class CustomerTownshipFacetDto {
  @ApiProperty({
    description: 'Township label.',
    example: 'Kamaryut',
  })
  township!: string;

  @ApiProperty({
    description: 'Number of customer-visible branches in the township.',
    example: 7,
  })
  count!: number;
}

export class CustomerStoreFacetsDto {
  @ApiProperty({
    description: 'Total number of matching customer-visible stores.',
    example: 18,
  })
  totalStoreCount!: number;

  @ApiProperty({
    description: 'Store type facets derived from matching stores.',
    type: CustomerStoreTypeFacetDto,
    isArray: true,
  })
  storeTypes!: CustomerStoreTypeFacetDto[];

  @ApiProperty({
    description: 'Township facets derived from matching stores.',
    type: CustomerTownshipFacetDto,
    isArray: true,
  })
  townships!: CustomerTownshipFacetDto[];
}

export function toCustomerStoreFacetsDto(
  branches: CustomerStoreDiscoveryRecord[],
): CustomerStoreFacetsDto {
  const storeTypeMap = new Map<string, CustomerStoreTypeFacetDto>();
  const townshipMap = new Map<string, CustomerTownshipFacetDto>();

  for (const branch of branches) {
    townshipMap.set(branch.township, {
      township: branch.township,
      count: (townshipMap.get(branch.township)?.count ?? 0) + 1,
    });

    for (const assignment of branch.storeTypes) {
      const key = assignment.storeType.id;

      storeTypeMap.set(key, {
        id: assignment.storeType.id,
        code: assignment.storeType.code,
        name: assignment.storeType.name,
        count: (storeTypeMap.get(key)?.count ?? 0) + 1,
      });
    }
  }

  return {
    totalStoreCount: branches.length,
    storeTypes: [...storeTypeMap.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    townships: [...townshipMap.values()].sort((left, right) =>
      left.township.localeCompare(right.township),
    ),
  };
}
