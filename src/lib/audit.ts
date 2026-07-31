import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type AuditAction =
  | "SESSION_CREATED"
  | "IDENTITY_LOOKUP"
  | "SIGNATURE_SAVED"
  | "SESSION_CLOSED"
  | "PDF_GENERATED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "LOGIN_FAILED"
  | "SEED_EXECUTED";

export interface AuditEntry {
  actorType: "USER" | "SIGNER" | "SYSTEM";
  userId?: string;
  action: AuditAction;
  entityType: "SigningSession" | "Signer" | "User" | "Identity";
  entityId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Registra un evento de auditoría. Nunca lanza: un fallo de auditoría
 * no debe tumbar la operación principal, pero sí queda en consola.
 */
export async function registrarAuditoria(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorType: entry.actorType,
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        ip: entry.ip,
        userAgent: entry.userAgent,
        metadata: entry.metadata,
      },
    });
  } catch (error) {
    console.error("[audit] No se pudo registrar el evento:", entry.action, error);
  }
}
