import { PDFDocument, StandardFonts } from 'pdf-lib';
import { guardarDocumentoSesion, leerDocumentoSesion } from './src/lib/storage.ts';

async function main() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  page.drawText('CONTENIDO ORIGINAL DEL PDF', { x: 50, y: 700, size: 20, font });
  const original = await pdfDoc.save();
  const sessionId = 'test-' + Date.now();
  const stored = await guardarDocumentoSesion(sessionId, Buffer.from(original));
  console.log('Stored path:', stored.relativePath);
  const readBack = await leerDocumentoSesion(stored.relativePath);
  console.log('Original bytes:', original.length, 'Read bytes:', readBack.length);
  console.log('Match:', Buffer.from(original).equals(readBack));
}
main().catch(console.error);
