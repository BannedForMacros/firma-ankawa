import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { sha256Hex } from "@/lib/crypto";

/**
 * Almacenamiento local de imágenes de firma: /storage/firmas/{sessionId}/.
 * Fuera de /public a propósito: las firmas son evidencia y se sirven solo
 * a través de una ruta autenticada (/api/firmas/...).
 *
 * Migración a S3: reemplazar estas funciones por PutObject/GetObject
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

/** Resuelve y valida una ruta relativa dentro del almacén de documentos. */
function resolverRutaDocumento(relativePath: string): string {
  const resolved = path.resolve(DOCUMENTS_ROOT, relativePath);
  if (!resolved.startsWith(DOCUMENTS_ROOT + path.sep)) {
    throw new Error("Ruta de documento inválida.");
  }
  return resolved;
}

/** Lee un PDF adjunto a la sesión. */
export async function leerDocumentoSesion(relativePath: string): Promise<Buffer> {
  return readFile(resolverRutaDocumento(relativePath));
}

/** Elimina un PDF del almacén local. No lanza si el archivo no existe. */
export async function eliminarDocumentoSesion(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  try {
    await unlink(resolverRutaDocumento(relativePath));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") throw error;
  }
}

/**
 * Persiste el PDF original de un documento de sesión.
 * Estructura: /storage/documentos/{sessionId}/{docId}/original.pdf
 */
export async function guardarDocumentoOriginal(
  sessionId: string,
  docId: string,
  pdfBuffer: Buffer,
  originalName: string,
): Promise<StoredDocument & { originalName: string }> {
  const sha256 = sha256Hex(pdfBuffer);
  const dir = path.join(DOCUMENTS_ROOT, sessionId, docId);
  await mkdir(dir, { recursive: true });

  const relativePath = path.join(sessionId, docId, "original.pdf");
  await writeFile(path.join(DOCUMENTS_ROOT, relativePath), pdfBuffer);

  return {
    relativePath,
    sha256,
    bytes: pdfBuffer.byteLength,
    originalName,
  };
}

/**
 * Persiste el PDF firmado de un documento de sesión.
 * Estructura: /storage/documentos/{sessionId}/{docId}/firmado.pdf
 */
export async function guardarDocumentoFirmado(
  sessionId: string,
  docId: string,
  pdfBuffer: Buffer,
): Promise<StoredDocument> {
  const sha256 = sha256Hex(pdfBuffer);
  const dir = path.join(DOCUMENTS_ROOT, sessionId, docId);
  await mkdir(dir, { recursive: true });

  const relativePath = path.join(sessionId, docId, "firmado.pdf");
  await writeFile(path.join(DOCUMENTS_ROOT, relativePath), pdfBuffer);

  return {
    relativePath,
    sha256,
    bytes: pdfBuffer.byteLength,
  };
}
