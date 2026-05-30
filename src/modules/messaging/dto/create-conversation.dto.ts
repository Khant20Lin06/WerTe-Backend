import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum ConversationTypeValue {
  orderChat = 'order_chat',
  customerMerchant = 'customer_merchant',
  customerRider = 'customer_rider',
  merchantRider = 'merchant_rider',
  customerOperations = 'customer_operations',
  merchantOperations = 'merchant_operations',
  riderOperations = 'rider_operations',
}

export class CreateConversationDto {
  @ApiProperty({
    description: 'Order identifier that scopes the conversation.',
    example: 'ord_123',
  })
  @IsString()
  orderId!: string;

  @ApiProperty({
    description: 'Allowed conversation type for the order-scoped chat flow.',
    enum: ConversationTypeValue,
    enumName: 'ConversationTypeValue',
    example: ConversationTypeValue.customerRider,
  })
  @IsEnum(ConversationTypeValue)
  type!: ConversationTypeValue;
}
