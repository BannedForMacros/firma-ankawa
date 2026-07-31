import { NextResponse } from "next/server";
import { requireUser } from "@/auth";
import { leerImagenFirma } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ path: string[] }>;
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

  const { path } = await params;

  let imagen: Buffer;
  try {
    imagen = await leerImagenFirma(path.join("/"));
  } catch {
    return NextResponse.json(
      { error: "La imagen de firma solicitada no existe." },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(imagen), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Length": String(imagen.byteLength),
    },
  });
}
