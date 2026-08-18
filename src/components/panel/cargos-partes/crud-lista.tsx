"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormItem } from "./form-item";
import type { CatalogoItemDto } from "@/lib/types";

interface CrudListaProps {
  titulo: string;
  tipo: "cargo" | "parte";
  items: CatalogoItemDto[];
  onCrear: (nombre: string, orden: number) => Promise<void>;
  onActualizar: (item: CatalogoItemDto) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
  onCambiarOrden: (id: string, direccion: "arriba" | "abajo") => Promise<void>;
  enviando?: boolean;
}

type ModoEdicion = { modo: "crear" } | { modo: "editar"; item: CatalogoItemDto } | null;

export function CrudLista({
  titulo,
  tipo,
  items,
  onCrear,
  onActualizar,
  onEliminar,
  onCambiarOrden,
  enviando = false,
}: CrudListaProps) {
  const [modo, setModo] = React.useState<ModoEdicion>(null);

  const itemsOrdenados = React.useMemo(
    () => [...items].sort((a, b) => a.orden - b.orden),
    [items]
  );

  async function handleGuardar(nombre: string, orden: number) {
    if (modo?.modo === "editar") {
      await onActualizar({ ...modo.item, nombre, orden });
    } else {
      await onCrear(nombre, orden);
    }
    setModo(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{titulo}</CardTitle>
          <p className="mt-1 text-sm text-ciruela-400">
            {items.length} {tipo === "cargo" ? "cargos" : "partes"} registrados
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setModo({ modo: "crear" })}
          disabled={enviando || modo !== null}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Agregar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {modo?.modo === "crear" ? (
          <FormItem
            tipo={tipo}
            onGuardar={handleGuardar}
            onCancelar={() => setModo(null)}
            enviando={enviando}
          />
        ) : null}

        {itemsOrdenados.length === 0 ? (
          <p className="py-6 text-center text-sm text-ciruela-400">
            No hay {tipo === "cargo" ? "cargos" : "partes"} registrados. Presione &quot;Agregar&quot; para crear uno.
          </p>
        ) : (
          <ul className="divide-y divide-humo-200">
            {itemsOrdenados.map((item, indice) => (
              <li key={item.id} className="py-3">
                {modo?.modo === "editar" && modo.item.id === item.id ? (
                  <FormItem
                    tipo={tipo}
                    item={item}
                    onGuardar={handleGuardar}
                    onCancelar={() => setModo(null)}
                    enviando={enviando}
                  />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-humo-200 text-xs font-semibold text-ciruela-600">
                        {indice + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-berenjena">{item.nombre}</p>
                        <p className="text-xs text-ciruela-400">Orden {item.orden}</p>
                      </div>
                      <Badge variant={item.activo ? "success" : "neutral"}>
                        {item.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Subir"
                        onClick={() => onCambiarOrden(item.id, "arriba")}
                        disabled={enviando || indice === 0}
                      >
                        <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Bajar"
                        onClick={() => onCambiarOrden(item.id, "abajo")}
                        disabled={enviando || indice === itemsOrdenados.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => setModo({ modo: "editar", item })}
                        disabled={enviando}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar"
                        onClick={() => onEliminar(item.id)}
                        disabled={enviando}
                        className="text-guinda-600 hover:text-guinda-700"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
