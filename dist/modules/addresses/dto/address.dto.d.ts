import { AddressOwnershipRecord } from '../entities/address-ownership.entity';
export declare class AddressDto {
    id: string;
    label: string;
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    township: string;
    city?: string | null;
    postalCode?: string | null;
    deliveryInstructions?: string | null;
    isDefault: boolean;
    latitude: string;
    longitude: string;
    createdAt: string;
    updatedAt: string;
}
export declare function toAddressDto(address: AddressOwnershipRecord): AddressDto;
