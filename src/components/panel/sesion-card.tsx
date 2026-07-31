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
}

/** Tarjeta resumen de una sesión de firmas; toda la tarjeta enlaza al detalle. */
export function SesionCard({ sesion, className }: SesionCardProps) {
  const ModalidadIcon = sesion.modalidad === "VIRTUAL" ? Video : Users;

  return (
    <Link
      href={`/panel/sesion/${sesion.id}`}
      aria-label={`Ver sesión ${sesion.code}: ${sesion.asunto}`}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-[var(--radius-brand)] bg-white p-5 shadow-card transition-shadow duration-150 outline-none hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-guinda-500 focus-visible:ring-offset-2 focus-visible:ring-offset-humo-100",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs tracking-wide text-ciruela-400">
          {sesion.expediente}
        </span>
        <SessionStatusPill status={sesion.status} />
      </div>

      <p className="line-clamp-2 text-sm font-semibold leading-snug text-berenjena group-hover:text-ciruela-700">
        {sesion.asunto}
      </p>

      <dl className="mt-auto space-y-1.5 text-xs text-ciruela-400">
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

      <div className="flex items-center gap-2 border-t border-humo-200 pt-3 text-xs font-medium text-ciruela-700">
        <PenLine className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
        {sesion.totalFirmas === 1 ? "1 firma" : `${sesion.totalFirmas} firmas`}
      </div>
    </Link>
  );
}
