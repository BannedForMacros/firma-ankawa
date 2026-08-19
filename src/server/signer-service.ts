import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { PNG } from "pngjs";
import { db } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto";
import { guardarImagenFirma } from "@/lib/storage";
import { registrarAuditoria } from "@/lib/audit";
import { ReglaDeNegocioError } from "@/server/session-service";
import type { GuardarFirmaInput } from "@/lib/validation";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_DIMENSION_PX = 4000;

/**
 * Verifica que los bytes recibidos sean un PNG real y decodificable.
 * El schema Zod solo valida el prefijo del data URL y el alfabeto base64;
 * sin esta comprobación, bytes arbitrarios se persistirían como firma y
 * romperían la generación de la planilla PDF de TODA la sesión.
 */
function validarPng(buffer: Buffer): void {
  const invalida = new ReglaDeNegocioError(
    "La imagen de la firma no es un PNG válido. Dibuje o cargue nuevamente su firma.",
    400,
  );

  // Magic bytes + primer chunk IHDR con dimensiones razonables
  // (se comprueban ANTES de decodificar para evitar bombas de descompresión).
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    throw invalida;
  }
  if (buffer.toString("latin1", 12, 16) !== "IHDR") {
    throw invalida;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width < 1 || height < 1 || width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    throw new ReglaDeNegocioError(
      "Las dimensiones de la imagen de la firma no son válidas.",
      400,
    );
  }

  // Decodificación completa: garantiza que @react-pdf podrá renderizarla.
  try {
    PNG.sync.read(buffer);
  } catch {
    throw invalida;
  }
}

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
  validarPng(imageBuffer);
  const sha256 = sha256Hex(imageBuffer);
  const fileId = randomUUID();

  const signer = await db
    .$transaction(async (tx) => {
      // SELECT ... FOR UPDATE: bloquea la fila de la sesión hasta el commit.
      // Sin el lock, con READ COMMITTED cerrarSesion() puede confirmar CLOSED
      // entre esta lectura y el INSERT (TOCTOU), persistiendo una firma con
      // signedAt posterior a closedAt.
      const filas = await tx.$queryRaw<Array<{ id: string; status: string }>>`
        SELECT id, status FROM signing_sessions WHERE token = ${sessionToken} FOR UPDATE
      `;
      const sesion = filas[0];
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
          entidad: input.entidad ?? null,
          repNombre: input.repNombre ?? null,
          repDni: input.repDni ?? null,
          cargo: input.cargo,
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
