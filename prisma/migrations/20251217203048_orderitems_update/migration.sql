/*
  Warnings:

  - You are about to drop the column `paymenthResult` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "paymenthResult",
ADD COLUMN     "paymentResult" JSON;
