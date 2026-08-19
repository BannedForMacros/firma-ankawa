import { NextResponse, type NextRequest } from "next/server";
import { leerDocumentoSesion } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const relativePath = path.join("/");

  try {
    const buffer = await leerDocumentoSesion(relativePath);
    console.log(`[documentos GET] Sirviendo ${relativePath}: ${buffer.length} bytes`);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "El documento no existe o no es accesible." },
      { status: 404 },
    );
  }
}
