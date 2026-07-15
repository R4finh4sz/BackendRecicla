CREATE TYPE "EcoCoinTransactionType" AS ENUM ('CREDIT', 'REDEMPTION', 'REFUND');
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

ALTER TABLE "users" ADD COLUMN "ecoCoinBalance" DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE "products" (
  "id" TEXT NOT NULL, "adminId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "description" TEXT NOT NULL, "photo" TEXT NOT NULL, "price" DECIMAL(12,2) NOT NULL,
  "quantity" INTEGER NOT NULL, "city" TEXT NOT NULL, "state" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "redemptions" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL, "unitPrice" DECIMAL(12,2) NOT NULL, "totalPrice" DECIMAL(12,2) NOT NULL,
  "pickupCode" TEXT, "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL, "completedAt" TIMESTAMP(3), "validatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "eco_coin_transactions" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "grantedById" TEXT, "redemptionId" TEXT,
  "type" "EcoCoinTransactionType" NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
  "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "eco_coin_transactions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "redemptions_pickupCode_key" ON "redemptions"("pickupCode");
CREATE INDEX "products_city_state_active_idx" ON "products"("city", "state", "active");
CREATE INDEX "products_adminId_idx" ON "products"("adminId");
CREATE INDEX "redemptions_userId_status_idx" ON "redemptions"("userId", "status");
CREATE INDEX "redemptions_productId_status_idx" ON "redemptions"("productId", "status");
CREATE INDEX "redemptions_status_expiresAt_idx" ON "redemptions"("status", "expiresAt");
CREATE INDEX "eco_coin_transactions_userId_createdAt_idx" ON "eco_coin_transactions"("userId", "createdAt");
CREATE INDEX "eco_coin_transactions_redemptionId_idx" ON "eco_coin_transactions"("redemptionId");
ALTER TABLE "products" ADD CONSTRAINT "products_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "eco_coin_transactions" ADD CONSTRAINT "eco_coin_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "eco_coin_transactions" ADD CONSTRAINT "eco_coin_transactions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
