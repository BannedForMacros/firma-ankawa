import { createHash, randomBytes } from "node:crypto";

/** SHA-256 en hexadecimal de un buffer (evidencia de integridad de firmas). */
export function sha256Hex(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Token aleatorio impredecible para la URL del QR (nunca IDs secuenciales). */
export function generateSessionToken(): string {
  return randomBytes(24).toString("hex");
}

/**
 * Código corto legible para ingreso manual. Alfabeto sin caracteres
 * ambiguos (sin 0/O, 1/I/L) para dictarlo en sala sin errores.
 */
export function generateShortCode(length = 6): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += alphabet[(bytes[i] as number) % alphabet.length];
  }
  return code;
}
