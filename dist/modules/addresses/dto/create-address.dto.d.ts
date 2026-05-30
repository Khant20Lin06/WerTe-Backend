export declare class CreateAddressDto {
    label: string;
    line1: string;
    line2?: string;
    landmark?: string;
    township: string;
    city?: string;
    postalCode?: string;
    deliveryInstructions?: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
}
