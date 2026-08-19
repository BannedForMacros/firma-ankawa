import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import type { Signer } from "@prisma/client";
import {
  ReglaDeNegocioError,
  obtenerSesionParaPlanilla,
} from "@/server/session-service";
import { leerImagenFirma, leerDocumentoSesion } from "@/lib/storage";
import { fechaHoraLegal, leyendaConformidad } from "@/lib/dates";
import { calcularEspacioUltimaPagina } from "@/lib/pdf/page-space";
import {
  calcularAlturaBloque,
  dibujarBloqueFirmas,
} from "@/lib/pdf/dibujar-bloque-firmas";

/**
 * Planilla de firmas oficial en PDF.
 *
 * Si la sesión tiene un documento PDF adjunto, la planilla se anexa al final
 * de ese documento; de lo contrario, se genera un PDF de una sola página con
 * la planilla de firmas.
 */

const NEGRO = "#000000";

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 64,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: NEGRO,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  logo: {
    height: 48,
    width: 68,
    objectFit: "contain",
  },
  tituloCentro: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    flexShrink: 1,
  },
  leyenda: {
    fontSize: 10,
    marginTop: 12,
    marginBottom: 18,
  },
  sinFirmas: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
  },
  // Tabla con bordes colapsados: el contenedor aporta el borde superior e
  // izquierdo; cada celda aporta solo su borde derecho e inferior.
  tabla: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: NEGRO,
    borderLeftColor: NEGRO,
    borderTopStyle: "solid",
    borderLeftStyle: "solid",
  },
  fila: {
    flexDirection: "row",
  },
  celda: {
    width: "50%",
    height: 140,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: NEGRO,
    borderBottomColor: NEGRO,
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  zonaFirma: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  imagenFirma: {
    maxHeight: 66,
    maxWidth: "90%",
    objectFit: "contain",
  },
  lineaFirma: {
    borderBottomWidth: 1,
    borderBottomColor: NEGRO,
    borderBottomStyle: "solid",
    marginTop: 2,
    marginBottom: 5,
  },
  bloqueDatos: {
    alignItems: "center",
  },
  textoDato: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
    marginBottom: 1,
  },
  textoEntidad: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textAlign: "center",
    marginBottom: 1,
  },
  pie: {
    position: "absolute",
    bottom: 24,
    left: 64,
    right: 64,
  },
  pieSesion: {
    fontSize: 7,
    marginBottom: 2,
  },
  pieHash: {
    fontSize: 6,
    marginBottom: 1,
  },
});

interface FirmaConImagen {
  firma: Signer;
  imagenDataUri: string;
}

function agruparEnFilas(items: FirmaConImagen[]): FirmaConImagen[][] {
  const filas: FirmaConImagen[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    filas.push(items.slice(i, i + 2));
  }
  return filas;
}

function CeldaFirma({ firma, imagenDataUri }: FirmaConImagen) {
  return (
    <View style={estilos.celda}>
      <View style={estilos.zonaFirma}>
        <Image src={imagenDataUri} style={estilos.imagenFirma} />
      </View>
      <View style={estilos.lineaFirma} />
      <View style={estilos.bloqueDatos}>
        {firma.entidad ? (
          <Text style={estilos.textoEntidad}>{firma.entidad.toUpperCase()}</Text>
        ) : null}
        <Text style={estilos.textoDato}>{firma.displayName.toUpperCase()}</Text>
        {firma.cargo ? (
          <Text style={estilos.textoEntidad}>{firma.cargo.toUpperCase()}</Text>
        ) : null}
        <Text style={estilos.textoEntidad}>{`DNI: ${firma.docNumber}`}</Text>
      </View>
    </View>
  );
}

function CeldaVacia() {
  return <View style={estilos.celda} />;
}

interface PlanillaDocProps {
  logoDataUri: string;
  asunto: string;
  expediente: string;
  fechaAudiencia: Date;
  code: string;
  firmasConImagen: FirmaConImagen[];
}

