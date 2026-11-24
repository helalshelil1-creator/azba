-- AlterTable
ALTER TABLE "farm_buildings" ADD COLUMN     "area" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "pens" ADD COLUMN     "floorType" TEXT;

-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
