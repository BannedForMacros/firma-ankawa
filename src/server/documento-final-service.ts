import { db } from "@/lib/db";
import { guardarDocumentoFirmado } from "@/lib/storage";
import { generarPlanillaPdf } from "@/lib/pdf/planilla";

/**
 * Genera la planilla final para cada documento de la sesión y la persiste
 * como documento firmado oficial. Los documentos que ya tengan un PDF firmado
 * previo se regeneran y sobrescriben.
 */
export async function generarYGuardarDocumentosFirmados(
  sessionId: string,
): Promise<void> {
  const documentos = await db.sessionDocument.findMany({
    where: { sessionId },
    orderBy: { orden: "asc" },
  });

  if (documentos.length === 0) return;

  for (const documento of documentos) {
    if (!documento.originalPath) continue;

    try {
      const { buffer } = await generarPlanillaPdf(sessionId, documento.originalPath);
      const stored = await guardarDocumentoFirmado(sessionId, documento.id, buffer);

      await db.sessionDocument.update({
        where: { id: documento.id },
        data: { signedPath: stored.relativePath },
      });
    } catch (error) {
      console.error(
        `[generarYGuardarDocumentosFirmados] Error en documento ${documento.id} de sesión ${sessionId}:`,
        error,
      );
    }
  }
}