function PlanillaDocumento({
  logoDataUri,
  asunto,
  expediente,
  fechaAudiencia,
  code,
  firmasConImagen,
}: PlanillaDocProps) {
  const filas = agruparEnFilas(firmasConImagen);

  return (
    <Document
      title={`Planilla de firmas ${code}`}
      author="CARD - ANKAWA INTL"
      language="es-PE"
    >
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.encabezado}>
          <Image src={logoDataUri} style={estilos.logo} />
          <Text style={estilos.tituloCentro}>
            Centro de Arbitraje y Resolución de Disputas CARD - ANKAWA INTL
          </Text>
        </View>

        <Text style={estilos.leyenda}>{leyendaConformidad(fechaAudiencia)}</Text>

        {firmasConImagen.length === 0 ? (
          <Text style={estilos.sinFirmas}>
            La sesión no registra firmas a la fecha de generación.
          </Text>
        ) : (
          <View style={estilos.tabla}>
            {filas.map((fila) => (
              <View
                key={fila[0].firma.id}
                style={estilos.fila}
                wrap={false}
              >
                <CeldaFirma
                  firma={fila[0].firma}
                  imagenDataUri={fila[0].imagenDataUri}
                />
                {fila.length === 2 ? (
                  <CeldaFirma
                    firma={fila[1].firma}
                    imagenDataUri={fila[1].imagenDataUri}
                  />
                ) : (
                  <CeldaVacia />
                )}
              </View>
            ))}
          </View>
        )}

        <View style={estilos.pie}>
          <Text style={estilos.pieSesion}>
            {`Sesión ${code} — ${asunto} — Expediente ${expediente} — Generado el ${fechaHoraLegal(new Date())}`}
          </Text>
          {firmasConImagen.map(({ firma }) => (
            <Text key={firma.id} style={estilos.pieHash}>
              {`${firma.displayName} · DNI ${firma.docNumber} · SHA-256 ${firma.imageSha256}`}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}

function bufferADataUri(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/** Genera la planilla PDF oficial de la sesión indicada. */
export async function generarPlanillaPdf(
  sessionId: string,
): Promise<{ buffer: Buffer; code: string }> {
  const sesion = await obtenerSesionParaPlanilla(sessionId);
  if (!sesion) {
    throw new ReglaDeNegocioError("La sesión no existe.", 404);
  }

  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "brand", "logo.png"),
  );
  const logoDataUri = bufferADataUri(logoBuffer);

  const firmasConImagen: FirmaConImagen[] = await Promise.all(
    sesion.signers.map(async (firma) => ({
      firma,
      imagenDataUri: bufferADataUri(await leerImagenFirma(firma.imagePath)),
    })),
  );

  const planillaBuffer = await renderToBuffer(
    <PlanillaDocumento
      logoDataUri={logoDataUri}
      asunto={sesion.asunto}
      expediente={sesion.expediente}
      fechaAudiencia={sesion.fechaAudiencia}
      code={sesion.code}
      firmasConImagen={firmasConImagen}
    />,
  );

  // Si no hay documento adjunto, se devuelve la planilla de firmas sola.
  if (!sesion.documentoPdf) {
    return { buffer: Buffer.from(planillaBuffer), code: sesion.code };
  }

  try {
    const documentoOriginal = await leerDocumentoSesion(sesion.documentoPdf);
    const pdfDoc = await PDFDocument.load(documentoOriginal);

    const margenInferior = 40;
    const margenLateral = 56;
    const gap = 8;
    const blockWidth = (await medirUltimaPagina(pdfDoc)).width - margenLateral * 2;
    const blockHeight = await calcularAlturaBloque(sesion.signers.length);

    const espacio = await calcularEspacioUltimaPagina(documentoOriginal, margenInferior);

    // Si hay espacio suficiente en la última página, dibujamos el bloque de firmas
    // justo después del contenido existente (seguido). De lo contrario, añadimos una
    // página nueva con la planilla generada por react-pdf.
    if (espacio && espacio.availableSpace >= blockHeight + gap) {
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      // Colocamos el bloque inmediatamente debajo del contenido, sin taparlo.
      const startY = espacio.contentBottomY - gap - blockHeight;
      const startX = margenLateral;

      await dibujarBloqueFirmas(
        pdfDoc,
        lastPage,
        startX,
        Math.max(margenInferior, startY),
        blockWidth,
        blockHeight,
        sesion.signers,
        {
          code: sesion.code,
          asunto: sesion.asunto,
          expediente: sesion.expediente,
          fechaAudiencia: sesion.fechaAudiencia,
        },
      );

      const mergedBytes = await pdfDoc.save();
      return { buffer: Buffer.from(mergedBytes), code: sesion.code };
    }

    const merged = await mergePdfs(documentoOriginal, Buffer.from(planillaBuffer));
    return { buffer: merged, code: sesion.code };
  } catch (error) {
    console.warn(
      "[planilla] No se pudo fusionar el documento adjunto; se generará solo la planilla.",
      error,
    );
    return { buffer: Buffer.from(planillaBuffer), code: sesion.code };
  }
}

async function medirUltimaPagina(pdfDoc: PDFDocument): Promise<{ width: number }> {
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();
  return { width };
}

async function mergePdfs(originalBuffer: Buffer, signaturesBuffer: Buffer): Promise<Buffer> {
  const [originalPdf, signaturesPdf] = await Promise.all([
    PDFDocument.load(originalBuffer),
    PDFDocument.load(signaturesBuffer),
  ]);

  const copiedPages = await originalPdf.copyPages(
    signaturesPdf,
    signaturesPdf.getPageIndices(),
  );
  for (const page of copiedPages) {
    originalPdf.addPage(page);
  }

  const mergedBytes = await originalPdf.save();
  return Buffer.from(mergedBytes);
}
