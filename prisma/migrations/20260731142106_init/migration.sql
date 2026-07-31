-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('DNI', 'RUC');

-- CreateEnum
CREATE TYPE "SignMethod" AS ENUM ('DRAWN', 'UPLOADED');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'VIRTUAL', 'MIXTA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signing_sessions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "expediente" TEXT NOT NULL,
    "fechaAudiencia" TIMESTAMP(3) NOT NULL,
    "sede" TEXT NOT NULL,
    "modalidad" "Modalidad" NOT NULL DEFAULT 'PRESENCIAL',
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "docNumber" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "repNombre" TEXT,
    "repDni" TEXT,
    "cargo" TEXT NOT NULL,
    "parte" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationRaw" JSONB,
    "signMethod" "SignMethod" NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageSha256" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,

    CONSTRAINT "signers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_cache" (
    "id" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "docNumber" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "signing_sessions_code_key" ON "signing_sessions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "signing_sessions_token_key" ON "signing_sessions"("token");

-- CreateIndex
CREATE INDEX "signing_sessions_status_createdAt_idx" ON "signing_sessions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "signers_sessionId_signedAt_idx" ON "signers"("sessionId", "signedAt");

-- CreateIndex
CREATE UNIQUE INDEX "signers_sessionId_docNumber_key" ON "signers"("sessionId", "docNumber");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "identity_cache_docType_docNumber_key" ON "identity_cache"("docType", "docNumber");

-- AddForeignKey
ALTER TABLE "signing_sessions" ADD CONSTRAINT "signing_sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signing_sessions" ADD CONSTRAINT "signing_sessions_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signers" ADD CONSTRAINT "signers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "signing_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
