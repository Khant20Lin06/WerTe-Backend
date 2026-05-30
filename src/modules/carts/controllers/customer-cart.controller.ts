import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { CartDto } from '../dto/cart.dto';
import { GetCartQueryDto } from '../dto/get-cart-query.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CustomerCartService } from '../services/customer-cart.service';

@ApiTags('customer-cart')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/cart')
export class CustomerCartController {
  constructor(private readonly customerCartService: CustomerCartService) {}

  @ApiOperation({
    operationId: 'getCurrentCustomerCart',
    summary: 'Return the active cart for the authenticated customer and branch',
  })
  @ApiQuery({
    name: 'branchId',
    description: 'Branch identifier used to scope the active cart lookup.',
    type: String,
  })
  @ApiOkResponse({
    description:
      'Returns the active cart aggregate for the requested branch, or an empty cart contract when none exists.',
    type: CartDto,
  })
  @Get()
  getCurrentCart(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: GetCartQueryDto,
  ): Promise<CartDto> {
    return this.customerCartService.getCurrentCustomerCart(
      currentUser,
      query.branchId,
    );
  }

  @ApiOperation({
    operationId: 'addCurrentCustomerCartItem',
    summary: 'Add a menu item into the authenticated customer cart',
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiCreatedResponse({
    description: 'Adds a cart item and returns the updated cart aggregate.',
    type: CartDto,
  })
  @Post('items')
  addItem(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: AddCartItemDto,
  ): Promise<CartDto> {
    return this.customerCartService.addCurrentCustomerCartItem(currentUser, body);
  }

  @ApiOperation({
    operationId: 'updateCurrentCustomerCartItem',
    summary: 'Update a customer-owned cart item',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({
    description: 'Updates a cart item and returns the updated cart aggregate.',
    type: CartDto,
  })
  @Patch('items/:cartItemId')
  updateItem(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('cartItemId') cartItemId: string,
    @Body() body: UpdateCartItemDto,
  ): Promise<CartDto> {
    return this.customerCartService.updateCurrentCustomerCartItem(
      currentUser,
      cartItemId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'removeCurrentCustomerCartItem',
    summary: 'Remove a customer-owned cart item',
  })
  @ApiOkResponse({
    description: 'Removes a cart item and returns the updated cart aggregate.',
    type: CartDto,
  })
  @Delete('items/:cartItemId')
  removeItem(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('cartItemId') cartItemId: string,
  ): Promise<CartDto> {
    return this.customerCartService.removeCurrentCustomerCartItem(
      currentUser,
      cartItemId,
    );
  }

  @ApiOperation({
    operationId: 'clearCurrentCustomerCart',
    summary: 'Clear the active cart for the authenticated customer and branch',
  })
  @ApiQuery({
    name: 'branchId',
    description: 'Branch identifier used to scope the active cart clear operation.',
    type: String,
  })
  @ApiOkResponse({
    description:
      'Clears all cart items for the requested branch and returns the resulting empty cart aggregate.',
    type: CartDto,
  })
  @Delete()
  clearCart(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: GetCartQueryDto,
  ): Promise<CartDto> {
    return this.customerCartService.clearCurrentCustomerCart(
      currentUser,
      query.branchId,
    );
  }
}
