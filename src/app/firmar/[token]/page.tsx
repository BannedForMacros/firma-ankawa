import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, FileText, MapPin } from "lucide-react";
import { obtenerSesionPublicaPorToken } from "@/server/session-service";
import { fechaCorta } from "@/lib/dates";
import type { ModalidadAudiencia, SesionPublicaDto } from "@/lib/types";
import { AnkawaLogo } from "@/components/brand/logo";
import { LogoFondo } from "@/components/brand/logo-fondo";
import { AlaPoligonal } from "@/components/brand/ala-poligonal";
import { FlujoFirma } from "@/components/firmar/flujo-firma";
import { SesionCerrada } from "@/components/firmar/sesion-cerrada";

export const metadata: Metadata = {
  title: "Firma del acta de audiencia",
};

const MODALIDAD_LEGIBLE: Record<ModalidadAudiencia, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
  MIXTA: "Mixta",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function FirmarPage({ params }: PageProps) {
  const { token } = await params;
  const encontrada = await obtenerSesionPublicaPorToken(token);
  if (!encontrada) notFound();

  const sesion: SesionPublicaDto = {
    code: encontrada.code,
    asunto: encontrada.asunto,
    expediente: encontrada.expediente,
    fechaAudiencia: encontrada.fechaAudiencia,
    sede: encontrada.sede,
    modalidad: encontrada.modalidad,
    status: encontrada.status,
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Cabecera compacta de marca: superficie blanca, logo a todo color,
          ala poligonal de 2px como firma visual del sistema */}
      <header className="bg-white">
        <div className="border-b border-humo-200">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
            <AnkawaLogo className="h-12 w-auto sm:h-14" />
            <div className="flex flex-col leading-tight">
              <span className="titulo-institucional text-[0.6rem] tracking-[0.18em] text-ciruela-400">
                Centro de Arbitraje y Resolución de Disputas
              </span>
              <span className="titulo-institucional text-sm tracking-[0.22em] text-ciruela-700">
                CARD – ANKAWA INTL
              </span>
            </div>
          </div>
        </div>
        <AlaPoligonal className="h-0.5" />
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        <LogoFondo posicion="left-1/2 top-24 w-[46rem] max-w-[94%] -translate-x-1/2" opacidad={0.045} />
        {/* Bloque de confirmación de audiencia */}
        <section
          aria-label="Datos de la audiencia"
          className="rounded-[var(--radius-brand)] bg-white p-5 shadow-card"
        >
          <p className="titulo-institucional text-[0.65rem] text-guinda-600">
            Acta de audiencia — Sesión {sesion.code}
          </p>
          <h1 className="mt-1.5 text-balance font-[family-name:var(--font-display)] text-xl font-bold leading-snug tracking-tight text-ciruela-700">
            {sesion.asunto}
          </h1>
          {/* Datos clave como fichas escaneables de un vistazo */}
          <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ciruela-700">
            <li className="flex items-center gap-1.5 rounded-full bg-humo-100 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Expediente:</span>
              {sesion.expediente}
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-humo-100 px-3 py-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Fecha de la audiencia:</span>
              {fechaCorta(new Date(sesion.fechaAudiencia))}
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-humo-100 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Sede y modalidad:</span>
              {sesion.sede} · {MODALIDAD_LEGIBLE[sesion.modalidad]}
            </li>
          </ul>
          {sesion.status === "OPEN" ? (
            <p className="mt-3 text-xs leading-relaxed text-ciruela-400">
              Verifique que estos datos corresponden a su audiencia antes de continuar.
            </p>
          ) : null}
        </section>

        <div className="mt-6">
          {sesion.status === "CLOSED" ? (
            <SesionCerrada sesion={sesion} />
          ) : (
            <FlujoFirma sesion={sesion} token={token} />
          )}
        </div>
      </main>
    </div>
  );
}
