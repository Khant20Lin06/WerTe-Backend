-- CreateTable
CREATE TABLE "OrderDispatchAttempt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "outcomeCode" TEXT NOT NULL DEFAULT 'pending',
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "OrderDispatchAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderDispatchAttempt_orderId_attemptedAt_idx" ON "OrderDispatchAttempt"("orderId", "attemptedAt");

-- CreateIndex
CREATE INDEX "OrderDispatchAttempt_orderId_outcomeCode_idx" ON "OrderDispatchAttempt"("orderId", "outcomeCode");

-- AddForeignKey
ALTER TABLE "OrderDispatchAttempt" ADD CONSTRAINT "OrderDispatchAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
