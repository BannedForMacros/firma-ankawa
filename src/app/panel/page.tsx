import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  PenLine,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireUser } from "@/auth";
import {
  listarActividadReciente,
  listarSesiones,
} from "@/server/session-service";
import { AlaPoligonal } from "@/components/brand/ala-poligonal";
import { LogoFondo } from "@/components/brand/logo-fondo";
import { FirmaAnimada } from "@/components/landing/firmas-fondo";
import { Revelar } from "@/components/landing/revelar";
import { ContadorAnimado } from "@/components/panel/contador-animado";
import { NuevaSesionDialog } from "@/components/panel/nueva-sesion-dialog";
import { SesionCard } from "@/components/panel/sesion-card";
import { SesionesCerradasTabla } from "@/components/panel/sesiones-cerradas-tabla";
import type { SesionResumenDto } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function saludoSegunHora(): string {
  const hora = Number(
    new Intl.DateTimeFormat("es-PE", {
      timeZone: "America/Lima",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function fechaLarga(): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function EstadisticaTile({
  icono: Icono,
  valor,
  etiqueta,
  retrasoMs,
  enVivo = false,
}: {
  icono: LucideIcon;
  valor: number;
  etiqueta: string;
  retrasoMs: number;
  enVivo?: boolean;
}) {
  return (
    <Revelar retrasoMs={retrasoMs} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-[var(--radius-brand)] bg-white p-5 shadow-card ring-1 ring-humo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-6">
        <AlaPoligonal className="absolute inset-x-0 top-0 h-1" />
        <div className="flex items-center justify-between">
          <span className="relative inline-flex h-11 w-11 items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 44 44"
              className="anim-girar-lento absolute inset-0 h-full w-full text-guinda-200"
            >
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            </svg>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-guinda-50">
              <Icono className="h-4 w-4 text-guinda-600" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </span>
          {enVivo ? (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="anim-pulso-anillo absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              En curso
            </span>
          ) : null}
        </div>
        <p className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold leading-none tracking-tight text-guinda-600 tabular-nums">
          <ContadorAnimado valor={valor} />
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ciruela-400">
          {etiqueta}
        </p>
      </div>
    </Revelar>
  );
}

function GrupoSesiones({
  titulo,
  sesiones,
  compactas = false,
}: {
  titulo: string;
  sesiones: SesionResumenDto[];
  compactas?: boolean;
}) {
  return (
    <section aria-label={titulo} className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={cn("barra-guinda !h-1 !w-8", compactas && "opacity-40")} aria-hidden="true" />
        <h3
          className={cn(
            "flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
            compactas ? "text-ciruela-300" : "text-ciruela-400",
          )}
        >
          {titulo}
          <span className="font-normal tabular-nums text-ciruela-300">
            ({sesiones.length})
          </span>
        </h3>
      </div>
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          compactas ? "gap-3" : "gap-4",
        )}
      >
        {sesiones.map((sesion, indice) => (
          <Revelar key={sesion.id} retrasoMs={90 * indice} className="h-full">
            <SesionCard sesion={sesion} compacta={compactas} className="h-full" />
          </Revelar>
        ))}
      </div>
    </section>
  );
}

function horaLima(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default async function PanelPage() {
  const usuario = await requireUser();
  const [sesiones, actividad] = await Promise.all([
    listarSesiones(),
    listarActividadReciente(6),
  ]);

  const abiertas = sesiones.filter((s) => s.status === "OPEN");
  const cerradas = sesiones.filter((s) => s.status === "CLOSED");
  const totalFirmas = sesiones.reduce((suma, s) => suma + s.totalFirmas, 0);
  const primerNombre = usuario.name.split(" ")[0] ?? usuario.name;

  return (
    <div className="relative">
      {/* El cóndor institucional: completo, derecho y centrado, presidiendo
          el panel como en un salón de audiencias. */}
      <LogoFondo posicion="left-1/2 top-24 w-[54rem] max-w-[92%] -translate-x-1/2" opacidad={0.06} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <FirmaAnimada
          className="absolute bottom-4 left-[4%] w-[30rem]"
          stroke="#f5cdd1"
          retrasoMs={800}
          duracionS={17}
          opacidad={0.5}
        />
      </div>

      <div className="relative space-y-8">
        {/* Cabecera del panel: saludo + título + acción principal */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="anim-subir text-sm text-ciruela-400" style={{ "--retraso": "60ms" } as React.CSSProperties}>
              {saludoSegunHora()}, <span className="font-semibold text-ciruela-600">{primerNombre}</span> — {fechaLarga()}
            </p>
            <div className="anim-subir mt-3" style={{ "--retraso": "160ms" } as React.CSSProperties}>
              <span className="barra-guinda" aria-hidden="true" />
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ciruela-700 sm:text-5xl">
                Panel de audiencias
              </h2>
            </div>
          </div>
          <div className="anim-subir" style={{ "--retraso": "260ms" } as React.CSSProperties}>
            <NuevaSesionDialog />
          </div>
        </div>

        {/* Estadísticas con contadores animados */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <EstadisticaTile
            icono={Radio}
            valor={abiertas.length}
            etiqueta={abiertas.length === 1 ? "Sesión abierta" : "Sesiones abiertas"}
            retrasoMs={100}
            enVivo={abiertas.length > 0}
          />
          <EstadisticaTile
            icono={PenLine}
            valor={totalFirmas}
            etiqueta={totalFirmas === 1 ? "Firma registrada" : "Firmas registradas"}
            retrasoMs={220}
          />
          <EstadisticaTile
            icono={CheckCircle2}
            valor={cerradas.length}
            etiqueta={cerradas.length === 1 ? "Sesión cerrada" : "Sesiones cerradas"}
            retrasoMs={340}
          />
        </div>

        {sesiones.length === 0 ? (
          <Revelar retrasoMs={200}>
            <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[var(--radius-brand)] bg-white px-6 py-16 text-center shadow-card">
              <FirmaAnimada
                className="pointer-events-none absolute left-1/2 top-1/2 w-[30rem] -translate-x-1/2 -translate-y-1/2 -rotate-3"
                stroke="#fbeaec"
                strokeWidth={4}
                retrasoMs={400}
                duracionS={14}
                opacidad={0.9}
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-guinda-50">
                <FileSignature className="h-7 w-7 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="relative space-y-1.5">
                <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-ciruela-700">
                  Aún no se ha registrado ninguna sesión de firma
                </p>
                <p className="mx-auto max-w-[52ch] text-sm leading-relaxed text-ciruela-400">
                  Cree la primera sesión para generar el código y el enlace con los
                  que los participantes de la audiencia firmarán el acta.
                </p>
              </div>
              <div className="relative">
                <NuevaSesionDialog />
              </div>
            </div>
          </Revelar>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Columna principal: las sesiones en curso */}
            <div className="space-y-10">
              {abiertas.length > 0 ? (
                <GrupoSesiones titulo="Sesiones abiertas" sesiones={abiertas} />
              ) : (
                <p className="rounded-[var(--radius-brand)] bg-white px-5 py-6 text-sm leading-relaxed text-ciruela-400 shadow-card ring-1 ring-humo-200">
                  No hay sesiones de firma abiertas en este momento. Cree una nueva
                  sesión cuando inicie la próxima audiencia.
                </p>
              )}
            </div>

            {/* Columna lateral: actividad y procedimiento */}
            <aside className="space-y-6">
              <Revelar retrasoMs={200}>
                <section
                  aria-label="Actividad reciente"
                  className="relative overflow-hidden rounded-[var(--radius-brand)] bg-white p-5 shadow-card ring-1 ring-humo-200 sm:p-6"
                >
                  <AlaPoligonal className="absolute inset-x-0 top-0 h-1" />
                  <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ciruela-400">
                    <PenLine className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
                    Actividad reciente
                  </h3>
                  {actividad.length === 0 ? (
                    <p className="mt-4 text-sm leading-relaxed text-ciruela-400">
                      Las firmas registradas en las audiencias aparecerán aquí en
                      cuanto los participantes comiencen a firmar.
                    </p>
                  ) : (
                    <ol className="mt-4 space-y-1">
                      {actividad.map((firma) => (
                        <li key={firma.id}>
                          <Link
                            href={`/panel/sesion/${firma.sessionId}`}
                            className="group flex items-start gap-3 rounded-[calc(var(--radius-brand)-0.25rem)] px-2 py-2.5 outline-none transition-colors duration-150 hover:bg-humo-50 focus-visible:ring-2 focus-visible:ring-guinda-500"
                          >
                            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-guinda-400 transition-transform duration-200 group-hover:scale-125" />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5 text-sm font-semibold text-berenjena">
                                <span className="truncate">{firma.displayName}</span>
                                {firma.verified ? (
                                  <BadgeCheck
                                    className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                                    strokeWidth={1.5}
                                    aria-label="Identidad verificada"
                                  />
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-ciruela-400">
                                Sesión {firma.sessionCode} · {firma.asunto}
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-ciruela-300">
                              {horaLima(firma.signedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </Revelar>

            </aside>

            {/* Archivo de sesiones cerradas: tabla institucional a ancho completo */}
            {cerradas.length > 0 ? (
              <div className="lg:col-span-2">
                <Revelar retrasoMs={150}>
                  <section aria-label="Sesiones cerradas" className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="barra-guinda !h-1 !w-8" aria-hidden="true" />
                      <h3 className="flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ciruela-400">
                        Sesiones cerradas
                        <span className="font-normal tabular-nums text-ciruela-300">
                          ({cerradas.length})
                        </span>
                      </h3>
                    </div>
                    <SesionesCerradasTabla sesiones={cerradas} />
                  </section>
                </Revelar>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
