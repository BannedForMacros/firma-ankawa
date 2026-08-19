import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, FileText } from "lucide-react";
import { obtenerSesionPublicaPorToken } from "@/server/session-service";
import { fechaCorta } from "@/lib/dates";
import type { SesionPublicaDto } from "@/lib/types";
import { AnkawaLogo } from "@/components/brand/logo";
import { LogoFondo } from "@/components/brand/logo-fondo";
import { AlaPoligonal } from "@/components/brand/ala-poligonal";
import { FlujoFirma } from "@/components/firmar/flujo-firma";
import { SesionCerrada } from "@/components/firmar/sesion-cerrada";
import { RevisarDocumentos } from "@/components/firmar/revisar-documentos";

export const metadata: Metadata = {
  title: "Firma del documento",
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
    documentoPdf: encontrada.documentoPdf,
  };

  const documentoUrl = sesion.documentoPdf
    ? `/api/documentos/${sesion.documentoPdf}`
    : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-humo-100">
      {/* Header minimalista */}
      <header className="bg-white">
        <div className="border-b border-humo-200">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
            <AnkawaLogo className="h-9 w-auto sm:h-10" />
            <div className="flex flex-col leading-tight">
              <span className="titulo-institucional text-[0.55rem] tracking-[0.14em] text-ciruela-400">
                Centro de Arbitraje y Resolución de Disputas
              </span>
              <span className="titulo-institucional text-xs tracking-[0.18em] text-ciruela-700">
                CARD – ANKAWA INTL
              </span>
            </div>
          </div>
        </div>
        <AlaPoligonal className="h-0.5" />
      </header>

      <main className="relative mx-auto w-full max-w-2xl flex-1 px-4 py-4 sm:py-6">
        <LogoFondo posicion="left-1/2 top-20 w-[40rem] max-w-[95%] -translate-x-1/2" opacidad={0.04} />

        {/* Datos de la audiencia: compactos y sin tarjeta pesada */}
        <section
          aria-label="Datos de la sesión"
          className="rounded-[var(--radius-brand)] border border-humo-200 bg-white p-4"
        >
          <p className="titulo-institucional text-[0.55rem] text-guinda-600">
            Documento a firmar — Sesión {sesion.code}
          </p>
          <h1 className="mt-1 text-balance font-[family-name:var(--font-display)] text-lg font-bold leading-snug tracking-tight text-ciruela-700">
            {sesion.asunto}
          </h1>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-ciruela-700">
            <li className="flex items-center gap-1.5 rounded-full bg-humo-100 px-2.5 py-1">
              <FileText className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Expediente:</span>
              {sesion.expediente}
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-humo-100 px-2.5 py-1">
              <CalendarDays className="h-3.5 w-3.5 text-guinda-500" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Fecha:</span>
              {fechaCorta(new Date(sesion.fechaAudiencia))}
            </li>
            {documentoUrl ? (
              <li className="flex items-center gap-1.5 rounded-full bg-guinda-50 px-2.5 py-1">
                <RevisarDocumentos url={documentoUrl} />
              </li>
            ) : null}
          </ul>
        </section>

        <div className="mt-4 sm:mt-5">
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
