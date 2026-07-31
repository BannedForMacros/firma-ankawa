import { NextResponse } from "next/server";
import { requireUser } from "@/auth";
import { obtenerDetalleSesion } from "@/server/session-service";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const sesion = await obtenerDetalleSesion(id);
  if (!sesion) {
    return NextResponse.json({ error: "La sesión no existe." }, { status: 404 });
  }

  return NextResponse.json({ sesion }, { status: 200 });
}
