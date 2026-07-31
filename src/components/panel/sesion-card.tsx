import Link from "next/link";
import { CalendarDays, MapPin, PenLine, Video, Users } from "lucide-react";
import { SessionStatusPill } from "@/components/brand/session-status-pill";
import { fechaCorta } from "@/lib/dates";
import type { ModalidadAudiencia, SesionResumenDto } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODALIDAD_LABEL: Record<ModalidadAudiencia, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
  MIXTA: "Mixta",
};

interface SesionCardProps {
  sesion: SesionResumenDto;
  className?: string;
  /** Presentación reducida y apagada (sesiones cerradas). */
  compacta?: boolean;
}

/** Tarjeta resumen de una sesión de firmas; toda la tarjeta enlaza al detalle. */
export function SesionCard({ sesion, className, compacta = false }: SesionCardProps) {
  const ModalidadIcon = sesion.modalidad === "VIRTUAL" ? Video : Users;

  return (
    <Link
      href={`/panel/sesion/${sesion.id}`}
      aria-label={`Ver sesión ${sesion.code}: ${sesion.asunto}`}
      className={cn(
        "group flex h-full flex-col rounded-[var(--radius-brand)] bg-white outline-none transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-guinda-500 focus-visible:ring-offset-2 focus-visible:ring-offset-humo-50",
        compacta
          ? "gap-2 border border-humo-200 p-4 hover:shadow-card"
          : "gap-3 p-5 shadow-card hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "text-xs font-medium tracking-wide tabular-nums",
            compacta ? "text-ciruela-300" : "text-ciruela-400"
          )}
        >
          {sesion.expediente}
        </span>
        <SessionStatusPill status={sesion.status} />
      </div>

      <p
        className={cn(
          "line-clamp-2 text-sm leading-snug group-hover:text-ciruela-700",
          compacta
            ? "font-medium text-ciruela-500"
            : "font-semibold text-berenjena"
        )}
      >
        {sesion.asunto}
      </p>

      <dl
        className={cn(
          "mt-auto text-xs",
          compacta ? "space-y-1 text-ciruela-300" : "space-y-1.5 text-ciruela-400"
        )}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <dt className="sr-only">Fecha de la audiencia</dt>
          <dd>{fechaCorta(new Date(sesion.fechaAudiencia))}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <dt className="sr-only">Sede</dt>
          <dd>{sesion.sede}</dd>
        </div>
        <div className="flex items-center gap-2">
          <ModalidadIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <dt className="sr-only">Modalidad</dt>
          <dd>{MODALIDAD_LABEL[sesion.modalidad]}</dd>
        </div>
      </dl>

      <div
        className={cn(
          "flex items-center gap-2 border-t border-humo-200 text-xs font-medium",
          compacta ? "pt-2.5 text-ciruela-400" : "pt-3 text-ciruela-700"
        )}
      >
        <PenLine
          className={cn(
            "h-3.5 w-3.5",
            compacta ? "text-ciruela-300" : "text-guinda-500"
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="tabular-nums">
          {sesion.totalFirmas === 1 ? "1 firma" : `${sesion.totalFirmas} firmas`}
        </span>
      </div>
    </Link>
  );
}
