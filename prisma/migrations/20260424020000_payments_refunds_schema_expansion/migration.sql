-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'DIGITAL_WALLET', 'CARD', 'BANK_TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('COD', 'MANUAL', 'STRIPE', 'KBZ_PAY', 'WAVE_PAY', 'AYA_PAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SystemMessageCode" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "SystemMessageCode" ADD VALUE 'PAYMENT_SUCCEEDED';
ALTER TYPE "SystemMessageCode" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "SystemMessageCode" ADD VALUE 'PAYMENT_CANCELLED';
ALTER TYPE "SystemMessageCode" ADD VALUE 'REFUND_REQUESTED';
ALTER TYPE "SystemMessageCode" ADD VALUE 'REFUND_SUCCEEDED';
ALTER TYPE "SystemMessageCode" ADD VALUE 'REFUND_FAILED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_STATUS_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'REFUND_STATUS_UPDATED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditResourceType" ADD VALUE 'PAYMENT';
ALTER TYPE "AuditResourceType" ADD VALUE 'PAYMENT_ATTEMPT';
ALTER TYPE "AuditResourceType" ADD VALUE 'REFUND';
ALTER TYPE "AuditResourceType" ADD VALUE 'REFUND_ATTEMPT';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerProfileId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(65,30) NOT NULL,
    "refundedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'MMK',
    "idempotencyKey" TEXT,
    "providerReference" TEXT,
    "providerReceiptId" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "metadataJson" JSONB,
    "requiresActionAt" TIMESTAMP(3),
    "succeededAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "providerReference" TEXT,
    "requestPayloadJson" JSONB,
    "responsePayloadJson" JSONB,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'MMK',
    "idempotencyKey" TEXT,
    "providerReference" TEXT,
    "reasonCode" TEXT,
    "note" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "metadataJson" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "succeededAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundAttempt" (
    "id" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "providerReference" TEXT,
    "requestPayloadJson" JSONB,
    "responsePayloadJson" JSONB,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_orderId_createdAt_idx" ON "Payment"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_orderId_status_createdAt_idx" ON "Payment"("orderId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_customerProfileId_createdAt_idx" ON "Payment"("customerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_updatedAt_idx" ON "Payment"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Payment_provider_providerReference_idx" ON "Payment"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_attemptedAt_idx" ON "PaymentAttempt"("paymentId", "attemptedAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_attemptedAt_idx" ON "PaymentAttempt"("status", "attemptedAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_providerReference_idx" ON "PaymentAttempt"("provider", "providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Refund_paymentId_requestedAt_idx" ON "Refund"("paymentId", "requestedAt");

-- CreateIndex
CREATE INDEX "Refund_orderId_requestedAt_idx" ON "Refund"("orderId", "requestedAt");

-- CreateIndex
CREATE INDEX "Refund_status_updatedAt_idx" ON "Refund"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Refund_createdByUserId_requestedAt_idx" ON "Refund"("createdByUserId", "requestedAt");

-- CreateIndex
CREATE INDEX "Refund_providerReference_idx" ON "Refund"("providerReference");

-- CreateIndex
CREATE INDEX "RefundAttempt_refundId_attemptedAt_idx" ON "RefundAttempt"("refundId", "attemptedAt");

-- CreateIndex
CREATE INDEX "RefundAttempt_status_attemptedAt_idx" ON "RefundAttempt"("status", "attemptedAt");

-- CreateIndex
CREATE INDEX "RefundAttempt_provider_providerReference_idx" ON "RefundAttempt"("provider", "providerReference");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundAttempt" ADD CONSTRAINT "RefundAttempt_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

