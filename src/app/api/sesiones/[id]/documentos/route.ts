import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { subirDocumentosSesion } from "@/server/session-service";
import { obtenerDetalleSesion } from "@/server/session-service";

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

export async function POST(
  req: NextRequest,
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

  const entradas = formData.getAll("documentos").concat(formData.getAll("documento"));
  const archivos: File[] = [];
  for (const entrada of entradas) {
    if (entrada instanceof File && entrada.size > 0) {
      const validacion = validarPdf(entrada);
      if (!validacion.ok) {
        return NextResponse.json({ error: validacion.error }, { status: 400 });
      }
      archivos.push(entrada);
    }
  }

  if (archivos.length === 0) {
    return NextResponse.json(
      { error: "Debe adjuntar al menos un archivo PDF." },
      { status: 400 },
    );
  }

  const buffers = await Promise.all(
    archivos.map(async (archivo) => ({
      nombre: archivo.name,
      buffer: Buffer.from(await archivo.arrayBuffer()),
    })),
  );

  for (const archivo of buffers) {
    if (archivo.buffer.length === 0 || archivo.buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      return NextResponse.json(
        { error: `El archivo ${archivo.nombre} no es un PDF válido.` },
        { status: 400 },
      );
    }
  }

  try {
    await subirDocumentosSesion(id, buffers);
  } catch (error) {
    console.error(`[documentos POST] Error al guardar PDFs:`, error);
    const message = error instanceof Error ? error.message : "No se pudieron guardar los documentos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const sesion = await obtenerDetalleSesion(id);
  return NextResponse.json({ sesion }, { status: 200 });
}
