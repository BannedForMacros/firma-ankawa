import Link from "next/link";
import { AnkawaLogo } from "@/components/brand/logo";

/**
 * Encabezado público del sitio: fondo ciruela profundo con wordmark en
 * blanco y borde inferior guinda, según la identidad institucional.
 */
export function SiteHeader() {
  return (
    <header className="border-b-[3.5px] border-guinda-500 bg-ciruela-700 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[var(--radius-brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <AnkawaLogo className="h-10 w-10" />
          <span className="flex flex-col leading-tight">
            <span className="titulo-institucional hidden text-[0.6rem] tracking-[0.18em] text-humo-200 sm:block">
              Centro de Arbitraje y Resolución de Disputas
            </span>
            <span className="titulo-institucional text-sm tracking-[0.22em] text-white">
              CARD – ANKAWA INTL
            </span>
          </span>
        </Link>
        <Link
          href="/login"
          className="rounded-[var(--radius-brand)] border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
}

/** Pie de página institucional del sitio público. */
export function SiteFooter() {
  const anio = new Date().getFullYear();
  return (
    <footer className="border-t border-humo-300 bg-humo-50">
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
