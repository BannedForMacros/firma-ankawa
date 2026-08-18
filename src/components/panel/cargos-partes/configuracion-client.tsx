"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CrudLista } from "./crud-lista";
import type { CatalogoItemDto } from "@/lib/types";

interface ConfiguracionClientProps {
  cargosIniciales: CatalogoItemDto[];
  partesIniciales: CatalogoItemDto[];
}

export function ConfiguracionClient({ cargosIniciales, partesIniciales }: ConfiguracionClientProps) {
  const [cargos, setCargos] = React.useState(cargosIniciales);
  const [partes, setPartes] = React.useState(partesIniciales);
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function mostrarError(mensaje: string) {
    setError(mensaje);
    window.setTimeout(() => setError(null), 5000);
  }

  async function handleFetch<T>(
    url: string,
    options?: RequestInit,
  ): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    try {
      const res = await fetch(url, options);
      const body = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
      if (!res.ok) {
        return { ok: false, error: body.error ?? `Error ${res.status}` };
      }
      return { ok: true, data: body as T };
    } catch {
      return { ok: false, error: "No se pudo conectar con el servidor." };
    }
  }

  async function recargarCargos() {
    const resultado = await handleFetch<{ cargos: CatalogoItemDto[] }>("/api/cargos");
    if (resultado.ok) setCargos(resultado.data.cargos);
  }

  async function recargarPartes() {
    const resultado = await handleFetch<{ partes: CatalogoItemDto[] }>("/api/partes");
    if (resultado.ok) setPartes(resultado.data.partes);
  }

  async function crearCargo(nombre: string, orden: number) {
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch<{ cargo: CatalogoItemDto }>("/api/cargos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, orden }),
    });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarCargos();
  }

  async function actualizarCargo(item: CatalogoItemDto) {
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch<{ cargo: CatalogoItemDto }>(`/api/cargos/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: item.nombre, orden: item.orden, activo: item.activo }),
    });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarCargos();
  }

  async function eliminarCargo(id: string) {
    if (!window.confirm("¿Está seguro de eliminar este cargo?")) return;
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch(`/api/cargos/${id}`, { method: "DELETE" });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarCargos();
  }

  async function cambiarOrdenCargo(id: string, direccion: "arriba" | "abajo") {
    const lista = [...cargos].sort((a, b) => a.orden - b.orden);
    const indice = lista.findIndex((c) => c.id === id);
    if (indice === -1) return;
    const objetivo = direccion === "arriba" ? indice - 1 : indice + 1;
    if (objetivo < 0 || objetivo >= lista.length) return;

    const actual = lista[indice];
    const vecino = lista[objetivo];
    const nuevoOrden = vecino.orden;

    await actualizarCargo({ ...actual, orden: nuevoOrden });
  }

  async function crearParte(nombre: string, orden: number) {
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch<{ parte: CatalogoItemDto }>("/api/partes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, orden }),
    });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarPartes();
  }

  async function actualizarParte(item: CatalogoItemDto) {
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch<{ parte: CatalogoItemDto }>(`/api/partes/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: item.nombre, orden: item.orden, activo: item.activo }),
    });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarPartes();
  }

  async function eliminarParte(id: string) {
    if (!window.confirm("¿Está seguro de eliminar esta parte?")) return;
    setEnviando(true);
    setError(null);
    const resultado = await handleFetch(`/api/partes/${id}`, { method: "DELETE" });
    setEnviando(false);
    if (!resultado.ok) {
      mostrarError(resultado.error);
      throw new Error(resultado.error);
    }
    await recargarPartes();
  }

  async function cambiarOrdenParte(id: string, direccion: "arriba" | "abajo") {
    const lista = [...partes].sort((a, b) => a.orden - b.orden);
    const indice = lista.findIndex((p) => p.id === id);
    if (indice === -1) return;
    const objetivo = direccion === "arriba" ? indice - 1 : indice + 1;
    if (objetivo < 0 || objetivo >= lista.length) return;

    const actual = lista[indice];
    const vecino = lista[objetivo];
    const nuevoOrden = vecino.orden;

    await actualizarParte({ ...actual, orden: nuevoOrden });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <CrudLista
          titulo="Cargos"
          tipo="cargo"
          items={cargos}
          onCrear={crearCargo}
          onActualizar={actualizarCargo}
          onEliminar={eliminarCargo}
          onCambiarOrden={cambiarOrdenCargo}
          enviando={enviando}
        />
        <CrudLista
          titulo="Partes"
          tipo="parte"
          items={partes}
          onCrear={crearParte}
          onActualizar={actualizarParte}
          onEliminar={eliminarParte}
          onCambiarOrden={cambiarOrdenParte}
          enviando={enviando}
        />
      </div>
    </div>
  );
}
