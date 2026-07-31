import type { NextRequest } from "next/server";

/** IP del cliente (respetando proxies locales) y user-agent, para evidencia. */
export function clientInfo(req: NextRequest): { ip: string; userAgent: string } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconocida";
  const userAgent = req.headers.get("user-agent") ?? "desconocido";
  return { ip, userAgent };
}
