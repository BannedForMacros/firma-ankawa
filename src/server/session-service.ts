import type { Prisma, SigningSession, Signer } from "@prisma/client";
import { db } from "@/lib/db";
import { generateSessionToken, generateShortCode } from "@/lib/crypto";
import { registrarAuditoria } from "@/lib/audit";
import type {
  CrearSesionInput,
} from "@/lib/validation";
import type {
  FirmaResumenDto,
  SesionDetalleDto,
  SesionPublicaDto,
  SesionResumenDto,
} from "@/lib/types";

export class ReglaDeNegocioError extends Error {
  constructor(
    message: string,
    public readonly status: number = 409,
  ) {
    super(message);
    this.name = "ReglaDeNegocioError";
  }
}

function maskDocNumber(docNumber: string): string {
  if (docNumber.length <= 4) return docNumber;
  return `${docNumber.slice(0, 2)}${"•".repeat(docNumber.length - 4)}${docNumber.slice(-2)}`;
}

function toFirmaDto(firma: Signer): FirmaResumenDto {
  return {
    id: firma.id,
    docType: firma.docType,
    docNumberMasked: maskDocNumber(firma.docNumber),
    displayName: firma.displayName,
    entidad: firma.entidad,
    repNombre: firma.repNombre,
    cargo: firma.cargo,
    parte: firma.parte,
    verified: firma.verified,
    signMethod: firma.signMethod,
    signedAt: firma.signedAt.toISOString(),
    imageUrl: `/api/firmas/${firma.imagePath}`,
    imageSha256: firma.imageSha256,
  };
}

function toResumenDto(
  sesion: SigningSession & { _count: { signers: number } },
): SesionResumenDto {
  return {
    id: sesion.id,
    code: sesion.code,
    asunto: sesion.asunto,
    expediente: sesion.expediente,
    fechaAudiencia: sesion.fechaAudiencia.toISOString(),
    sede: sesion.sede,
    modalidad: sesion.modalidad,
    status: sesion.status,
    totalFirmas: sesion._count.signers,
    createdAt: sesion.createdAt.toISOString(),
    closedAt: sesion.closedAt?.toISOString() ?? null,
  };
}

export async function crearSesion(
  input: CrearSesionInput,
  actor: { id: string; ip: string; userAgent: string },
): Promise<SesionResumenDto> {
  const sesion = await db.signingSession.create({
    data: {
      ...input,
      code: generateShortCode(),
      token: generateSessionToken(),
      createdById: actor.id,
    },
    include: { _count: { select: { signers: true } } },
  });

  await registrarAuditoria({
    actorType: "USER",
    userId: actor.id,
    action: "SESSION_CREATED",
    entityType: "SigningSession",
    entityId: sesion.id,
    ip: actor.ip,
    userAgent: actor.userAgent,
    metadata: { code: sesion.code, expediente: sesion.expediente },
  });

  return toResumenDto(sesion);
}

export async function listarSesiones(): Promise<SesionResumenDto[]> {
  const sesiones = await db.signingSession.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { signers: true } } },
  });
  return sesiones.map(toResumenDto);
}

export async function obtenerDetalleSesion(
  id: string,
): Promise<SesionDetalleDto | null> {
  const sesion = await db.signingSession.findUnique({
    where: { id },
    include: {
      _count: { select: { signers: true } },
      createdBy: { select: { nombre: true } },
      closedBy: { select: { nombre: true } },
      signers: { orderBy: { signedAt: "asc" } },
    },
  });
  if (!sesion) return null;

  return {
    ...toResumenDto(sesion),
    token: sesion.token,
    closedAt: sesion.closedAt?.toISOString() ?? null,
    closedByNombre: sesion.closedBy?.nombre ?? null,
    createdByNombre: sesion.createdBy.nombre,
    firmas: sesion.signers.map(toFirmaDto),
  };
}

/**
 * Cierra la sesión de firmas. Irreversible: a partir de aquí el backend
 * rechaza cualquier firma nueva (la regla vive en signer-service dentro
 * de la misma transacción, no solo en la UI).
 */
export async function cerrarSesion(
  id: string,
  actor: { id: string; ip: string; userAgent: string },
): Promise<void> {
  await db.$transaction(async (tx) => {
    // SELECT ... FOR UPDATE: serializa el cierre frente a guardarFirma()
    // (que toma el mismo lock), evitando que se persista una firma
    // concurrente con signedAt posterior a closedAt.
    const filas = await tx.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status FROM signing_sessions WHERE id = ${id} FOR UPDATE
    `;
    const sesion = filas[0];
    if (!sesion) throw new ReglaDeNegocioError("La sesión no existe.", 404);
    if (sesion.status === "CLOSED") {
      throw new ReglaDeNegocioError("La sesión de firmas ya fue cerrada.");
    }
    await tx.signingSession.update({
      where: { id },
      data: { status: "CLOSED", closedById: actor.id, closedAt: new Date() },
    });
  });

  await registrarAuditoria({
    actorType: "USER",
    userId: actor.id,
    action: "SESSION_CLOSED",
    entityType: "SigningSession",
    entityId: id,
    ip: actor.ip,
    userAgent: actor.userAgent,
  });
}

export async function obtenerSesionPublicaPorToken(
  token: string,
): Promise<(SesionPublicaDto & { id: string }) | null> {
  const sesion = await db.signingSession.findUnique({ where: { token } });
  if (!sesion) return null;
  return {
    id: sesion.id,
    code: sesion.code,
    asunto: sesion.asunto,
    expediente: sesion.expediente,
    fechaAudiencia: sesion.fechaAudiencia.toISOString(),
    sede: sesion.sede,
    modalidad: sesion.modalidad,
    status: sesion.status,
  };
}

/** Resuelve un código corto ingresado a mano al token de la URL de firma. */
export async function resolverCodigoCorto(
  code: string,
): Promise<{ token: string; status: "OPEN" | "CLOSED" } | null> {
  const sesion = await db.signingSession.findUnique({
    where: { code: code.trim().toUpperCase() },
    select: { token: true, status: true },
  });
  return sesion;
}

export interface ActividadRecienteDto {
  id: string;
  displayName: string;
  sessionId: string;
  sessionCode: string;
  asunto: string;
  verified: boolean;
  signedAt: string; // ISO
}

/** Últimas firmas registradas en cualquier sesión (para el panel). */
export async function listarActividadReciente(
  limite = 6,
): Promise<ActividadRecienteDto[]> {
  const firmas = await db.signer.findMany({
    orderBy: { signedAt: "desc" },
    take: limite,
    include: {
      session: { select: { id: true, code: true, asunto: true } },
    },
  });
  return firmas.map((firma) => ({
    id: firma.id,
    displayName: firma.displayName,
    sessionId: firma.session.id,
    sessionCode: firma.session.code,
    asunto: firma.session.asunto,
    verified: firma.verified,
    signedAt: firma.signedAt.toISOString(),
  }));
}

/** Datos completos para la planilla PDF (server-only). */
export async function obtenerSesionParaPlanilla(id: string): Promise<
  | (SigningSession & {
      signers: Signer[];
    })
  | null
> {
  return db.signingSession.findUnique({
    where: { id },
    include: { signers: { orderBy: { signedAt: "asc" } } },
  });
}

export type { Prisma };
