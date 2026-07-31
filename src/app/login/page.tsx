import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { AnkawaMarca } from "@/components/brand/logo";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Acceso del personal autorizado al sistema de firmas de actas de audiencia de CARD – ANKAWA INTL.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <AnkawaMarca className="text-ciruela-700" />

        <section
          aria-labelledby="login-titulo"
          className="w-full rounded-[var(--radius-brand)] bg-white p-6 shadow-card sm:p-8"
        >
          <span className="barra-guinda" aria-hidden="true" />
          <h1 id="login-titulo" className="titulo-institucional mt-4 text-base text-ciruela-700">
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
