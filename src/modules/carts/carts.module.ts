import { Module } from '@nestjs/common';

import { CustomerProfilesModule } from '../customer-profiles/customer-profiles.module';
import { MenusModule } from '../menus/menus.module';
import { CustomerCartController } from './controllers/customer-cart.controller';
import { CartsRepository } from './repositories/carts.repository';
import { CartMutationService } from './services/cart-mutation.service';
import { CartPricingService } from './services/cart-pricing.service';
import { CartQueryService } from './services/cart-query.service';
import { CartsService } from './services/carts.service';
import { CustomerCartService } from './services/customer-cart.service';

@Module({
  imports: [CustomerProfilesModule, MenusModule],
  controllers: [CustomerCartController],
  providers: [
    CartsRepository,
    CartsService,
    CartQueryService,
    CartPricingService,
    CartMutationService,
    CustomerCartService,
  ],
  exports: [
    CartsRepository,
    CartsService,
    CartQueryService,
    CartPricingService,
    CartMutationService,
    CustomerCartService,
  ],
})
export class CartsModule {}
