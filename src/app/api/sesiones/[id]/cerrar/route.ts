import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { cerrarSesion, ReglaDeNegocioError } from "@/server/session-service";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const { ip, userAgent } = clientInfo(req);

  try {
    await cerrarSesion(id, { id: user.id, ip, userAgent });
  } catch (error) {
    if (error instanceof ReglaDeNegocioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/sesiones/cerrar] Error al cerrar la sesión:", error);
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión de firmas. Intente nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
