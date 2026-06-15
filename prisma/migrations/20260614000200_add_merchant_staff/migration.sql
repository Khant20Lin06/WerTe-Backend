-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MERCHANT_STAFF';

-- CreateEnum
CREATE TYPE "MerchantStaffRole" AS ENUM ('MANAGER', 'CASHIER', 'KITCHEN');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- CreateTable
CREATE TABLE "MerchantStaff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "role" "MerchantStaffRole" NOT NULL DEFAULT 'CASHIER',
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchStaffAssignment" (
    "staffId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchStaffAssignment_pkey" PRIMARY KEY ("staffId","branchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantStaff_userId_key" ON "MerchantStaff"("userId");

-- CreateIndex
CREATE INDEX "MerchantStaff_merchantId_idx" ON "MerchantStaff"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantStaff_merchantId_status_idx" ON "MerchantStaff"("merchantId", "status");

-- CreateIndex
CREATE INDEX "MerchantStaff_userId_idx" ON "MerchantStaff"("userId");

-- CreateIndex
CREATE INDEX "BranchStaffAssignment_branchId_idx" ON "BranchStaffAssignment"("branchId");

-- AddForeignKey
ALTER TABLE "MerchantStaff" ADD CONSTRAINT "MerchantStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantStaff" ADD CONSTRAINT "MerchantStaff_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStaffAssignment" ADD CONSTRAINT "BranchStaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "MerchantStaff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStaffAssignment" ADD CONSTRAINT "BranchStaffAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
