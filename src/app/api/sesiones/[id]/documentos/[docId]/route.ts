import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { eliminarDocumentoSesion, obtenerDetalleSesion } from "@/server/session-service";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string; docId: string }>;
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id: sessionId, docId } = await params;

  try {
    await eliminarDocumentoSesion(sessionId, docId);
  } catch (error) {
    console.error(`[documentos DELETE] Error al eliminar documento ${docId}:`, error);
    const message = error instanceof Error ? error.message : "No se pudo eliminar el documento.";
    const status = message.includes("no existe") ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }

  const sesion = await obtenerDetalleSesion(sessionId);
  return NextResponse.json({ sesion }, { status: 200 });
}
