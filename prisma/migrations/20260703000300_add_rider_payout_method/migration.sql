-- CreateEnum
CREATE TYPE "RiderPayoutMethodType" AS ENUM ('BANK_ACCOUNT', 'KBZ_PAY', 'WAVE_PAY', 'AYA_PAY');

-- CreateTable
CREATE TABLE "RiderPayoutMethod" (
    "riderId" TEXT NOT NULL,
    "type" "RiderPayoutMethodType" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiderPayoutMethod_pkey" PRIMARY KEY ("riderId")
);

-- AddForeignKey
ALTER TABLE "RiderPayoutMethod" ADD CONSTRAINT "RiderPayoutMethod_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
