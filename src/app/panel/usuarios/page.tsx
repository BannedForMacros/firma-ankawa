import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { SectionTitle } from "@/components/brand/section-title";
import { NuevoUsuarioDialog } from "@/components/panel/nuevo-usuario-dialog";
import {
  UsuariosTabla,
  type UsuarioListadoDto,
} from "@/components/panel/usuarios-tabla";

export const metadata: Metadata = {
  title: "Usuarios internos — CARD ANKAWA INTL",
};

/**
 * Gestión de usuarios internos. Acceso exclusivo del rol ADMIN:
 * la navegación oculta este módulo al OPERADOR y, además, el servidor
 * verifica el rol antes de renderizar.
 */
export default async function UsuariosPage() {
  let autorizado = true;
  try {
    await requireAdmin();
  } catch {
    autorizado = false;
  }
  if (!autorizado) {
    redirect("/panel");
  }

  const registros = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
      createdAt: true,
    },
  });

  const usuarios: UsuarioListadoDto[] = registros.map((u) => ({
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    role: u.role,
    activo: u.activo,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          eyebrow="Administración"
          title="Usuarios internos"
        />
        <NuevoUsuarioDialog />
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-ciruela-400">
        Cuentas del personal del centro con acceso al panel. Los administradores
        gestionan usuarios y sesiones; los operadores gestionan únicamente las
        sesiones de firmas.
      </p>

      <UsuariosTabla usuarios={usuarios} />
    </div>
  );
}
