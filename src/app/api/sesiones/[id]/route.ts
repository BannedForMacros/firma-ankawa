import { NextResponse } from "next/server";
import { requireUser } from "@/auth";
import { obtenerDetalleSesion, actualizarDocumentoSesion } from "@/server/session-service";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function validarPdf(file: File): { ok: true } | { ok: false; error: string } {
  if (file.type !== "application/pdf") {
    return { ok: false, error: "El documento debe ser un archivo PDF." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, error: "El PDF no puede superar los 20 MB." };
  }
  return { ok: true };
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

export async function PATCH(
  req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es válido." },
      { status: 400 },
    );
  }

  const documento = formData.get("documento");
  if (!(documento instanceof File) || documento.size === 0) {
    return NextResponse.json(
      { error: "Debe adjuntar un archivo PDF." },
      { status: 400 },
    );
  }

  const validacion = validarPdf(documento);
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: 400 });
  }

  const bytes = await documento.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
    return NextResponse.json({ error: "El archivo no es un PDF válido." }, { status: 400 });
  }

  try {
    await actualizarDocumentoSesion(id, buffer);
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el documento. Intente nuevamente." },
      { status: 500 },
    );
  }

  const sesion = await obtenerDetalleSesion(id);
  return NextResponse.json({ sesion }, { status: 200 });
}
