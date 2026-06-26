import { RaterType, RatingTargetType } from '@prisma/client';
export declare class CreateRatingDto {
    targetType: RatingTargetType;
    targetId: string;
    score: number;
    comment?: string;
}
export declare class RatingDto {
    id: string;
    orderId: string;
    raterType: RaterType;
    raterId: string;
    targetType: RatingTargetType;
    targetId: string;
    score: number;
    comment?: string | null;
    createdAt: Date;
}
export declare function toRatingDto(r: {
    id: string;
    orderId: string;
    raterType: RaterType;
    raterId: string;
    targetType: RatingTargetType;
    targetId: string;
    score: number;
    comment: string | null;
    createdAt: Date;
}): RatingDto;
