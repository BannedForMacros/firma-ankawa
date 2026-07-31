import Link from "next/link";

import { IngresoCodigo } from "@/app/ingreso-codigo";
import { SiteFooter, SiteHeader } from "@/components/brand/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pasos = [
  {
    numero: "1",
    titulo: "Identifíquese",
    descripcion: "Ingrese su DNI o RUC; el sistema verifica su identidad ante RENIEC o SUNAT.",
  },
  {
    numero: "2",
    titulo: "Firme",
    descripcion: "Trace su firma en pantalla o cargue una imagen de su firma manuscrita.",
  },
  {
    numero: "3",
    titulo: "Quede registrado",
    descripcion: "Su firma queda incorporada al acta con constancia de fecha, hora e integridad.",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Héroe institucional */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <span className="barra-guinda" aria-hidden="true" />
          <p className="titulo-institucional mt-4 text-xs text-ciruela-500 sm:text-sm">
            Centro de Arbitraje y Resolución de Disputas
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-ciruela-700 sm:text-5xl">
            Firma de actas de audiencia
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ciruela-500 sm:text-lg">
            Plataforma oficial de CARD – ANKAWA INTL para la suscripción de actas de
            audiencia arbitral. Las partes y sus representantes firman de manera
            verificada, y cada firma queda registrada con plena constancia de
            identidad, fecha y hora.
          </p>
        </section>

        {/* Accesos */}
        <section
          aria-label="Accesos al sistema"
          className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 pb-14 sm:px-6 md:grid-cols-5"
        >
          {/* Tarjeta protagonista: firmante */}
          <Card className="order-1 md:order-2 md:col-span-3">
            <CardHeader>
              <CardTitle className="font-display text-2xl">
                ¿Va a firmar un acta?
              </CardTitle>
              <CardDescription>
                Si participa en una audiencia, ingrese aquí el código indicado por el
                tribunal para suscribir el acta correspondiente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IngresoCodigo />
            </CardContent>
          </Card>

          {/* Personal autorizado */}
          <div className="order-2 flex flex-col justify-between gap-6 rounded-[var(--radius-brand)] bg-ciruela-700 p-6 text-white shadow-card md:order-1 md:col-span-2">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-xl font-semibold leading-snug">
                Personal autorizado
              </h2>
              <p className="text-sm leading-relaxed text-humo-200">
                Acceso reservado a la Secretaría Arbitral y al personal del centro
                para la administración de sesiones de firma y la emisión de planillas.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-brand)] border border-white/60 px-6 text-base font-medium text-white transition-colors duration-150 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section aria-labelledby="como-funciona" className="border-t border-humo-200 bg-humo-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <span className="barra-guinda" aria-hidden="true" />
            <h2 id="como-funciona" className="titulo-institucional mt-4 text-lg text-ciruela-700">
              Cómo funciona
            </h2>
            <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {pasos.map((paso) => (
                <li key={paso.numero} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-brand)] bg-guinda-500 font-display text-lg font-bold text-white"
                  >
                    {paso.numero}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-base font-semibold text-ciruela-700">
                      {paso.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed text-ciruela-500">
                      {paso.descripcion}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
