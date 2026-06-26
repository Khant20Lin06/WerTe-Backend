import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutPreviewDto, toCheckoutPreviewDto } from '../dto/checkout-preview.dto';
import { PreviewCheckoutDto } from '../dto/preview-checkout.dto';
import { CheckoutPreviewService } from '../services/checkout-preview.service';

@ApiTags('customer-checkout')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/checkout')
export class CustomerCheckoutController {
  constructor(private readonly checkoutPreviewService: CheckoutPreviewService) {}

  @ApiOperation({
    operationId: 'previewCurrentCustomerCheckout',
    summary: 'Preview the validated checkout for the authenticated customer',
  })
  @ApiBody({ type: PreviewCheckoutDto })
  @ApiOkResponse({
    description:
      'Returns the validated checkout preview including customer, address, cart, branch, and pricing context.',
    type: CheckoutPreviewDto,
  })
  @Post('preview')
  async preview(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: PreviewCheckoutDto,
  ): Promise<CheckoutPreviewDto> {
    const preview =
      await this.checkoutPreviewService.previewCurrentCustomerCheckout(
        currentUser,
        {
          branchId: body.branchId,
          addressId: body.addressId,
          deliveryType: body.deliveryType,
          promotionCode: body.promotionCode,
        },
      );

    return toCheckoutPreviewDto(preview);
  }
}
