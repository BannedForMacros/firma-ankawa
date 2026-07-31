import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { crearSesionSchema } from "@/lib/validation";
import { crearSesion, listarSesiones } from "@/server/session-service";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sesiones = await listarSesiones();
  return NextResponse.json({ sesiones }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = crearSesionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos de la sesión no son válidos." },
      { status: 400 },
    );
  }

  const { ip, userAgent } = clientInfo(req);
  const sesion = await crearSesion(parsed.data, { id: user.id, ip, userAgent });
  return NextResponse.json({ sesion }, { status: 201 });
}
