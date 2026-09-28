--MIGRATION DO AI VIET DE THU TU CHHAY SQL MIGRATION KO DO CODEGEN TU TAoj
-- CreateTable
CREATE TABLE "CouponTranslation" (
    "couponId" TEXT NOT NULL,
    "languageCode" VARCHAR(10) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CouponTranslation_pkey" PRIMARY KEY ("couponId","languageCode")
);

-- Seed supported languages (idempotent)
INSERT INTO "Language" ("code", "name", "isDefault", "isActive", "createdAt", "updatedAt")
VALUES
    ('en', 'English', true, true, NOW(), NOW()),
    ('vi', 'Tiếng Việt', false, true, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- Preserve existing coupon descriptions as the default-language translation
INSERT INTO "CouponTranslation" ("couponId", "languageCode", "description")
SELECT "id", 'en', "description" FROM "Coupon"
ON CONFLICT ("couponId", "languageCode") DO NOTHING;

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "description";

-- AddForeignKey
ALTER TABLE "CouponTranslation" ADD CONSTRAINT "CouponTranslation_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponTranslation" ADD CONSTRAINT "CouponTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
