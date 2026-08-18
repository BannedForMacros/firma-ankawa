import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { SectionTitle } from "@/components/brand/section-title";
import { ConfiguracionClient } from "@/components/panel/cargos-partes/configuracion-client";
import type { CatalogoItemDto } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cargos y partes — CARD ANKAWA INTL",
};

export default async function CargosPartesPage() {
  let autorizado = true;
  try {
    await requireAdmin();
  } catch {
    autorizado = false;
  }
  if (!autorizado) {
    redirect("/panel");
  }

  const [cargosRaw, partesRaw] = await Promise.all([
    db.cargo.findMany({ orderBy: { orden: "asc" } }),
    db.parte.findMany({ orderBy: { orden: "asc" } }),
  ]);

  const cargos: CatalogoItemDto[] = cargosRaw.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    orden: c.orden,
    activo: c.activo,
  }));

  const partes: CatalogoItemDto[] = partesRaw.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    orden: p.orden,
    activo: p.activo,
  }));

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Configuración"
        title="Cargos y partes de las audiencias"
      />
      <p className="max-w-[70ch] text-sm leading-relaxed text-ciruela-400">
        Administre los cargos y partes que los firmantes podrán elegir al registrar su firma.
        También pueden escribir un valor libre si ninguna opción aplica.
      </p>
      <ConfiguracionClient cargosIniciales={cargos} partesIniciales={partes} />
    </div>
  );
}
