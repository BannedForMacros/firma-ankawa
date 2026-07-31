import Link from "next/link";
import { AnkawaLogo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { SignoutButton } from "@/components/panel/signout-button";
import type { RolUsuario } from "@/lib/types";

interface PanelHeaderProps {
  nombre: string;
  role: RolUsuario;
}

/**
 * Barra superior del panel interno. El ítem "Usuarios" solo se
 * renderiza para ADMIN (el backend valida además con requireAdmin()).
 */
export function PanelHeader({ nombre, role }: PanelHeaderProps) {
  return (
    <header className="bg-ciruela-700 text-white shadow-card">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/panel"
          className="flex items-center gap-3 rounded-[var(--radius-brand)] outline-none focus-visible:ring-2 focus-visible:ring-guinda-300"
        >
          <AnkawaLogo className="h-9 w-9" />
          <span className="titulo-institucional text-sm text-white">
            Panel de audiencias
          </span>
        </Link>

        <nav aria-label="Navegación del panel" className="flex items-center gap-1">
          <Link
            href="/panel"
            className="rounded-[var(--radius-brand)] px-3 py-1.5 text-sm font-medium text-ciruela-100 transition-colors duration-150 outline-none hover:bg-ciruela-600 hover:text-white focus-visible:ring-2 focus-visible:ring-guinda-300"
          >
            Sesiones
          </Link>
          {role === "ADMIN" ? (
            <Link
              href="/panel/usuarios"
              className="rounded-[var(--radius-brand)] px-3 py-1.5 text-sm font-medium text-ciruela-100 transition-colors duration-150 outline-none hover:bg-ciruela-600 hover:text-white focus-visible:ring-2 focus-visible:ring-guinda-300"
            >
              Usuarios
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm font-medium text-white sm:inline">
            {nombre}
          </span>
          <Badge variant={role === "ADMIN" ? "guinda" : "neutral"}>
            {role === "ADMIN" ? "Administrador" : "Operador"}
          </Badge>
          <SignoutButton />
        </div>
      </div>
    </header>
  );
}
