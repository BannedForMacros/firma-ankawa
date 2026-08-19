"use client";

import { useMemo } from "react";

import type { FirmaResumenDto } from "@/lib/types";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { cn } from "@/lib/utils";

interface SignerCardProps {
  firma: FirmaResumenDto;
  /** Posición de llegada (base 1) dentro de la sesión. */
  orden: number;
  /** Resalta la tarjeta brevemente cuando la firma acaba de llegar. */
  resaltada?: boolean;
  className?: string;
}

const formatoHora = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Fila de la lista en vivo: miniatura de la firma y datos del firmante. */
export function SignerCard({ firma, orden, resaltada = false, className }: SignerCardProps) {
  const hora = useMemo(() => {
    const fecha = new Date(firma.signedAt);
    return Number.isNaN(fecha.getTime()) ? "—" : formatoHora.format(fecha);
  }, [firma.signedAt]);

  const shaTruncado = `${firma.imageSha256.slice(0, 16)}…`;

  return (
    <li
      title={`SHA-256: ${shaTruncado}`}
      className={cn(
        "flex items-center gap-4 rounded-[var(--radius-brand)] border bg-white p-3 transition-colors duration-500",
        resaltada
          ? "border-guinda-300 bg-guinda-50 shadow-card-hover"
          : "border-humo-200 shadow-card",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-ciruela-300"
      >
        {orden}
      </span>

      <span className="fondo-ajedrez flex h-12 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-brand)-0.25rem)] border border-humo-200">
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG autenticado servido por la API interna */}
        <img
          src={firma.imageUrl}
          alt={`Firma de ${firma.displayName}`}
          className="h-12 max-w-full object-contain"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-berenjena">{firma.displayName}</p>
        {firma.entidad ? (
          <p className="truncate text-xs text-ciruela-400">Entidad: {firma.entidad}</p>
        ) : null}
        <p className="truncate text-xs text-ciruela-400">
          {firma.docType} {firma.docNumberMasked} · {firma.cargo} · {firma.parte}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <VerifiedBadge verified={firma.verified} source="RENIEC" />
        <time dateTime={firma.signedAt} className="text-xs tabular-nums text-ciruela-400">
          {hora}
        </time>
      </div>
    </li>
  );
}
