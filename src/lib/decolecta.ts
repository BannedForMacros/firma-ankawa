import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { IdentidadDto } from "@/lib/types";

/**
 * Cliente server-side de la API Decolecta (RENIEC/SUNAT).
 * El token DECOLECTA_API jamás sale del servidor. Las respuestas se
 * cachean por documento (IdentityCache) para no gastar cuota.
 */

const BASE_URL = "https://api.decolecta.com/v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 h

export type ResultadoIdentidad =
  | { ok: true; identidad: IdentidadDto; raw: Prisma.InputJsonValue; cached: boolean }
  | { ok: false; status: number; error: string };

interface DecolectaDni {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  full_name: string;
  document_number: string;
}

interface DecolectaRuc {
  razon_social: string;
  numero_documento: string;
  estado: string;
  condicion: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
}

function tokenConfigurado(): string | null {
  const token = process.env.DECOLECTA_API;
  return token && token.trim().length > 0 ? token.trim() : null;
}

async function fetchDecolecta(
  path: string,
): Promise<{ status: number; body: unknown }> {
  const token = tokenConfigurado();
  if (!token) return { status: 503, body: null };

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // La identidad de una persona no cambia entre reintentos: sin caché HTTP,
    // usamos nuestra caché en BD que además sirve de evidencia.
    cache: "no-store",
  });
  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, body };
}

function mapDni(numero: string, data: DecolectaDni): IdentidadDto {
  return {
    tipo: "DNI",
    numero,
    nombreCompleto:
      data.full_name ??
      `${data.first_name} ${data.first_last_name} ${data.second_last_name}`.trim(),
    verificado: true,
  };
}

function mapRuc(numero: string, data: DecolectaRuc): IdentidadDto {
  const estado = (data.estado ?? "").toUpperCase();
  const condicion = (data.condicion ?? "").toUpperCase();
  const ubicacion = [data.direccion, data.distrito, data.provincia, data.departamento]
    .filter((v): v is string => Boolean(v && v.trim()))
    .join(", ");
  return {
    tipo: "RUC",
    numero,
    razonSocial: data.razon_social,
    estado,
    condicion,
    direccion: ubicacion.length > 0 ? ubicacion : null,
    verificado: true,
    habilitado: estado === "ACTIVO" && condicion === "HABIDO",
  };
}

export async function consultarIdentidad(
  docType: "DNI" | "RUC",
  docNumber: string,
): Promise<ResultadoIdentidad> {
  // 1) Caché por documento
  const cached = await db.identityCache.findUnique({
    where: { docType_docNumber: { docType, docNumber } },
  });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    const raw = cached.response as Prisma.InputJsonValue;
    const identidad =
      docType === "DNI"
        ? mapDni(docNumber, cached.response as unknown as DecolectaDni)
        : mapRuc(docNumber, cached.response as unknown as DecolectaRuc);
    return { ok: true, identidad, raw, cached: true };
  }

  // 2) Llamada a Decolecta
  const path =
    docType === "DNI"
      ? `/reniec/dni?numero=${docNumber}`
      : `/sunat/ruc?numero=${docNumber}`;

  let status: number;
  let body: unknown;
  try {
    ({ status, body } = await fetchDecolecta(path));
  } catch {
    return {
      ok: false,
      status: 502,
      error:
        "No se pudo contactar el servicio de verificación de identidad. Puede continuar con registro manual no verificado.",
    };
  }

  if (status === 503) {
    return {
      ok: false,
      status: 503,
      error:
        "El servicio de verificación no está configurado. Continúe con registro manual no verificado.",
    };
  }
  if (status === 400 || status === 422) {
    return {
      ok: false,
      status,
      error:
        docType === "DNI"
          ? "El DNI consultado no es válido según RENIEC."
          : "El RUC consultado no es válido según SUNAT.",
    };
  }
  if (status === 404) {
    return {
      ok: false,
      status,
      error: "No se encontró el documento consultado.",
    };
  }
  if (status !== 200 || body === null || typeof body !== "object") {
    return {
      ok: false,
      status,
      error:
        "El servicio de verificación devolvió una respuesta inesperada. Intente nuevamente o continúe con registro manual.",
    };
  }

  // 3) Persistir en caché (la respuesta cruda es evidencia de verificación)
  const raw = body as Prisma.InputJsonValue;
  await db.identityCache.upsert({
    where: { docType_docNumber: { docType, docNumber } },
    update: { response: raw, fetchedAt: new Date() },
    create: { docType, docNumber, response: raw },
  });

  const identidad =
    docType === "DNI"
      ? mapDni(docNumber, body as DecolectaDni)
      : mapRuc(docNumber, body as DecolectaRuc);
  return { ok: true, identidad, raw, cached: false };
}
