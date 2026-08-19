import { db } from "@/lib/db";
import { guardarDocumentoSesion } from "@/lib/storage";
import { generarPlanillaPdf } from "@/lib/pdf/planilla";

/**
 * Genera la planilla final (documento original + firmas) y la persiste como
 * el documento firmado oficial de la sesión. Sobrescribe cualquier versión
 * anterior en la misma ruta.
 */
export async function generarYGuardarDocumentoFirmado(
  sessionId: string,
): Promise<string | null> {
  const sesion = await db.signingSession.findUnique({
    where: { id: sessionId },
    select: { documentoPdf: true },
  });

  if (!sesion?.documentoPdf) return null;

  const { buffer } = await generarPlanillaPdf(sessionId);
  const stored = await guardarDocumentoSesion(
    sessionId,
    buffer,
    "documento-firmado.pdf",
  );

  await db.signingSession.update({
    where: { id: sessionId },
    data: { documentoFirmadoPdf: stored.relativePath },
  });

  return stored.relativePath;
}
