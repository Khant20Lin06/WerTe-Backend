import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  CartAggregateEntity,
  CartAggregateItemEntity,
  CartAggregateSelectedOptionEntity,
} from '../entities/cart-aggregate.entity';

export class CartSelectedOptionDto {
  @ApiProperty({
    description: 'Selected cart item option identifier.',
    example: 'cart_item_option_1',
  })
  cartItemOptionId!: string;

  @ApiProperty({
    description: 'Underlying menu option identifier.',
    example: 'option_1',
  })
  itemOptionId!: string;

  @ApiProperty({
    description: 'Underlying menu option display name.',
    example: 'Extra fish cake',
  })
  itemOptionName!: string;

  @ApiProperty({
    description: 'Whether the underlying menu option is still active.',
    example: true,
  })
  itemOptionIsActive!: boolean;

  @ApiProperty({
    description: 'Option group identifier.',
    example: 'group_1',
  })
  optionGroupId!: string;

  @ApiProperty({
    description: 'Option group display name.',
    example: 'Choose extras',
  })
  optionGroupName!: string;

  @ApiProperty({
    description: 'Whether the underlying option group is still active.',
    example: true,
  })
  optionGroupIsActive!: boolean;

  @ApiProperty({
    description: 'Snapshot option name persisted with the cart item.',
    example: 'Extra fish cake',
  })
  nameSnapshot!: string;

  @ApiProperty({
    description: 'Snapshot price delta persisted with the cart item.',
    example: '500',
  })
  priceDeltaSnapshot!: string;
}

export class CartItemDto {
  @ApiProperty({
    description: 'Cart item identifier.',
    example: 'cart_item_1',
  })
  cartItemId!: string;

  @ApiProperty({
    description: 'Menu item identifier.',
    example: 'item_1',
  })
  menuItemId!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the menu item.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiPropertyOptional({
    description: 'Optional category identifier for the cart item.',
    example: 'cat_1',
  })
  categoryId?: string | null;

  @ApiProperty({
    description: 'Menu item display name.',
    example: 'Mohinga',
  })
  menuItemName!: string;

  @ApiPropertyOptional({
    description: 'Optional menu item description.',
    example: 'Signature breakfast item',
  })
  menuItemDescription?: string | null;

  @ApiPropertyOptional({
    description: 'Optional menu item image URL.',
    example: 'https://cdn.example.com/menu/mohinga.png',
  })
  menuItemImageUrl?: string | null;

  @ApiProperty({
    description: 'Current base menu price serialized as a string.',
    example: '2500',
  })
  menuItemBasePrice!: string;

  @ApiProperty({
    description: 'Whether the underlying menu item is currently available.',
    example: true,
  })
  menuItemIsAvailable!: boolean;

  @ApiProperty({
    description: 'Requested cart quantity.',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Persisted unit price snapshot including selected options.',
    example: '3000',
  })
  unitPriceSnapshot!: string;

  @ApiProperty({
    description: 'Persisted line total for this cart item.',
    example: '6000',
  })
  lineTotal!: string;

  @ApiProperty({
    description: 'Selected options persisted for this cart item.',
    type: () => CartSelectedOptionDto,
    isArray: true,
  })
  selectedOptions!: CartSelectedOptionDto[];
}

export class CartDto {
  @ApiPropertyOptional({
    description: 'Active cart identifier. Null when the cart is empty and has not been created yet.',
    example: 'cart_1',
  })
  cartId!: string | null;

  @ApiPropertyOptional({
    description: 'Customer profile identifier that owns the cart.',
    example: 'customer_1',
  })
  customerProfileId!: string | null;

  @ApiProperty({
    description: 'Branch identifier for the cart.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiPropertyOptional({
    description: 'Merchant identifier that owns the branch.',
    example: 'merchant_1',
  })
  merchantId!: string | null;

  @ApiPropertyOptional({
    description: 'Branch display name when an active cart exists.',
    example: 'Downtown Branch',
  })
  branchName!: string | null;

  @ApiPropertyOptional({
    description: 'Branch operational status when available.',
    example: 'ACTIVE',
  })
  branchStatus!: string | null;

  @ApiPropertyOptional({
    description: 'Merchant operational status when available.',
    example: 'ACTIVE',
  })
  merchantStatus!: string | null;

  @ApiProperty({
    description: 'Cart lifecycle status.',
    example: 'ACTIVE',
  })
  status!: string;

  @ApiProperty({
    description: 'Total quantity across all cart items.',
    example: 3,
  })
  totalQuantity!: number;

  @ApiProperty({
    description: 'Cart subtotal serialized as a string.',
    example: '6500',
  })
  subtotalAmount!: string;

  @ApiProperty({
    description: 'Cart total serialized as a string.',
    example: '6500',
  })
  totalAmount!: string;

  @ApiProperty({
    description: 'Whether the cart currently contains no items.',
    example: false,
  })
  isEmpty!: boolean;

  @ApiProperty({
    description: 'Persisted cart items in display order.',
    type: () => CartItemDto,
    isArray: true,
  })
  items!: CartItemDto[];
}

function toCartSelectedOptionDto(
  option: CartAggregateSelectedOptionEntity,
): CartSelectedOptionDto {
  return {
    cartItemOptionId: option.cartItemOptionId,
    itemOptionId: option.itemOptionId,
    itemOptionName: option.itemOptionName,
    itemOptionIsActive: option.itemOptionIsActive,
    optionGroupId: option.optionGroupId,
    optionGroupName: option.optionGroupName,
    optionGroupIsActive: option.optionGroupIsActive,
    nameSnapshot: option.nameSnapshot,
    priceDeltaSnapshot: option.priceDeltaSnapshot,
  };
}

function toCartItemDto(item: CartAggregateItemEntity): CartItemDto {
  return {
    cartItemId: item.cartItemId,
    menuItemId: item.menuItemId,
    branchId: item.branchId,
    categoryId: item.categoryId,
    menuItemName: item.menuItemName,
    menuItemDescription: item.menuItemDescription,
    menuItemImageUrl: item.menuItemImageUrl,
    menuItemBasePrice: item.menuItemBasePrice,
    menuItemIsAvailable: item.menuItemIsAvailable,
    quantity: item.quantity,
    unitPriceSnapshot: item.unitPriceSnapshot,
    lineTotal: item.lineTotal,
    selectedOptions: item.selectedOptions.map((option) =>
      toCartSelectedOptionDto(option),
    ),
  };
}

export function toCartDto(cart: CartAggregateEntity): CartDto {
  return {
    cartId: cart.cartId,
    customerProfileId: cart.customerProfileId,
    branchId: cart.branchId,
    merchantId: cart.merchantId,
    branchName: cart.branchName,
    branchStatus: cart.branchStatus,
    merchantStatus: cart.merchantStatus,
    status: cart.status,
    totalQuantity: cart.totalQuantity,
    subtotalAmount: cart.subtotalAmount,
    totalAmount: cart.totalAmount,
    isEmpty: cart.isEmpty,
    items: cart.items.map((item) => toCartItemDto(item)),
  };
}
