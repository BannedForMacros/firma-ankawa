import {
  PDFDocument,
  PDFPage,
  PDFImage,
  PDFFont,
  StandardFonts,
  rgb,
} from "pdf-lib";
import type { Signer } from "@prisma/client";
import { leerImagenFirma } from "@/lib/storage";
import { leyendaConformidad } from "@/lib/dates";

const NEGRO = rgb(0, 0, 0);
const GRIS = rgb(0.35, 0.35, 0.35);

interface FirmaConImagen {
  firma: Signer;
  imagen: PDFImage;
}

function ajustarTamanoTexto(
  texto: string,
  font: PDFFont,
  tamanio: number,
  anchoMax: number,
): number {
  if (!texto) return tamanio;
  let size = tamanio;
  while (font.widthOfTextAtSize(texto, size) > anchoMax && size > 5) {
    size -= 0.5;
  }
  return size;
}

function dibujarTextoCentrado(
  page: PDFPage,
  texto: string,
  x: number,
  y: number,
  anchoMax: number,
  tamanio: number,
  font: PDFFont,
  color = NEGRO,
): number {
  if (!texto) return y;
  const size = ajustarTamanoTexto(texto, font, tamanio, anchoMax);
  const w = font.widthOfTextAtSize(texto, size);
  page.drawText(texto, {
    x: x + (anchoMax - w) / 2,
    y,
    size,
    font,
    color,
  });
  return size;
}

export async function calcularAlturaBloque(
  numFirmas: number,
): Promise<number> {
  const filas = Math.ceil(numFirmas / 2);
  const filasHeight = filas * 110 + Math.max(0, filas - 1) * 8;
  return filasHeight + 30; // cajas + espacio para leyenda inferior
}

export async function dibujarBloqueFirmas(
  pdfDoc: PDFDocument,
  page: PDFPage,
  startX: number,
  startY: number,
  blockWidth: number,
  blockHeight: number,
  firmas: Signer[],
): Promise<void> {
  const firmasConImagen: FirmaConImagen[] = await Promise.all(
    firmas.map(async (firma) => ({
      firma,
      imagen: await pdfDoc.embedPng(await leerImagenFirma(firma.imagePath)),
    })),
  );

  const helvetica = pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const helveticaBold = pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

  const gap = 8;
  const pad = 10;
  const boxHeight = 110;
  const colWidth = (blockWidth - gap) / 2;

  let cursorY = startY + blockHeight - 8;

  // Leyenda superior
  const leyenda = leyendaConformidad(new Date());
  const leyendaSize = ajustarTamanoTexto(leyenda, helvetica, 9, blockWidth);
  page.drawText(leyenda, {
    x: startX,
    y: cursorY,
    size: leyendaSize,
    font: helvetica,
  });
  cursorY -= 18;

  // Cajas de firma
  const filas: FirmaConImagen[][] = [];
  for (let i = 0; i < firmasConImagen.length; i += 2) {
    filas.push(firmasConImagen.slice(i, i + 2));
  }

  for (const fila of filas) {
    for (let i = 0; i < 2; i++) {
      const item = fila[i];
      const cellX = startX + i * (colWidth + gap);
      const cellY = cursorY - boxHeight;

      page.drawRectangle({
        x: cellX,
        y: cellY,
        width: colWidth,
        height: boxHeight,
        borderColor: NEGRO,
        borderWidth: 1,
      });

      if (item) {
        const maxImgW = colWidth - pad * 2;
        const maxImgH = boxHeight * 0.45;
        const scale = item.imagen.scaleToFit(maxImgW, maxImgH);
        const imgW = scale.width;
        const imgH = scale.height;
        page.drawImage(item.imagen, {
          x: cellX + (colWidth - imgW) / 2,
          y: cellY + boxHeight - pad - imgH,
          width: imgW,
          height: imgH,
        });

        // Línea de firma
        page.drawLine({
          start: { x: cellX + pad, y: cellY + boxHeight / 2 + 4 },
          end: { x: cellX + colWidth - pad, y: cellY + boxHeight / 2 + 4 },
          thickness: 1,
          color: NEGRO,
        });

        // Datos del firmante
        let textY = cellY + boxHeight / 2 - 4;
        const textMaxW = colWidth - pad * 2;

        if (item.firma.entidad) {
          dibujarTextoCentrado(
            page,
            item.firma.entidad.toUpperCase(),
            cellX + pad,
            textY,
            textMaxW,
            7,
            helveticaBold,
          );
          textY -= 9;
        }

        dibujarTextoCentrado(
          page,
          item.firma.displayName.toUpperCase(),
          cellX + pad,
          textY,
          textMaxW,
          7,
          helveticaBold,
        );
        textY -= 9;

        if (item.firma.cargo) {
          dibujarTextoCentrado(
            page,
            item.firma.cargo.toUpperCase(),
            cellX + pad,
            textY,
            textMaxW,
            6,
            helvetica,
          );
          textY -= 8;
        }

        dibujarTextoCentrado(
          page,
          `DNI: ${item.firma.docNumber}`,
          cellX + pad,
          textY,
          textMaxW,
          6,
          helvetica,
          GRIS,
        );
      }
    }

    cursorY -= boxHeight + gap;
  }
}
