/*
  Warnings:

  - You are about to drop the column `version` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isAsset` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `ProductColor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductSize` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `idempotencyKey` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductColor" DROP CONSTRAINT "ProductColor_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSize" DROP CONSTRAINT "ProductSize_productId_fkey";

-- DropIndex
DROP INDEX "Cart_updatedAt_idx";

-- DropIndex
DROP INDEX "CartItem_cartId_idx";

-- DropIndex
DROP INDEX "Coupon_isActive_endsAt_idx";

-- DropIndex
DROP INDEX "CouponRedemption_couponId_userId_idx";

-- DropIndex
DROP INDEX "CouponRedemption_couponId_userId_key";

-- DropIndex
DROP INDEX "CouponRedemption_userId_idx";

-- DropIndex
DROP INDEX "Order_status_createdAt_idx";

-- DropIndex
DROP INDEX "Order_userId_createdAt_idx";

-- DropIndex
DROP INDEX "OrderItem_orderId_idx";

-- DropIndex
DROP INDEX "OrderItem_productId_idx";

-- DropIndex
DROP INDEX "ProductVariant_productId_isActive_idx";

-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- DropIndex
DROP INDEX "UserAddress_userId_idx";

-- DropIndex
DROP INDEX "WishlistItem_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "version",
ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "isAsset",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "sku",
DROP COLUMN "version";

-- DropTable
DROP TABLE "ProductColor";

-- DropTable
DROP TABLE "ProductSize";
