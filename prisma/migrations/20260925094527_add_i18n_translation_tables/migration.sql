/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `detailedDescription` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description",
DROP COLUMN "detailedDescription",
DROP COLUMN "name",
DROP COLUMN "slug";

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "categoryId" INTEGER NOT NULL,
    "languageCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("categoryId","languageCode")
);

-- CreateTable
CREATE TABLE "Language" (
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "productId" INTEGER NOT NULL,
    "languageCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detailedDescription" TEXT,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("productId","languageCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_languageCode_slug_key" ON "CategoryTranslation"("languageCode", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_languageCode_name_key" ON "CategoryTranslation"("languageCode", "name");

-- CreateIndex
CREATE INDEX "ProductTranslation_languageCode_name_idx" ON "ProductTranslation"("languageCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_languageCode_slug_key" ON "ProductTranslation"("languageCode", "slug");

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
