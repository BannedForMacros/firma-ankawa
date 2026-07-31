import { FileSignature } from "lucide-react";
import { requireUser } from "@/auth";
import { listarSesiones } from "@/server/session-service";
import { SectionTitle } from "@/components/brand/section-title";
import { NuevaSesionDialog } from "@/components/panel/nueva-sesion-dialog";
import { SesionCard } from "@/components/panel/sesion-card";
import type { SesionResumenDto } from "@/lib/types";

export const dynamic = "force-dynamic";

function GrupoSesiones({
  titulo,
  sesiones,
}: {
  titulo: string;
  sesiones: SesionResumenDto[];
}) {
  return (
    <section aria-label={titulo} className="space-y-4">
      <h3 className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-ciruela-400">
        {titulo}
        <span className="font-mono text-xs font-normal text-ciruela-300">
          ({sesiones.length})
        </span>
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sesiones.map((sesion) => (
          <SesionCard key={sesion.id} sesion={sesion} />
        ))}
      </div>
    </section>
  );
}

export default async function PanelPage() {
  await requireUser();
  const sesiones = await listarSesiones();

  const abiertas = sesiones.filter((s) => s.status === "OPEN");
  const cerradas = sesiones.filter((s) => s.status === "CLOSED");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle eyebrow="Secretaría arbitral" title="Sesiones de firma" />
        {sesiones.length > 0 ? <NuevaSesionDialog /> : null}
      </div>

      {sesiones.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius-brand)] bg-white px-6 py-16 text-center shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-guinda-50">
            <FileSignature
              className="h-7 w-7 text-guinda-500"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold text-ciruela-700">
              Aún no se ha registrado ninguna sesión de firma
            </p>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ciruela-400">
              Cree la primera sesión para generar el código y el enlace con los
              que los participantes de la audiencia firmarán el acta.
            </p>
          </div>
          <NuevaSesionDialog />
        </div>
      ) : (
        <div className="space-y-10">
          {abiertas.length > 0 ? (
            <GrupoSesiones titulo="Sesiones abiertas" sesiones={abiertas} />
          ) : null}
          {cerradas.length > 0 ? (
            <GrupoSesiones titulo="Sesiones cerradas" sesiones={cerradas} />
          ) : null}
        </div>
      )}
    </div>
  );
}
