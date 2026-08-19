/*
  Warnings:

  - You are about to drop the column `documentoFirmadoPdf` on the `signing_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `documentoPdf` on the `signing_sessions` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "session_documents" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "original_path" TEXT NOT NULL,
    "signed_path" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_documents_original_path_key" ON "session_documents"("original_path");

-- CreateIndex
CREATE INDEX "session_documents_session_id_orden_idx" ON "session_documents"("session_id", "orden");

-- Migrate existing single-document sessions to the new table before dropping the legacy columns
INSERT INTO "session_documents" ("id", "session_id", "original_name", "original_path", "signed_path", "orden", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", 'documento.pdf', "documentoPdf", "documentoFirmadoPdf", 0, "createdAt", "createdAt"
FROM "signing_sessions"
WHERE "documentoPdf" IS NOT NULL;

-- AlterTable
ALTER TABLE "signing_sessions" DROP COLUMN "documentoFirmadoPdf",
DROP COLUMN "documentoPdf";

-- AddForeignKey
ALTER TABLE "session_documents" ADD CONSTRAINT "session_documents_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "signing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
