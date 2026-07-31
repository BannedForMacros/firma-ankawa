"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CerrarSesionDialogProps {
  sesionId: string;
  /** Código corto de la sesión; debe escribirse para confirmar el cierre. */
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se invoca tras un cierre exitoso (p. ej. para refrescar la lista en vivo). */
  onCerrada?: () => void;
}

/**
 * Confirmación de cierre definitivo de la sesión de firmas.
 * Exige transcribir el código de la sesión antes de habilitar la acción.
 */
export function CerrarSesionDialog({
  sesionId,
  code,
  open,
  onOpenChange,
  onCerrada,
}: CerrarSesionDialogProps) {
  const router = useRouter();
  const [confirmacion, setConfirmacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coincide = confirmacion.trim().toUpperCase() === code.toUpperCase();

  const cambiarApertura = (siguiente: boolean): void => {
    if (enviando) return;
    if (!siguiente) {
      setConfirmacion("");
      setError(null);
    }
    onOpenChange(siguiente);
  };

  const cerrarDefinitivamente = async (): Promise<void> => {
    if (!coincide || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/sesiones/${sesionId}/cerrar`, {
        method: "POST",
      });
      if (!respuesta.ok) {
        const cuerpo: unknown = await respuesta.json().catch(() => null);
        const mensaje =
          typeof cuerpo === "object" &&
          cuerpo !== null &&
          "error" in cuerpo &&
          typeof (cuerpo as { error: unknown }).error === "string"
            ? (cuerpo as { error: string }).error
            : "No se pudo cerrar la sesión de firmas. Intente nuevamente.";
        setError(mensaje);
        return;
      }
      setConfirmacion("");
      onOpenChange(false);
      onCerrada?.();
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={cambiarApertura}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar la sesión de firmas</DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. Una vez cerrada, ninguna persona podrá
            registrar nuevas firmas en esta acta. El acta quedará lista para la
            generación de la planilla final de firmas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirmacion-cierre">
            Para confirmar, escriba el código de la sesión:{" "}
            <span className="font-semibold tracking-[0.2em] text-ciruela-700">{code}</span>
          </Label>
          <Input
            id="confirmacion-cierre"
            value={confirmacion}
            onChange={(evento) => setConfirmacion(evento.target.value)}
            placeholder={code}
            autoComplete="off"
            spellCheck={false}
            disabled={enviando}
            aria-invalid={confirmacion.length > 0 && !coincide}
            className="uppercase tracking-[0.2em]"
          />
        </div>

        {error ? (
          <Alert variant="error">
            <AlertTitle>No se pudo cerrar la sesión</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => cambiarApertura(false)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!coincide || enviando}
            onClick={() => void cerrarDefinitivamente()}
          >
            <Lock aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            {enviando ? "Cerrando la sesión…" : "Cerrar definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
