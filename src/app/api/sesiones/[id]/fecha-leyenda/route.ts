import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/auth";
import { actualizarFechaLeyendaConformidad, ReglaDeNegocioError } from "@/server/session-service";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  fechaLeyendaConformidad: z.coerce.date({ message: "Ingrese una fecha válida." }),
});

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es válido." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  try {
    const sesion = await actualizarFechaLeyendaConformidad(id, parsed.data.fechaLeyendaConformidad);
    return NextResponse.json({ sesion }, { status: 200 });
  } catch (error) {
    if (error instanceof ReglaDeNegocioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "La sesión no existe." }, { status: 404 });
    }
    console.error(`[fecha-leyenda PATCH] Error para sesión ${id}:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar la fecha. Intente nuevamente." },
      { status: 500 },
    );
  }
}
