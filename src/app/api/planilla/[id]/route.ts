import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/auth";
import { registrarAuditoria } from "@/lib/audit";
import { clientInfo } from "@/lib/request";
import { generarPlanillaPdf } from "@/lib/pdf/planilla";
import { ReglaDeNegocioError } from "@/server/session-service";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json(
      { error: "Inicie sesión para descargar la planilla de firmas." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const url = new URL(req.url);
  const modo = url.searchParams.get("modo");
  const documentoId = url.searchParams.get("documentoId");
  const esPreview = modo === "preview";

  let documentoOriginalPath: string | undefined;
  if (documentoId) {
    const documento = await db.sessionDocument.findFirst({
      where: { id: documentoId, sessionId: id },
      select: { originalPath: true },
    });
    if (!documento) {
      return NextResponse.json({ error: "El documento no existe en esta sesión." }, { status: 404 });
    }
    documentoOriginalPath = documento.originalPath;
  }

  try {
    const { buffer, code } = await generarPlanillaPdf(id, documentoOriginalPath);

    const { ip, userAgent } = clientInfo(req);
    await registrarAuditoria({
      actorType: "USER",
      userId: user.id,
      action: "PDF_GENERATED",
      entityType: "SigningSession",
      entityId: id,
      ip,
      userAgent,
      metadata: { code, modo: esPreview ? "preview" : "download", documentoId },
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": esPreview
          ? `inline; filename="planilla-${code}.pdf"`
          : `attachment; filename="planilla-${code}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof ReglaDeNegocioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[planilla] No se pudo generar el PDF:", error);
    return NextResponse.json(
      { error: "No se pudo generar la planilla. Intente nuevamente en unos minutos." },
      { status: 500 },
    );
  }
}
