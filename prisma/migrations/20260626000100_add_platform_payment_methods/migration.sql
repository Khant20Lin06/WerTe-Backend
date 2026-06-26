-- CreateTable
CREATE TABLE IF NOT EXISTS "PlatformPaymentMethod" (
    "id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "bankDetails" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformPaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformPaymentMethod_method_key" ON "PlatformPaymentMethod"("method");

-- Seed default payment methods
INSERT INTO "PlatformPaymentMethod" ("id", "method", "displayName", "description", "isEnabled", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid()::text, 'CASH_ON_DELIVERY', 'Cash on Delivery', 'Pay with cash when your order arrives', true, 1, NOW()),
  (gen_random_uuid()::text, 'BANK_TRANSFER', 'Bank Transfer', 'Transfer to our bank account and upload receipt', false, 2, NOW()),
  (gen_random_uuid()::text, 'DIGITAL_WALLET', 'KBZ Pay / Wave Pay', 'Pay via mobile wallet', false, 3, NOW())
ON CONFLICT ("method") DO NOTHING;
