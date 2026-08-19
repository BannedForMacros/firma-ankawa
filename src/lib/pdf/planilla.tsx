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
import type { Signer } from "@prisma/client";
import {
  ReglaDeNegocioError,
  obtenerSesionParaPlanilla,
} from "@/server/session-service";
import { leerImagenFirma } from "@/lib/storage";
import { fechaHoraLegal, leyendaConformidad } from "@/lib/dates";

/**
 * Planilla de firmas oficial en PDF.
 *
 * Decisión tipográfica: se usa Helvetica (y Helvetica-Bold), la fuente
 * estándar incorporada de @react-pdf/renderer. No se registran fuentes
 * externas para mantener el PDF liviano y la generación determinista.
 */

const NEGRO = "#000000";

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: NEGRO,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
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
  datoLinea: {
    fontSize: 10,
    marginBottom: 2,
  },
  datoEtiqueta: {
    fontFamily: "Helvetica-Bold",
  },
  leyenda: {
    fontSize: 10,
    marginTop: 10,
    marginBottom: 14,
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
    height: 150,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: NEGRO,
    borderBottomColor: NEGRO,
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 6,
  },
  zonaFirma: {
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  imagenFirma: {
    maxHeight: 70,
    maxWidth: "85%",
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
  pie: {
    marginTop: 16,
  },
  pieSesion: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
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
          <Text style={estilos.textoDato}>{`ENTIDAD: ${firma.entidad}`.toUpperCase()}</Text>
        ) : null}
        <Text style={estilos.textoDato}>{`NOMBRE: ${firma.displayName}`.toUpperCase()}</Text>
        <Text style={estilos.textoDato}>{`CARGO: ${firma.cargo}`.toUpperCase()}</Text>
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

        <Text style={estilos.datoLinea}>
          <Text style={estilos.datoEtiqueta}>Asunto: </Text>
          {asunto}
        </Text>
        <Text style={estilos.datoLinea}>
          <Text style={estilos.datoEtiqueta}>Expediente: </Text>
          {expediente}
        </Text>

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
            {`Sesión ${code} — Generado el ${fechaHoraLegal(new Date())}`}
          </Text>
          {firmasConImagen.map(({ firma }) => (
            <Text key={firma.id} style={estilos.pieHash}>
              {`${firma.displayName}: SHA-256 ${firma.imageSha256}`}
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

  const buffer = await renderToBuffer(
    <PlanillaDocumento
      logoDataUri={logoDataUri}
      asunto={sesion.asunto}
      expediente={sesion.expediente}
      fechaAudiencia={sesion.fechaAudiencia}
      code={sesion.code}
      firmasConImagen={firmasConImagen}
    />,
  );

  return { buffer: Buffer.from(buffer), code: sesion.code };
}
