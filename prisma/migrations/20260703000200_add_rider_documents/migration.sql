-- CreateEnum
CREATE TYPE "RiderDocumentType" AS ENUM ('DRIVERS_LICENSE', 'NATIONAL_ID', 'VEHICLE_REGISTRATION', 'INSURANCE');

-- CreateEnum
CREATE TYPE "RiderDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RiderDocument" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "type" "RiderDocumentType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "RiderDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiderDocument_riderId_idx" ON "RiderDocument"("riderId");

-- CreateIndex
CREATE INDEX "RiderDocument_riderId_type_idx" ON "RiderDocument"("riderId", "type");

-- CreateIndex
CREATE INDEX "RiderDocument_status_idx" ON "RiderDocument"("status");

-- AddForeignKey
ALTER TABLE "RiderDocument" ADD CONSTRAINT "RiderDocument_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
