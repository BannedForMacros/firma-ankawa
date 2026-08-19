import path from "node:path";
import { pathToFileURL } from "node:url";

interface EspacioPagina {
  pageWidth: number;
  pageHeight: number;
  contentBottomY: number; // límite inferior ocupado por el contenido (coord. PDF, desde abajo)
  availableSpace: number; // espacio libre vertical entre contentBottomY y el margen inferior
  hasText: boolean;
  hasGraphics: boolean;
}

/**
 * Analiza la última página de un PDF y estima cuánto espacio vertical hay
 * disponible debajo del contenido existente.
 *
 * El sistema de coordenadas de PDF tiene el origen (0,0) en la esquina inferior
 * izquierda, por lo que valores menores de Y están más cerca del borde inferior.
 *
 * Reglas conservadoras:
 * - Si la última página tiene imágenes, vectores u otros gráficos sin texto
 *   (p. ej. un PDF escaneado o un recibo con fondo gráfico), asumimos que la
 *   página está ocupada hasta el margen inferior. Esto evita que el bloque de
 *   firmas tape contenido que no podemos medir.
 * - Si solo hay texto, medimos hasta dónde llega el texto.
 * - Si la página está realmente vacía, asumimos todo el alto disponible.
 */
export async function calcularEspacioUltimaPagina(
  pdfBuffer: Buffer,
  margenInferior: number,
): Promise<EspacioPagina | null> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // pdf.js requiere un worker. En Node/Next.js configuramos la ruta al worker
  // del paquete para evitar el error "fake worker failed".
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
  }).promise;

  if (pdf.numPages === 0) return null;

  const page = await pdf.getPage(pdf.numPages);
  const view = page.view;
  const pageWidth = view[2] - view[0];
  const pageHeight = view[3] - view[1];

  const [textContent, operatorList] = await Promise.all([
    page.getTextContent(),
    page.getOperatorList(),
  ]);

  let minBaseline = pageHeight;
  let minDescent = 12; // estimación conservadora de descendentes tipográficos
  let hasText = false;

  for (const item of textContent.items) {
    if (!("str" in item && item.str.length > 0)) continue;
    hasText = true;
    const transform = item.transform as number[];
    if (transform.length < 6) continue;
    const y = transform[5];
    const fontHeight = Math.abs(transform[3]) || 12;
    minBaseline = Math.min(minBaseline, y);
    minDescent = Math.max(minDescent, fontHeight);
  }

  const graphicOps = new Set<number>([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintFormXObjectBegin,
    pdfjs.OPS.constructPath,
    pdfjs.OPS.rectangle,
  ]);

  const hasGraphics = operatorList.fnArray.some((fn) => graphicOps.has(fn));

  let contentBottomY: number;

  if (hasText) {
    // El contenido textual determina el límite inferior real.
    contentBottomY = Math.max(0, minBaseline - minDescent);
  } else if (hasGraphics) {
    // Hay gráficos que no podemos ubicar con precisión; no arriesgamos a taparlos.
    contentBottomY = margenInferior;
  } else {
    // Página vacía (improbable).
    contentBottomY = pageHeight;
  }

  const availableSpace = Math.max(0, contentBottomY - margenInferior);

  return {
    pageWidth,
    pageHeight,
    contentBottomY,
    availableSpace,
    hasText,
    hasGraphics,
  };
}
