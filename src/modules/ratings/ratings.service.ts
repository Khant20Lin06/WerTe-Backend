import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RaterType, RatingTargetType } from '@prisma/client';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsRepository } from './repositories/ratings.repository';

@Injectable()
export class RatingsService {
  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createCustomerRating(
    customerId: string,
    orderId: string,
    dto: CreateRatingDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerProfileId !== customerId) throw new ForbiddenException('Not your order');
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Order must be delivered before rating');
    }

    if (dto.targetType === RatingTargetType.RIDER) {
      if (!order.delivery?.riderId) throw new BadRequestException('No rider assigned to this order');
      if (order.delivery.riderId !== dto.targetId) throw new BadRequestException('Invalid rider for this order');
    } else if (dto.targetType === RatingTargetType.BRANCH) {
      if (order.branchId !== dto.targetId) throw new BadRequestException('Invalid branch for this order');
    } else {
      throw new BadRequestException('Customers can only rate RIDER or BRANCH');
    }

    const existing = await this.ratingsRepository.findExisting(orderId, RaterType.CUSTOMER, dto.targetType);
    if (existing) throw new BadRequestException('You have already rated this for the order');

    return this.ratingsRepository.create({
      orderId,
      raterType: RaterType.CUSTOMER,
      raterId: customerId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      score: dto.score,
      comment: dto.comment,
    });
  }

  async createRiderRating(
    riderId: string,
    deliveryId: string,
    dto: CreateRatingDto,
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.riderId !== riderId) throw new ForbiddenException('Not your delivery');
    if (delivery.status !== 'DELIVERED') {
      throw new BadRequestException('Delivery must be completed before rating');
    }
    if (dto.targetType !== RatingTargetType.CUSTOMER) {
      throw new BadRequestException('Riders can only rate CUSTOMER');
    }
    if (delivery.order.customerProfileId !== dto.targetId) {
      throw new BadRequestException('Invalid customer for this delivery');
    }

    const existing = await this.ratingsRepository.findExisting(
      delivery.orderId,
      RaterType.RIDER,
      RatingTargetType.CUSTOMER,
    );
    if (existing) throw new BadRequestException('You have already rated this customer');

    return this.ratingsRepository.create({
      orderId: delivery.orderId,
      raterType: RaterType.RIDER,
      raterId: riderId,
      targetType: RatingTargetType.CUSTOMER,
      targetId: dto.targetId,
      score: dto.score,
      comment: dto.comment,
    });
  }

  async getOrderRatings(orderId: string) {
    return this.ratingsRepository.findByOrder(orderId);
  }

  async getTargetRatings(targetType: RatingTargetType, targetId: string) {
    const [ratings, average] = await Promise.all([
      this.ratingsRepository.findByTarget(targetType, targetId),
      this.ratingsRepository.averageScore(targetType, targetId),
    ]);
    return { ratings, average, count: ratings.length };
  }

  async getAdminStats() {
    return this.ratingsRepository.globalStats();
  }

  async getAdminList(params: { targetType?: RatingTargetType; page: number; limit: number }) {
    return this.ratingsRepository.listAll(params);
  }

  async getTopRatedBranches(limit = 10) {
    return this.ratingsRepository.topRatedBranches(limit);
  }

  async getTopRatedRiders(limit = 10) {
    return this.ratingsRepository.topRatedRiders(limit);
  }
}
