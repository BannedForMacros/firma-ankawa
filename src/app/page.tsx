import Link from "next/link";
import { BadgeCheck, ChevronDown, ScrollText, ShieldCheck } from "lucide-react";

import { IngresoCodigo } from "@/app/ingreso-codigo";
import { AlaPoligonal } from "@/components/brand/ala-poligonal";
import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { FirmasFondo } from "@/components/landing/firmas-fondo";
import { HeroLogo } from "@/components/landing/hero-logo";
import { Marquesina } from "@/components/landing/marquesina";
import { Revelar } from "@/components/landing/revelar";
import { Card } from "@/components/ui/card";

const pasos = [
  {
    numero: "1",
    titulo: "Identifíquese",
    descripcion:
      "Ingrese su DNI o RUC; el sistema verifica su identidad ante RENIEC o SUNAT.",
  },
  {
    numero: "2",
    titulo: "Firme",
    descripcion:
      "Trace su firma en pantalla o cargue una imagen de su firma manuscrita.",
  },
  {
    numero: "3",
    titulo: "Quede registrado",
    descripcion:
      "Su firma queda incorporada al acta con constancia de fecha, hora e integridad.",
  },
] as const;

/** Desfase vertical de cada paso: escalera descendente que evoca el ala. */
const desfasePasos = ["", "md:mt-10", "md:mt-20"] as const;

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

        {/* ── Cómo funciona: escalera de pasos con rúbrica que se dibuja ─── */}
        <section
          aria-labelledby="como-funciona"
          className="relative overflow-hidden border-t border-humo-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Revelar>
              <span className="barra-guinda" aria-hidden="true" />
              <h2
                id="como-funciona"
                className="mt-4 font-display text-3xl font-bold tracking-tight text-ciruela-700 sm:text-4xl"
              >
                Cómo funciona
              </h2>
            </Revelar>

            <Revelar className="relative mt-14" retrasoMs={100}>
              {/* Rúbrica que cruza los tres pasos y se traza al revelarse */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-8 hidden h-40 w-full md:block"
                viewBox="0 0 1100 160"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M0 30 C 200 10, 300 90, 460 70 C 580 55, 640 120, 780 105 S 1020 150, 1100 130"
                  pathLength={1}
                  stroke="#f5cdd1"
                  strokeWidth={3}
                  className="trazo-revelar"
                />
              </svg>

              <ol className="relative grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-8">
                {pasos.map((paso, indice) => (
                  <li key={paso.numero} className={`relative ${desfasePasos[indice] ?? ""}`}>
                    <Revelar retrasoMs={180 * indice}>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-7 -left-1 font-display text-[7rem] font-extrabold leading-none text-guinda-100 select-none"
                      >
                        {paso.numero}
                      </span>
                      <div className="relative pt-12">
                        <h3 className="font-display text-xl font-bold tracking-tight text-ciruela-700">
                          {paso.titulo}
                        </h3>
                        <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-ciruela-500">
                          {paso.descripcion}
                        </p>
                      </div>
                    </Revelar>
                  </li>
                ))}
              </ol>
            </Revelar>
          </div>
        </section>

        {/* ── Garantías: la evidencia detrás de cada firma ───────────────── */}
        <section
          aria-labelledby="garantias"
          className="relative overflow-hidden border-t border-humo-200 bg-humo-50"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Revelar>
              <span className="barra-guinda" aria-hidden="true" />
              <h2
                id="garantias"
                className="mt-4 max-w-[24ch] font-display text-3xl font-bold tracking-tight text-balance text-ciruela-700 sm:text-4xl"
              >
                Evidencia que respalda cada firma
              </h2>
            </Revelar>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {garantias.map((garantia, indice) => {
                const Icono = garantia.icono;
                return (
                  <Revelar key={garantia.titulo} retrasoMs={140 * indice}>
                    <Card className="h-full p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-7">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-guinda-50">
                        <Icono className="h-5 w-5 text-guinda-600" strokeWidth={1.5} />
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
