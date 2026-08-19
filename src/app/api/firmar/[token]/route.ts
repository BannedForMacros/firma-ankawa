import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { guardarFirmaSchema } from "@/lib/validation";
import {
  obtenerSesionPublicaPorToken,
  ReglaDeNegocioError,
} from "@/server/session-service";
import { guardarFirma } from "@/server/signer-service";
import { rateLimit, cleanupExpiredBuckets } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";
import type { SesionPublicaDto } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { ip } = clientInfo(req);

  cleanupExpiredBuckets();
  const limited = rateLimit(`firmar-get:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Ha realizado demasiadas solicitudes. Espere unos segundos e intente nuevamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const { token } = await params;
  const encontrada = await obtenerSesionPublicaPorToken(token);
  if (!encontrada) {
    return NextResponse.json(
      { error: "La sesión de firma no existe. Verifique el enlace o el código." },
      { status: 404 },
    );
  }

  const sesion: SesionPublicaDto = {
    code: encontrada.code,
    asunto: encontrada.asunto,
    expediente: encontrada.expediente,
    fechaAudiencia: encontrada.fechaAudiencia,
    sede: encontrada.sede,
    modalidad: encontrada.modalidad,
    status: encontrada.status,
    documentoPdf: encontrada.documentoPdf,
  };

  return NextResponse.json({ sesion }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { ip, userAgent } = clientInfo(req);

  cleanupExpiredBuckets();
  const limited = rateLimit(`firmar-post:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Ha realizado demasiados intentos de firma. Espere unos segundos e intente nuevamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = guardarFirmaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos de la firma no son válidos." },
      { status: 400 },
    );
  }

  // El flag `verified` enviado por el cliente SE IGNORA: la verificación
  // se decide en el servidor consultando la caché de identidades.
  const { docType, docNumber } = parsed.data;
  const cacheIdentidad = await db.identityCache.findUnique({
    where: { docType_docNumber: { docType, docNumber } },
  });
  const verified = cacheIdentidad !== null;
  const verificationRaw: Prisma.InputJsonValue | null =
    cacheIdentidad !== null
      ? (cacheIdentidad.response as Prisma.InputJsonValue)
      : null;

  const { token } = await params;

  try {
    const firma = await guardarFirma(
      token,
      { ...parsed.data, verified },
      { ip, userAgent, verificationRaw },
    );
    return NextResponse.json({ ok: true, sha256: firma.sha256 }, { status: 201 });
  } catch (error) {
    if (error instanceof ReglaDeNegocioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/firmar] Error al guardar la firma:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la firma. Intente nuevamente." },
      { status: 500 },
    );
  }
}
