interface EspacioPagina {
  pageWidth: number;
  pageHeight: number;
  contentBottomY: number; // límite inferior ocupado por el contenido (coord. PDF, desde abajo)
  availableSpace: number; // espacio libre vertical entre contentBottomY y el margen inferior
}

/**
 * Analiza la última página de un PDF y estima cuánto espacio vertical hay
 * disponible debajo del contenido existente.
 *
 * El sistema de coordenadas de PDF tiene el origen (0,0) en la esquina inferior
 * izquierda, por lo que valores menores de Y están más cerca del borde inferior.
 */
export async function calcularEspacioUltimaPagina(
  pdfBuffer: Buffer,
  margenInferior: number,
): Promise<EspacioPagina | null> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
  }).promise;

  if (pdf.numPages === 0) return null;

  const page = await pdf.getPage(pdf.numPages);
  const view = page.view;
  const pageWidth = view[2] - view[0];
  const pageHeight = view[3] - view[1];

  const textContent = await page.getTextContent();

  let minBaseline = pageHeight;
  let minDescent = 12; // estimación conservadora de descendentes tipográficos

  for (const item of textContent.items) {
    if (!("str" in item && item.str.length > 0)) continue;
    const transform = item.transform as number[];
    if (transform.length < 6) continue;
    const y = transform[5];
    const fontHeight = Math.abs(transform[3]) || 12;
    minBaseline = Math.min(minBaseline, y);
    minDescent = Math.max(minDescent, fontHeight);
  }

  const contentBottomY = Math.max(0, minBaseline - minDescent);
  const availableSpace = Math.max(0, contentBottomY - margenInferior);

  return { pageWidth, pageHeight, contentBottomY, availableSpace };
}
