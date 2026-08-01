import Link from "next/link";
import { FileDown } from "lucide-react";
import { fechaCorta } from "@/lib/dates";
import type { SesionResumenDto } from "@/lib/types";

function fechaHoraCierre(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

const CELDA = "px-4 py-3 text-sm";
const CABECERA =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-ciruela-400";

/**
 * Archivo de sesiones cerradas como tabla institucional: las cerradas se
 * consultan (buscar expediente, descargar planilla), no se operan — el
 * formato tabular escala a cientos de audiencias.
 */
export function SesionesCerradasTabla({
  sesiones,
}: {
  sesiones: SesionResumenDto[];
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-brand)] bg-white shadow-card ring-1 ring-humo-200">
      <table className="w-full min-w-[46rem] border-collapse">
        <caption className="sr-only">
          Sesiones de firma cerradas, ordenadas de la más reciente a la más antigua
        </caption>
        <thead>
          <tr className="border-b border-humo-200 bg-humo-100">
            <th scope="col" className={CABECERA}>
              Expediente
            </th>
            <th scope="col" className={CABECERA}>
              Asunto
            </th>
            <th scope="col" className={CABECERA}>
              Audiencia
            </th>
            <th scope="col" className={`${CABECERA} text-right`}>
              Firmas
            </th>
            <th scope="col" className={CABECERA}>
              Cerrada el
            </th>
            <th scope="col" className={`${CABECERA} text-right`}>
              Planilla
            </th>
          </tr>
        </thead>
        <tbody>
          {sesiones.map((sesion) => (
            <tr
              key={sesion.id}
              className="border-b border-humo-200 transition-colors duration-150 last:border-b-0 hover:bg-humo-50"
            >
              <td className={`${CELDA} whitespace-nowrap font-medium text-ciruela-700 tabular-nums`}>
                <Link
                  href={`/panel/sesion/${sesion.id}`}
                  className="rounded-[calc(var(--radius-brand)-0.25rem)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-guinda-500"
                >
                  {sesion.expediente}
                </Link>
              </td>
              <td className={`${CELDA} max-w-[24rem] text-berenjena`}>
                <Link
                  href={`/panel/sesion/${sesion.id}`}
                  className="line-clamp-1 rounded-[calc(var(--radius-brand)-0.25rem)] outline-none hover:text-ciruela-700 focus-visible:ring-2 focus-visible:ring-guinda-500"
                >
                  {sesion.asunto}
                </Link>
              </td>
              <td className={`${CELDA} whitespace-nowrap text-ciruela-500 tabular-nums`}>
                {fechaCorta(new Date(sesion.fechaAudiencia))}
              </td>
              <td className={`${CELDA} text-right font-medium text-ciruela-700 tabular-nums`}>
                {sesion.totalFirmas}
              </td>
              <td className={`${CELDA} whitespace-nowrap text-ciruela-500 tabular-nums`}>
                {fechaHoraCierre(sesion.closedAt)}
              </td>
              <td className={`${CELDA} text-right`}>
                <a
                  href={`/api/planilla/${sesion.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[calc(var(--radius-brand)-0.25rem)] border border-humo-300 bg-white px-3 py-1.5 text-xs font-semibold text-ciruela-700 outline-none transition-colors duration-150 hover:border-guinda-300 hover:text-guinda-700 focus-visible:ring-2 focus-visible:ring-guinda-500"
                  aria-label={`Descargar planilla PDF de la sesión ${sesion.code}`}
                >
                  <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
