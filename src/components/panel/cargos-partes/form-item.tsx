"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { CatalogoItemDto } from "@/lib/types";

interface FormItemProps {
  tipo: "cargo" | "parte";
  item?: CatalogoItemDto | null;
  onGuardar: (nombre: string, orden: number) => void;
  onCancelar: () => void;
  enviando?: boolean;
}

export function FormItem({ tipo, item, onGuardar, onCancelar, enviando = false }: FormItemProps) {
  const [nombre, setNombre] = React.useState(item?.nombre ?? "");
  const [orden, setOrden] = React.useState(String(item?.orden ?? 0));

  const esNuevo = !item;
  const titulo = esNuevo
    ? `Nuevo ${tipo === "cargo" ? "cargo" : "parte"}`
    : `Editar ${tipo === "cargo" ? "cargo" : "parte"}`;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (enviando) return;
    const ordenNumero = Number.parseInt(orden, 10);
    onGuardar(nombre.trim(), Number.isNaN(ordenNumero) ? 0 : ordenNumero);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 p-4">
      <h4 className="text-sm font-semibold text-ciruela-700">{titulo}</h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${tipo}-nombre`}>Nombre</Label>
          <Input
            id={`${tipo}-nombre`}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={tipo === "cargo" ? "Ej.: Alcalde" : "Ej.: Demandante"}
            disabled={enviando}
            maxLength={120}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-28">
          <Label htmlFor={`${tipo}-orden`}>Orden</Label>
          <Input
            id={`${tipo}-orden`}
            type="number"
            min={0}
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            disabled={enviando}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={enviando || nombre.trim().length < 2}>
          {enviando ? <Spinner className="h-4 w-4 text-white" /> : null}
          {enviando ? "Guardando…" : esNuevo ? "Crear" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
