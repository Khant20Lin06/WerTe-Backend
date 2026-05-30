export declare enum ConversationTypeValue {
    orderChat = "order_chat",
    customerMerchant = "customer_merchant",
    customerRider = "customer_rider",
    merchantRider = "merchant_rider",
    customerOperations = "customer_operations",
    merchantOperations = "merchant_operations",
    riderOperations = "rider_operations"
}
export declare class CreateConversationDto {
    orderId: string;
    type: ConversationTypeValue;
}
