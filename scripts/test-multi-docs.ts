import { readFile } from "node:fs/promises";
import { db } from "@/lib/db";
import {
  crearSesion,
  subirDocumentosSesion,
  cerrarSesion,
  obtenerDetalleSesion,
} from "@/server/session-service";

const USER_ID = "cmt04w82x00002nwjp7pocug8";
const PDF_PATH = "storage/documentos/cmt0ala8l00012nh21c8adv6o/4a8af7d3-4a17-4746-8ad3-788fbcd41542/original.pdf";

async function main() {
  const buffer = await readFile(PDF_PATH);

  const sesion = await crearSesion(
    {
      asunto: "Sesión de prueba multi-documentos",
      expediente: "TEST-001",
      fechaAudiencia: new Date(),
      modalidad: "PRESENCIAL",
    },
    { id: USER_ID, ip: "127.0.0.1", userAgent: "test-script" },
  );
  console.log("✅ Sesión creada:", sesion.id, sesion.code);

  const documentos = await subirDocumentosSesion(sesion.id, [
    { nombre: "doc-prueba-1.pdf", buffer },
    { nombre: "doc-prueba-2.pdf", buffer },
  ]);
  console.log(
    "✅ Documentos subidos:",
    documentos.length,
    documentos.map((d) => d.originalName),
  );

  await cerrarSesion(sesion.id, {
    id: USER_ID,
    ip: "127.0.0.1",
    userAgent: "test-script",
  });
  console.log("✅ Sesión cerrada");

  const detalle = await obtenerDetalleSesion(sesion.id);
  console.log(
    "✅ Documentos en detalle:",
    detalle?.documentos.length,
  );
  for (const doc of detalle?.documentos ?? []) {
    console.log(
      "  -",
      doc.originalName,
      "| firmado generado:",
      !!doc.signedPath,
    );
  }

  // Limpieza
  await db.signingSession.delete({ where: { id: sesion.id } });
  console.log("🧹 Sesión de prueba eliminada");
}

main().catch((error) => {
  console.error("❌ Error en test:", error);
  process.exit(1);
});
