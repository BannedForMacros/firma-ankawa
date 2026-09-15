import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import {
  eliminarFirmaSesion,
  obtenerDetalleSesion,
  ReglaDeNegocioError,
} from "@/server/session-service";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string; firmaId: string }>;
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id: sessionId, firmaId } = await params;
  const { ip, userAgent } = clientInfo(req);

  try {
    await eliminarFirmaSesion(sessionId, firmaId, { id: user.id, ip, userAgent });
  } catch (error) {
    if (error instanceof ReglaDeNegocioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`[firmas DELETE] Error al eliminar la firma ${firmaId}:`, error);
    return NextResponse.json(
      { error: "No se pudo eliminar la firma. Intente nuevamente." },
      { status: 500 },
    );
  }

  const sesion = await obtenerDetalleSesion(sessionId);
  return NextResponse.json({ sesion }, { status: 200 });
}
