"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnkawaLogo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { SignoutButton } from "@/components/panel/signout-button";
import { cn } from "@/lib/utils";
import type { RolUsuario } from "@/lib/types";

interface PanelHeaderProps {
  nombre: string;
  role: RolUsuario;
}

const navItemBase =
  "inline-flex items-center border-b-[3px] px-1 pt-1 pb-0.5 text-sm transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-guinda-500";

/**
 * Barra superior del panel interno. El ítem "Usuarios" solo se
 * renderiza para ADMIN (el backend valida además con requireAdmin()).
 */
export function PanelHeader({ nombre, role }: PanelHeaderProps) {
  const pathname = usePathname();
  const enUsuarios =
    pathname === "/panel/usuarios" || pathname.startsWith("/panel/usuarios/");

  return (
    <header className="bg-white">
      <div className="border-b border-humo-200">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/panel"
            className="flex items-center gap-3 rounded-[var(--radius-brand)] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-guinda-500"
          >
            <AnkawaLogo className="h-12 w-auto sm:h-14" />
            <span className="titulo-institucional text-sm text-ciruela-700">
              Panel de audiencias
            </span>
          </Link>

          <nav aria-label="Navegación del panel" className="flex items-center gap-4">
            <Link
              href="/panel"
              aria-current={!enUsuarios ? "page" : undefined}
              className={cn(
                navItemBase,
                !enUsuarios
                  ? "border-guinda-500 font-semibold text-ciruela-700"
                  : "border-transparent font-medium text-ciruela-400 hover:text-ciruela-700"
              )}
            >
              Sesiones
            </Link>
            {role === "ADMIN" ? (
              <Link
                href="/panel/usuarios"
                aria-current={enUsuarios ? "page" : undefined}
                className={cn(
                  navItemBase,
                  enUsuarios
                    ? "border-guinda-500 font-semibold text-ciruela-700"
                    : "border-transparent font-medium text-ciruela-400 hover:text-ciruela-700"
                )}
              >
                Usuarios
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-medium text-ciruela-700 sm:inline">
              {nombre}
            </span>
            <Badge variant="neutral" className="bg-humo-200 text-ciruela-700">
              {role === "ADMIN" ? "Administrador" : "Operador"}
            </Badge>
            <SignoutButton />
          </div>
        </div>
      </div>
      <span aria-hidden="true" className="block h-[3px] w-full bg-guinda-500" />
    </header>
  );
}
