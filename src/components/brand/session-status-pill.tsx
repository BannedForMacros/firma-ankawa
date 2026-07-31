import type { EstadoSesion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SessionStatusPillProps {
  status: EstadoSesion;
  className?: string;
}

/** Indicador del estado de la sesión de firmas: ABIERTA o CERRADA. */
export function SessionStatusPill({ status, className }: SessionStatusPillProps) {
  const abierta = status === "OPEN";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-brand)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
        abierta
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-humo-200 text-berenjena ring-1 ring-inset ring-humo-300",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          abierta ? "bg-emerald-500" : "bg-ciruela-300"
        )}
      />
      {abierta ? "Abierta" : "Cerrada"}
    </span>
  );
}
