import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { AnkawaMarca } from "@/components/brand/logo";
import { LogoFondo } from "@/components/brand/logo-fondo";
import { FirmaAnimada } from "@/components/landing/firmas-fondo";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Acceso del personal autorizado al sistema de firmas de actas de audiencia de CARD – ANKAWA INTL.",
};

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-humo-50 px-4 py-12 sm:px-6">
      {/* El cóndor monumental preside el acceso del personal */}
      <LogoFondo posicion="left-1/2 top-1/2 w-[64rem] max-w-[94%] -translate-x-1/2 -translate-y-1/2" opacidad={0.05} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <FirmaAnimada
          className="absolute -left-24 bottom-10 w-[28rem] -rotate-6"
          stroke="#e79aa1"
          retrasoMs={600}
          duracionS={16}
          opacidad={0.4}
        />
      </div>
      <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
        <AnkawaMarca />

        <section
          aria-labelledby="login-titulo"
          className="w-full rounded-[var(--radius-brand)] bg-white p-6 shadow-card sm:p-8"
        >
          <span className="barra-guinda" aria-hidden="true" />
          <h1
            id="login-titulo"
            className="mt-4 font-display text-2xl font-bold tracking-tight text-ciruela-700"
          >
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ciruela-400">
            Acceso reservado al personal autorizado del centro. Ingrese sus
            credenciales institucionales.
          </p>

          <div className="mt-6">
            <Suspense
              fallback={
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
