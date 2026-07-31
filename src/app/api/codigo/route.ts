import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolverCodigoCorto } from "@/server/session-service";
import { rateLimit, cleanupExpiredBuckets } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

const codigoSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Ingrese el código de la sesión de firma.")
    .max(20, "El código ingresado es demasiado largo."),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { ip } = clientInfo(req);

  cleanupExpiredBuckets();
  const limited = rateLimit(`codigo:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Ha realizado demasiados intentos. Espere unos segundos e intente nuevamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = codigoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ingrese el código de la sesión de firma." },
      { status: 400 },
    );
  }

  const sesion = await resolverCodigoCorto(parsed.data.code);
  if (!sesion) {
    return NextResponse.json(
      { error: "Código no encontrado. Verifique que lo haya ingresado tal como aparece en el afiche." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { token: sesion.token, status: sesion.status },
    { status: 200 },
  );
}
