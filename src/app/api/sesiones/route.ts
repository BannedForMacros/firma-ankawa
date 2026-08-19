import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { crearSesionSchema } from "@/lib/validation";
import { crearSesion } from "@/server/session-service";
import { subirDocumentosSesion } from "@/server/session-service";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

function validarPdf(file: File): { ok: true } | { ok: false; error: string } {
  if (file.type !== "application/pdf") {
    return { ok: false, error: "El documento debe ser un archivo PDF." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, error: "El PDF no puede superar los 20 MB." };
  }
  return { ok: true };
}

export async function GET(): Promise<NextResponse> {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { listarSesiones } = await import("@/server/session-service");
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
    modalidad: getString("modalidad"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos de la sesión no son válidos." },
      { status: 400 },
    );
  }

  // Recolecta documentos adjuntos: soporta campo único "documento" o múltiple "documentos".
  const entradas = formData.getAll("documentos").concat(formData.get("documento") ?? []);
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

  for (const archivo of archivos) {
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (buffer.length === 0 || buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      return NextResponse.json({ error: "El archivo no es un PDF válido." }, { status: 400 });
    }
  }

  const { ip, userAgent } = clientInfo(req);
  const sesion = await crearSesion(parsed.data, { id: user.id, ip, userAgent });

  if (archivos.length > 0) {
    const buffers = await Promise.all(
      archivos.map(async (archivo) => ({
        nombre: archivo.name,
        buffer: Buffer.from(await archivo.arrayBuffer()),
      })),
    );
    await subirDocumentosSesion(sesion.id, buffers);
  }

  return NextResponse.json({ sesion }, { status: 201 });
}
