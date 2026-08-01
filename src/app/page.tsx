import Link from "next/link";
import {
  BadgeCheck,
  ChevronDown,
  FileCheck2,
  Fingerprint,
  PenLine,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { IngresoCodigo } from "@/app/ingreso-codigo";
import { AlaPoligonal } from "@/components/brand/ala-poligonal";
import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { FirmaAnimada, FirmasFondo } from "@/components/landing/firmas-fondo";
import { HeroLogo } from "@/components/landing/hero-logo";
import { Marquesina } from "@/components/landing/marquesina";
import { Revelar } from "@/components/landing/revelar";
import { Card } from "@/components/ui/card";

const pasos = [
  {
    numero: "1",
    icono: Fingerprint,
    titulo: "Identifíquese",
    descripcion:
      "Escanee el código QR de la sala e ingrese su DNI o RUC. El sistema verifica su identidad ante RENIEC o SUNAT al instante.",
  },
  {
    numero: "2",
    icono: PenLine,
    titulo: "Firme",
    descripcion:
      "Trace su firma en la pantalla de su celular con el dedo, o cargue una imagen de su firma manuscrita.",
  },
  {
    numero: "3",
    icono: FileCheck2,
    titulo: "Quede registrado",
    descripcion:
      "Su firma se incorpora al acta en tiempo real, con constancia de fecha, hora e integridad criptográfica.",
  },
] as const;

const garantias = [
  {
    icono: BadgeCheck,
    titulo: "Identidad verificada",
    descripcion:
      "Cada firmante se acredita con su DNI o RUC contra los registros oficiales de RENIEC y SUNAT.",
  },
  {
    icono: ShieldCheck,
    titulo: "Integridad demostrable",
    descripcion:
      "Cada firma se sella con su resumen criptográfico SHA-256, fecha y hora del servidor.",
  },
  {
    icono: ScrollText,
    titulo: "Trazabilidad completa",
    descripcion:
      "Todo evento queda en el registro de auditoría: consultas, firmas, cierre y planilla.",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-humo-50">
        {/* ── Héroe: el cóndor preside, el código a la vista sin scroll ──── */}
        <section
          aria-labelledby="hero-titulo"
          className="relative flex overflow-hidden lg:min-h-[88dvh] lg:items-center"
        >
          <FirmasFondo />

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:pb-16 lg:pt-8">
            {/* Columna del cóndor y el mensaje */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <HeroLogo className="lg:mx-0" />

              <p
                className="anim-subir titulo-institucional mt-6 text-[11px] text-guinda-600 sm:text-xs"
                style={{ "--retraso": "350ms" } as React.CSSProperties}
              >
                Centro de Arbitraje y Resolución de Disputas
              </p>

              <h1
                id="hero-titulo"
                className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-balance text-ciruela-700 sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                <span className="block overflow-hidden">
                  <span
                    className="anim-subir block"
                    style={{ "--retraso": "480ms" } as React.CSSProperties}
                  >
                    La firma del acta,
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="anim-subir block text-guinda-500"
                    style={{ "--retraso": "620ms" } as React.CSSProperties}
                  >
                    sin papel.
                  </span>
                </span>
              </h1>

              {/* El párrafo completo solo en escritorio: en móvil la tarjeta
                  de código debe quedar a la vista sin desplazamiento. */}
              <p
                className="anim-subir mt-5 hidden max-w-[58ch] text-base leading-relaxed text-ciruela-500 sm:text-lg lg:block"
                style={{ "--retraso": "780ms" } as React.CSSProperties}
              >
                Plataforma oficial de CARD – ANKAWA INTL para la suscripción de
                actas de audiencia arbitral: las partes firman de manera verificada
                y cada firma queda registrada con plena constancia de identidad,
                fecha y hora.
              </p>
            </div>

            {/* Tarjeta protagonista: código de firma, a la vista de inmediato */}
            <div
              className="anim-subir w-full lg:col-span-5"
              style={{ "--retraso": "700ms" } as React.CSSProperties}
            >
              <Card className="overflow-hidden text-left ring-1 ring-humo-200">
                <AlaPoligonal className="h-2" />
                <div className="p-5 sm:p-7">
                  <h2 className="text-center font-display text-xl font-bold tracking-tight text-ciruela-700 sm:text-2xl">
                    ¿Va a firmar un acta?
                  </h2>
                  <p className="mx-auto mt-2 max-w-[44ch] text-center text-sm leading-relaxed text-ciruela-400">
                    Ingrese el código indicado por el tribunal para suscribir el
                    acta de su audiencia.
                  </p>
                  <div className="mt-5">
                    <IngresoCodigo />
                  </div>
                </div>
              </Card>
              <p className="mt-4 text-center text-sm text-ciruela-400">
                ¿Es usted personal del centro?{" "}
                <Link
                  href="/login"
                  className="rounded-[var(--radius-brand)] font-medium text-ciruela-600 underline-offset-4 transition-colors duration-150 hover:text-ciruela-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
                >
                  Inicie sesión
                </Link>
              </p>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="anim-subir absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-ciruela-300 lg:block"
            style={{ "--retraso": "1200ms" } as React.CSSProperties}
          >
            <div className="anim-flotar">
              <ChevronDown className="h-6 w-6" strokeWidth={1.5} />
            </div>
          </div>
        </section>

        {/* ── Marquesina institucional ───────────────────────────────────── */}
        <Marquesina />

        {/* ── Cómo funciona: el recorrido de la firma en tres estaciones ─── */}
        <section
          aria-labelledby="como-funciona"
          className="relative overflow-hidden border-t border-humo-200 bg-white"
        >
          {/* Facetas a la deriva para dar continuidad con el héroe */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <svg
              className="anim-flotar absolute right-[6%] top-14 h-7 w-7"
              style={{ "--retraso": "900ms" } as React.CSSProperties}
              viewBox="0 0 32 32"
            >
              <polygon points="2,28 16,4 30,28" fill="#f5cdd1" />
            </svg>
            <svg
              className="anim-flotar absolute bottom-16 left-[4%] h-5 w-5"
              style={{ "--retraso": "2000ms" } as React.CSSProperties}
              viewBox="0 0 32 32"
            >
              <polygon points="2,4 30,12 12,30" fill="#ddd1df" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Revelar className="text-center">
              <span className="barra-guinda mx-auto" aria-hidden="true" />
              <h2
                id="como-funciona"
                className="mt-4 font-display text-3xl font-bold tracking-tight text-ciruela-700 sm:text-4xl"
              >
                Firmar toma menos de un minuto
              </h2>
              <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-ciruela-400 sm:text-base">
                Del código QR proyectado en la sala a la firma registrada en el acta,
                en tres pasos desde su propio celular.
              </p>
            </Revelar>

            <Revelar className="relative mt-14" retrasoMs={100}>
              {/* El trazo del recorrido: se dibuja al entrar en pantalla y,
                  encima, una caravana de guiones guinda marcha sin fin. */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-10 hidden h-16 w-full md:block"
                viewBox="0 0 1100 64"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M60 40 C 220 8, 330 56, 550 32 S 880 8, 1040 40"
                  pathLength={1}
                  stroke="#f5cdd1"
                  strokeWidth={3}
                  strokeDasharray="1"
                  className="trazo-revelar"
                />
                <path
                  d="M60 40 C 220 8, 330 56, 550 32 S 880 8, 1040 40"
                  stroke="#a21c26"
                  strokeWidth={2}
                  strokeDasharray="10 14"
                  strokeLinecap="round"
                  className="anim-marcha"
                  opacity={0.55}
                />
              </svg>

              <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                {pasos.map((paso, indice) => {
                  const Icono = paso.icono;
                  return (
                    <li key={paso.numero} className="relative">
                      <Revelar retrasoMs={200 * indice} className="relative h-full">
                        <div className="group relative h-full overflow-hidden rounded-[var(--radius-brand)] bg-white p-6 shadow-card ring-1 ring-humo-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover sm:p-7">
                          {/* Numeral gigante como marca de agua de la tarjeta */}
                          <span
                            aria-hidden="true"
                            className="anim-flotar pointer-events-none absolute -bottom-8 -right-1 z-0 font-display text-[8rem] font-extrabold leading-none text-guinda-100 transition-colors duration-300 select-none group-hover:text-guinda-200/80"
                            style={{ "--retraso": `${600 * indice}ms` } as React.CSSProperties}
                          >
                            {paso.numero}
                          </span>
                          {/* Estación numerada con anillo pulsante */}
                          <div className="relative z-10 flex items-center gap-4">
                            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-guinda-500 font-display text-xl font-bold text-white shadow-[0_6px_16px_-4px_rgba(162,28,38,0.5)] transition-transform duration-200 group-hover:scale-110">
                              <span
                                aria-hidden="true"
                                className="anim-pulso-anillo absolute inset-0 rounded-full border-2 border-guinda-400"
                                style={{ "--retraso": `${900 * indice}ms` } as React.CSSProperties}
                              />
                              {paso.numero}
                            </span>
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-guinda-50 transition-colors duration-200 group-hover:bg-guinda-100">
                              <Icono
                                className="h-6 w-6 text-guinda-600 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110"
                                strokeWidth={1.5}
                              />
                            </span>
                          </div>
                          <h3 className="relative z-10 mt-5 font-display text-xl font-bold tracking-tight text-ciruela-700">
                            {paso.titulo}
                          </h3>
                          <p className="relative z-10 mt-2 text-sm leading-relaxed text-ciruela-500">
                            {paso.descripcion}
                          </p>
                          {/* Ala que aparece al pasar el cursor */}
                          <AlaPoligonal className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-[var(--radius-brand)] opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
                        </div>
                      </Revelar>
                    </li>
                  );
                })}
              </ol>
            </Revelar>
          </div>
        </section>

        {/* ── Garantías: la evidencia detrás de cada firma ───────────────── */}
        <section
          aria-labelledby="garantias"
          className="relative overflow-hidden border-t border-humo-200 bg-humo-50"
        >
          {/* Una firma gigante se escribe de fondo mientras se lee la sección */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <FirmaAnimada
              className="absolute right-[-8%] top-[32%] w-[48rem] rotate-2"
              stroke="#f5cdd1"
              strokeWidth={3.5}
              retrasoMs={1200}
              duracionS={18}
              opacidad={0.65}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Revelar>
              <span className="barra-guinda" aria-hidden="true" />
              <h2
                id="garantias"
                className="mt-4 max-w-[24ch] font-display text-3xl font-bold tracking-tight text-balance text-ciruela-700 sm:text-4xl"
              >
                Evidencia que respalda cada firma
              </h2>
              <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ciruela-400 sm:text-base">
                Un sistema pensado para fines jurídicos: cada firma queda blindada
                con verificación oficial, sello criptográfico y auditoría completa.
              </p>
            </Revelar>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {garantias.map((garantia, indice) => {
                const Icono = garantia.icono;
                return (
                  <Revelar key={garantia.titulo} retrasoMs={140 * indice} className="h-full">
                    <Card className="group relative h-full overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover sm:p-7">
                      <AlaPoligonal className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
                      {/* Sello vivo: anillo punteado girando + latido del icono */}
                      <span
                        className="anim-latido relative inline-flex h-14 w-14 items-center justify-center"
                        style={{ "--retraso": `${700 * indice}ms` } as React.CSSProperties}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 56 56"
                          className="anim-girar-lento absolute inset-0 h-full w-full text-guinda-200 transition-colors duration-300 group-hover:text-guinda-400"
                        >
                          <circle
                            cx="28"
                            cy="28"
                            r="26"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="5 7"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-guinda-50 transition-colors duration-300 group-hover:bg-guinda-500">
                          <Icono
                            className="h-5.5 w-5.5 text-guinda-600 transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                            strokeWidth={1.5}
                          />
                        </span>
                      </span>
                      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ciruela-700">
                        {garantia.titulo}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ciruela-500">
                        {garantia.descripcion}
                      </p>
                    </Card>
                  </Revelar>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
