import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutSubmissionService } from '../../checkout/services/checkout-submission.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderCreationService {
  constructor(private readonly checkoutSubmissionService: CheckoutSubmissionService) {}

  create(currentUser: AuthenticatedUserEntity, dto: CreateOrderDto) {
    return this.checkoutSubmissionService.submitCurrentCustomerCheckout(
      currentUser,
      {
        branchId: dto.branchId,
        addressId: dto.addressId,
        deliveryType: dto.deliveryType,
        idempotencyKey: dto.idempotencyKey,
        paymentMethod: dto.paymentMethod,
        paymentProvider: dto.paymentProvider,
        promotionCode: dto.promotionCode,
      },
    );
  }
}
