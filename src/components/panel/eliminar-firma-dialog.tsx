"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { FirmaResumenDto, SesionDetalleDto } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EliminarFirmaDialogProps {
  sesionId: string;
  /** Firma a eliminar; `null` mantiene el diálogo cerrado. */
  firma: FirmaResumenDto | null;
  sesionCerrada: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se invoca con el detalle actualizado tras una eliminación exitosa. */
  onEliminada: (sesion: SesionDetalleDto | null) => void;
}

/** Confirmación para quitar una firma indebida del acta. */
export function EliminarFirmaDialog({
  sesionId,
  firma,
  sesionCerrada,
  onOpenChange,
  onEliminada,
}: EliminarFirmaDialogProps) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiarApertura = (siguiente: boolean): void => {
    if (enviando) return;
    if (!siguiente) setError(null);
    onOpenChange(siguiente);
  };

  const eliminar = async (): Promise<void> => {
    if (!firma || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/sesiones/${sesionId}/firmas/${firma.id}`, {
        method: "DELETE",
      });
      const cuerpo: unknown = await respuesta.json().catch(() => null);
      if (!respuesta.ok) {
        const mensaje =
          typeof cuerpo === "object" &&
          cuerpo !== null &&
          "error" in cuerpo &&
          typeof (cuerpo as { error: unknown }).error === "string"
            ? (cuerpo as { error: string }).error
            : "No se pudo eliminar la firma. Intente nuevamente.";
        setError(mensaje);
        return;
      }
      const sesion =
        typeof cuerpo === "object" && cuerpo !== null && "sesion" in cuerpo
          ? ((cuerpo as { sesion: SesionDetalleDto | null }).sesion ?? null)
          : null;
      onOpenChange(false);
      onEliminada(sesion);
    } catch {
      setError("No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={firma !== null} onOpenChange={cambiarApertura}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar firma</DialogTitle>
          <DialogDescription>
            Se eliminará la firma de{" "}
            <span className="font-semibold text-berenjena">{firma?.displayName}</span>
            {firma ? ` (${firma.docType} ${firma.docNumberMasked})` : ""} y no aparecerá en
            los documentos PDF. Esta acción no se puede deshacer y quedará registrada en la
            auditoría.
            {sesionCerrada
              ? " Como la sesión está cerrada, se regenerarán los documentos firmados."
              : ""}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="error">
            <AlertTitle>No se pudo eliminar la firma</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => cambiarApertura(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={enviando} onClick={() => void eliminar()}>
            <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            {enviando ? "Eliminando…" : "Eliminar firma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
