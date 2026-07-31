/**
 * IP del cliente y user-agent, para rate limiting y evidencia jurídica.
 *
 * Las cabeceras `X-Forwarded-For` y `X-Real-IP` las escribe el proxy, pero el
 * cliente puede enviarlas de antemano con cualquier valor: confiar en el
 * primer elemento permite rotar la IP en cada request (anulando el rate
 * limiting) y falsificar la IP persistida en Signer.ip / AuditLog.ip.
 *
 * Por eso solo se leen si `TRUSTED_PROXIES` (variable de entorno) declara
 * cuántos reverse proxies propios anteceden a la aplicación:
 *  - `TRUSTED_PROXIES=1` (un único proxy propio, p. ej. nginx): se toma el
 *    valor que ese proxy anexó, es decir, el 1.º contando desde la derecha.
 *  - `TRUSTED_PROXIES=N`: el N-ésimo desde la derecha.
 *  - Sin configurar o `0` (sin proxy): las cabeceras se ignoran por completo
 *    y la IP queda como "desconocida" (Next.js no expone la IP del socket
 *    en route handlers).
 */

function proxiesConfiables(): number {
  const n = Number.parseInt(process.env.TRUSTED_PROXIES ?? "", 10);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export function clientInfo(req: { headers: Headers }): {
  ip: string;
  userAgent: string;
} {
  const userAgent = req.headers.get("user-agent") ?? "desconocido";
  const confiables = proxiesConfiables();
  if (confiables === 0) {
    return { ip: "desconocida", userAgent };
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const saltos = forwarded
      .split(",")
      .map((salto) => salto.trim())
      .filter((salto) => salto.length > 0);
    const ip = saltos[saltos.length - confiables];
    if (ip) return { ip, userAgent };
  }

  // X-Real-IP solo es fiable si la escribe un único proxy propio.
  if (confiables === 1) {
    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return { ip: realIp, userAgent };
  }

  return { ip: "desconocida", userAgent };
}
