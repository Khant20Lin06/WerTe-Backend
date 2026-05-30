import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressDto } from '../dto/address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';
import { DeleteAddressResponseDto } from '../dto/delete-address-response.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CustomerAddressesService } from '../services/customer-addresses.service';

@ApiTags('customer-addresses')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/addresses')
export class CustomerAddressesController {
  constructor(
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  @ApiOperation({
    operationId: 'listCustomerAddresses',
    summary: 'List the authenticated customer addresses',
  })
  @ApiOkResponse({
    description: 'Returns addresses owned by the authenticated customer.',
    type: AddressDto,
    isArray: true,
  })
  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.customerAddressesService.listCurrentCustomerAddresses(
      currentUser,
    );
  }

  @ApiOperation({
    operationId: 'createCustomerAddress',
    summary: 'Create a new customer address',
  })
  @ApiBody({ type: CreateAddressDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a customer-owned address.',
    type: AddressDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateAddressDto,
  ) {
    return this.customerAddressesService.createCurrentCustomerAddress(
      currentUser,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateCustomerAddress',
    summary: 'Update a customer-owned address',
  })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested customer address.',
    type: AddressDto,
  })
  @Patch(':addressId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('addressId') addressId: string,
    @Body() body: UpdateAddressDto,
  ) {
    return this.customerAddressesService.updateCurrentCustomerAddress(
      currentUser,
      addressId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'deleteCustomerAddress',
    summary: 'Delete a customer-owned address',
  })
  @ApiOkResponse({
    description:
      'Deletes the requested address and promotes another address to default when needed.',
    type: DeleteAddressResponseDto,
  })
  @Delete(':addressId')
  remove(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('addressId') addressId: string,
  ) {
    return this.customerAddressesService.deleteCurrentCustomerAddress(
      currentUser,
      addressId,
    );
  }
}
