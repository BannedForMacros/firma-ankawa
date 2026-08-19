import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256Hex } from "@/lib/crypto";

/**
 * Almacenamiento local de imágenes de firma: /storage/firmas/{sessionId}/.
 * Fuera de /public a propósito: las firmas son evidencia y se sirven solo
 * a través de una ruta autenticada (/api/firmas/...).
 *
 * Migración a S3: reemplazar estas dos funciones por PutObject/GetObject
 * conservando la misma clave relativa `{sessionId}/{fileName}`.
 */

const SIGNATURES_ROOT = path.join(process.cwd(), "storage", "firmas");
const DOCUMENTS_ROOT = path.join(process.cwd(), "storage", "documentos");

export interface StoredSignature {
  relativePath: string;
  sha256: string;
  bytes: number;
}

export interface StoredDocument {
  relativePath: string;
  sha256: string;
  bytes: number;
}

/** Decodifica un data URL PNG y lo persiste; devuelve ruta relativa y hash. */
export async function guardarImagenFirma(
  sessionId: string,
  signerId: string,
  pngDataUrl: string,
): Promise<StoredSignature> {
  const base64 = pngDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const sha256 = sha256Hex(buffer);

  const dir = path.join(SIGNATURES_ROOT, sessionId);
  await mkdir(dir, { recursive: true });

  const fileName = `${signerId}.png`;
  await writeFile(path.join(dir, fileName), buffer);

  return {
    relativePath: `${sessionId}/${fileName}`,
    sha256,
    bytes: buffer.byteLength,
  };
}

/** Lee una imagen de firma. Lanza si la ruta intenta escapar del almacén. */
export async function leerImagenFirma(relativePath: string): Promise<Buffer> {
  const resolved = path.resolve(SIGNATURES_ROOT, relativePath);
  if (!resolved.startsWith(SIGNATURES_ROOT + path.sep)) {
    throw new Error("Ruta de firma inválida.");
  }
  return readFile(resolved);
}

/** Persiste un PDF adjunto a la sesión. */
export async function guardarDocumentoSesion(
  sessionId: string,
  pdfBuffer: Buffer,
  fileName = "documento.pdf",
): Promise<StoredDocument> {
  const sha256 = sha256Hex(pdfBuffer);
  const dir = path.join(DOCUMENTS_ROOT, sessionId);
  await mkdir(dir, { recursive: true });

  await writeFile(path.join(dir, fileName), pdfBuffer);

  return {
    relativePath: `${sessionId}/${fileName}`,
    sha256,
    bytes: pdfBuffer.byteLength,
  };
}

/** Lee un PDF adjunto a la sesión. */
export async function leerDocumentoSesion(relativePath: string): Promise<Buffer> {
  const resolved = path.resolve(DOCUMENTS_ROOT, relativePath);
  if (!resolved.startsWith(DOCUMENTS_ROOT + path.sep)) {
    throw new Error("Ruta de documento inválida.");
  }
  return readFile(resolved);
}
