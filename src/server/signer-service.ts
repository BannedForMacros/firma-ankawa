import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto";
import { guardarImagenFirma } from "@/lib/storage";
import { registrarAuditoria } from "@/lib/audit";
import { ReglaDeNegocioError } from "@/server/session-service";
import type { GuardarFirmaInput } from "@/lib/validation";

export interface EvidenciaFirma {
  ip: string;
  userAgent: string;
  verificationRaw: Prisma.InputJsonValue | null;
}

export interface FirmaGuardada {
  signerId: string;
  sha256: string;
  signedAt: Date;
}

/**
 * Guarda la firma de un firmante sobre una sesión ABIERTA.
 *
 * Reglas de integridad (validadas en BD, no solo en UI):
 *  - La sesión debe existir y estar OPEN dentro de la transacción.
 *  - Un mismo documento no puede firmar dos veces (unique sessionId+docNumber).
 *  - El hash SHA-256 del PNG y el timestamp del SERVIDOR quedan persistidos.
 */
export async function guardarFirma(
  sessionToken: string,
  input: GuardarFirmaInput,
  evidencia: EvidenciaFirma,
): Promise<FirmaGuardada> {
  const base64 = input.imageDataUrl.replace(/^data:image\/png;base64,/, "");
  const imageBuffer = Buffer.from(base64, "base64");
  const sha256 = sha256Hex(imageBuffer);
  const fileId = randomUUID();

  const signer = await db
    .$transaction(async (tx) => {
      const sesion = await tx.signingSession.findUnique({
        where: { token: sessionToken },
      });
      if (!sesion) {
        throw new ReglaDeNegocioError("La sesión de firma no existe.", 404);
      }
      if (sesion.status === "CLOSED") {
        throw new ReglaDeNegocioError(
          "La sesión de firmas fue cerrada. Ya no es posible firmar.",
          423,
        );
      }

      return tx.signer.create({
        data: {
          sessionId: sesion.id,
          docType: input.docType,
          docNumber: input.docNumber,
          displayName: input.displayName,
          repNombre: input.repNombre ?? null,
          repDni: input.repDni ?? null,
          cargo: input.cargo,
          parte: input.parte,
          verified: input.verified,
          verificationRaw: evidencia.verificationRaw ?? Prisma.JsonNull,
          signMethod: input.signMethod,
          imagePath: `${sesion.id}/${fileId}.png`,
          imageSha256: sha256,
          ip: evidencia.ip,
          userAgent: evidencia.userAgent,
        },
      });
    })
    .catch((error: unknown) => {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ReglaDeNegocioError(
          "Este documento de identidad ya firmó esta sesión.",
          409,
        );
      }
      throw error;
    });

  try {
    await guardarImagenFirma(signer.sessionId, fileId, input.imageDataUrl);
  } catch (error) {
    // Si el disco falla, revertimos el registro para no dejar una firma sin imagen.
    await db.signer.delete({ where: { id: signer.id } }).catch(() => undefined);
    throw error;
  }

  await registrarAuditoria({
    actorType: "SIGNER",
    action: "SIGNATURE_SAVED",
    entityType: "Signer",
    entityId: signer.id,
    ip: evidencia.ip,
    userAgent: evidencia.userAgent,
    metadata: {
      sessionId: signer.sessionId,
      docType: input.docType,
      docNumber: input.docNumber,
      verified: input.verified,
      signMethod: input.signMethod,
      sha256,
    },
  });

  return { signerId: signer.id, sha256, signedAt: signer.signedAt };
}
