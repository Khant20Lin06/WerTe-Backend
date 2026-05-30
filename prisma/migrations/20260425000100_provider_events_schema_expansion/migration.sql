-- CreateEnum
CREATE TYPE "ProviderEventVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ProviderEventProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- AlterEnum
ALTER TYPE "AuditResourceType" ADD VALUE 'PAYMENT_PROVIDER_EVENT';
ALTER TYPE "AuditResourceType" ADD VALUE 'REFUND_PROVIDER_EVENT';

-- CreateTable
CREATE TABLE "PaymentProviderEvent" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerEventId" TEXT,
    "eventType" TEXT NOT NULL,
    "paymentId" TEXT,
    "orderId" TEXT,
    "providerReference" TEXT,
    "normalizedStatus" "PaymentStatus",
    "verificationStatus" "ProviderEventVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "processingStatus" "ProviderEventProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "signatureHeader" TEXT,
    "headersJson" JSONB,
    "rawPayloadJson" JSONB NOT NULL,
    "normalizedPayloadJson" JSONB,
    "processingMetadataJson" JSONB,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProviderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundProviderEvent" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerEventId" TEXT,
    "eventType" TEXT NOT NULL,
    "refundId" TEXT,
    "paymentId" TEXT,
    "orderId" TEXT,
    "providerReference" TEXT,
    "normalizedStatus" "RefundStatus",
    "verificationStatus" "ProviderEventVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "processingStatus" "ProviderEventProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "signatureHeader" TEXT,
    "headersJson" JSONB,
    "rawPayloadJson" JSONB NOT NULL,
    "normalizedPayloadJson" JSONB,
    "processingMetadataJson" JSONB,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundProviderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProviderEvent_provider_providerEventId_key" ON "PaymentProviderEvent"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "PaymentProviderEvent_provider_eventType_receivedAt_idx" ON "PaymentProviderEvent"("provider", "eventType", "receivedAt");

-- CreateIndex
CREATE INDEX "PaymentProviderEvent_provider_providerReference_idx" ON "PaymentProviderEvent"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "PaymentProviderEvent_paymentId_receivedAt_idx" ON "PaymentProviderEvent"("paymentId", "receivedAt");

-- CreateIndex
CREATE INDEX "PaymentProviderEvent_orderId_receivedAt_idx" ON "PaymentProviderEvent"("orderId", "receivedAt");

-- CreateIndex
CREATE INDEX "PaymentProviderEvent_verificationStatus_processingStatus_receivedAt_idx" ON "PaymentProviderEvent"("verificationStatus", "processingStatus", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefundProviderEvent_provider_providerEventId_key" ON "RefundProviderEvent"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_provider_eventType_receivedAt_idx" ON "RefundProviderEvent"("provider", "eventType", "receivedAt");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_provider_providerReference_idx" ON "RefundProviderEvent"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_refundId_receivedAt_idx" ON "RefundProviderEvent"("refundId", "receivedAt");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_paymentId_receivedAt_idx" ON "RefundProviderEvent"("paymentId", "receivedAt");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_orderId_receivedAt_idx" ON "RefundProviderEvent"("orderId", "receivedAt");

-- CreateIndex
CREATE INDEX "RefundProviderEvent_verificationStatus_processingStatus_receivedAt_idx" ON "RefundProviderEvent"("verificationStatus", "processingStatus", "receivedAt");

-- AddForeignKey
ALTER TABLE "PaymentProviderEvent" ADD CONSTRAINT "PaymentProviderEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProviderEvent" ADD CONSTRAINT "PaymentProviderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundProviderEvent" ADD CONSTRAINT "RefundProviderEvent_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundProviderEvent" ADD CONSTRAINT "RefundProviderEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundProviderEvent" ADD CONSTRAINT "RefundProviderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
