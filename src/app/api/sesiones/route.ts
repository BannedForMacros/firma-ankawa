import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { crearSesionSchema } from "@/lib/validation";
import { crearSesion, listarSesiones } from "@/server/session-service";
import { guardarDocumentoSesion } from "@/lib/storage";
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

function validarPdf(file: File): { ok: true } | { ok: false; error: string } {
  if (file.type !== "application/pdf") {
    return { ok: false, error: "El documento debe ser un archivo PDF." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, error: "El PDF no puede superar los 20 MB." };
  }
  return { ok: true };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
  }

  const getString = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const parsed = crearSesionSchema.safeParse({
    asunto: getString("asunto"),
    expediente: getString("expediente"),
    fechaAudiencia: getString("fechaAudiencia"),
    sede: getString("sede"),
    modalidad: getString("modalidad"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos de la sesión no son válidos." },
      { status: 400 },
    );
  }

  const documento = formData.get("documento");
  let pdfBuffer: Buffer | null = null;
  if (documento instanceof File && documento.size > 0) {
    const validacion = validarPdf(documento);
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error }, { status: 400 });
    }
    const bytes = await documento.arrayBuffer();
    pdfBuffer = Buffer.from(bytes);
    if (pdfBuffer.length === 0 || pdfBuffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      return NextResponse.json({ error: "El archivo no es un PDF válido." }, { status: 400 });
    }
  }

  const { ip, userAgent } = clientInfo(req);
  const sesion = await crearSesion(parsed.data, { id: user.id, ip, userAgent });

  let documentoPdf: string | null = null;
  if (pdfBuffer) {
    console.log(`[sesiones POST] Guardando PDF para sesión ${sesion.id}: ${pdfBuffer.length} bytes`);
    const stored = await guardarDocumentoSesion(sesion.id, pdfBuffer);
    documentoPdf = stored.relativePath;
    console.log(`[sesiones POST] PDF guardado en: ${stored.relativePath}`);
  }

  // Actualizamos la sesión con la ruta del documento si se subió.
  if (documentoPdf) {
    const { db } = await import("@/lib/db");
    await db.signingSession.update({
      where: { id: sesion.id },
      data: { documentoPdf },
    });
  }

  return NextResponse.json({ sesion }, { status: 201 });
}
