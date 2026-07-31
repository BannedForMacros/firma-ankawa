import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { consultaIdentidadSchema } from "@/lib/validation";
import { consultarIdentidad } from "@/lib/decolecta";
import { obtenerSesionPublicaPorToken } from "@/server/session-service";
import { registrarAuditoria } from "@/lib/audit";
import { rateLimit, cleanupExpiredBuckets } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

const tokenSchema = z.object({
  sessionToken: z.string().trim().min(1, "Falta el token de la sesión de firma."),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { ip, userAgent } = clientInfo(req);

  cleanupExpiredBuckets();
  const limited = rateLimit(`identidad:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Ha realizado demasiadas consultas. Espere unos segundos e intente nuevamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es válido." },
      { status: 400 },
    );
  }

  const tokenParsed = tokenSchema.safeParse(body);
  if (!tokenParsed.success) {
    return NextResponse.json(
      { error: tokenParsed.error.issues[0]?.message ?? "Falta el token de la sesión de firma." },
      { status: 400 },
    );
  }

  const consultaParsed = consultaIdentidadSchema.safeParse(body);
  if (!consultaParsed.success) {
    return NextResponse.json(
      { error: consultaParsed.error.issues[0]?.message ?? "Los datos del documento no son válidos." },
      { status: 400 },
    );
  }

  const sesion = await obtenerSesionPublicaPorToken(tokenParsed.data.sessionToken);
  if (!sesion) {
    return NextResponse.json(
      { error: "La sesión de firma no existe. Verifique el enlace o el código." },
      { status: 404 },
    );
  }
  if (sesion.status !== "OPEN") {
    return NextResponse.json(
      { error: "La sesión de firmas fue cerrada. Ya no es posible verificar identidades." },
      { status: 423 },
    );
  }

  const { docType, docNumber } = consultaParsed.data;
  const resultado = await consultarIdentidad(docType, docNumber);

  await registrarAuditoria({
    actorType: "SIGNER",
    action: "IDENTITY_LOOKUP",
    entityType: "Identity",
    ip,
    userAgent,
    metadata: {
      docType,
      docNumber,
      resultado: resultado.ok
        ? resultado.cached
          ? "ENCONTRADO_CACHE"
          : "ENCONTRADO"
        : `ERROR_${resultado.status}`,
    },
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: resultado.status });
  }

  return NextResponse.json({ identidad: resultado.identidad }, { status: 200 });
}
