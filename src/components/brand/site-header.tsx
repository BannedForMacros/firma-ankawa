import Link from "next/link";
import { AnkawaLogo } from "@/components/brand/logo";

/**
 * Encabezado público del sitio: superficie blanca con el logo a todo
 * color, wordmark en ciruela y la línea guinda de 3px como firma de
 * marca bajo el borde inferior.
 */
export function SiteHeader() {
  return (
    <header className="bg-white">
      <div className="border-b border-humo-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-[var(--radius-brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-guinda-500"
          >
            <AnkawaLogo className="h-10 w-10" />
            <span className="flex flex-col leading-tight">
              <span className="titulo-institucional hidden text-[0.6rem] tracking-[0.18em] text-ciruela-400 sm:block">
                Centro de Arbitraje y Resolución de Disputas
              </span>
              <span className="titulo-institucional text-sm tracking-[0.22em] text-ciruela-700">
                CARD – ANKAWA INTL
              </span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-[var(--radius-brand)] border border-humo-300 px-4 py-2 text-sm font-semibold text-ciruela-700 transition-colors duration-150 hover:border-ciruela-300 hover:text-ciruela-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
      <span aria-hidden="true" className="block h-[3px] w-full bg-guinda-500" />
    </header>
  );
}

/** Pie de página institucional del sitio público. */
export function SiteFooter() {
  const anio = new Date().getFullYear();
  return (
    <footer className="border-t border-humo-200 bg-humo-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-center text-xs text-ciruela-400 sm:px-6">
        <p className="titulo-institucional text-[0.65rem] tracking-[0.18em] text-ciruela-600">
          Centro de Arbitraje y Resolución de Disputas CARD – ANKAWA INTL
        </p>
        <p>Sede Cusco – Perú</p>
        <p>
          © {anio} Ankawa Internacional. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
