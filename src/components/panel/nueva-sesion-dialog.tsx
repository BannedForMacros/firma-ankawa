"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { crearSesionSchema } from "@/lib/validation";
import type { ModalidadAudiencia, SesionResumenDto } from "@/lib/types";

type Campo = "asunto" | "expediente" | "fechaAudiencia" | "sede" | "modalidad";
type ErroresCampos = Partial<Record<Campo, string>>;

const CAMPOS: ReadonlyArray<Campo> = [
  "asunto",
  "expediente",
  "fechaAudiencia",
  "sede",
  "modalidad",
];

interface NuevaSesionDialogProps {
  /** Variante visual del botón que abre el diálogo. */
  triggerVariant?: "primary" | "outline";
}

/**
 * Diálogo de creación de una sesión de firmas. Valida con
 * crearSesionSchema en el cliente y envía a POST /api/sesiones.
 */
export function NuevaSesionDialog({ triggerVariant = "primary" }: NuevaSesionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [asunto, setAsunto] = React.useState("");
  const [expediente, setExpediente] = React.useState("");
  const [fechaAudiencia, setFechaAudiencia] = React.useState("");
  const [sede, setSede] = React.useState("Sede Cusco");
  const [modalidad, setModalidad] = React.useState<ModalidadAudiencia>("PRESENCIAL");
  const [errores, setErrores] = React.useState<ErroresCampos>({});
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const reiniciarFormulario = (): void => {
    setAsunto("");
    setExpediente("");
    setFechaAudiencia("");
    setSede("Sede Cusco");
    setModalidad("PRESENCIAL");
    setErrores({});
    setErrorGeneral(null);
  };

  const handleOpenChange = (siguiente: boolean): void => {
    if (enviando) return;
    setOpen(siguiente);
    if (!siguiente) reiniciarFormulario();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setErrorGeneral(null);

    const parsed = crearSesionSchema.safeParse({
      asunto,
      expediente,
      fechaAudiencia,
      sede,
      modalidad,
    });

    if (!parsed.success) {
      const nuevos: ErroresCampos = {};
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0];
        if (
          typeof campo === "string" &&
          (CAMPOS as ReadonlyArray<string>).includes(campo) &&
          !nuevos[campo as Campo]
        ) {
          nuevos[campo as Campo] = issue.message;
        }
      }
      setErrores(nuevos);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const res = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => null)) as
        | { sesion: SesionResumenDto }
        | { error: string }
        | null;

      if (res.status === 201 && data && "sesion" in data) {
        router.push(`/panel/sesion/${data.sesion.id}`);
        router.refresh();
        return;
      }

      setErrorGeneral(
        data && "error" in data
          ? data.error
          : "No fue posible crear la sesión. Verifique los datos e intente nuevamente."
      );
      setEnviando(false);
    } catch {
      setErrorGeneral(
        "No fue posible comunicarse con el servidor. Revise su conexión e intente nuevamente."
      );
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Nueva sesión de firma
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva sesión de firma</DialogTitle>
          <DialogDescription>
            Registre los datos de la audiencia. Al crear la sesión se generará
            el código y el enlace para que los participantes firmen el acta.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="grid gap-4"
        >
          {errorGeneral ? (
            <Alert variant="error">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="ns-asunto">Asunto de la audiencia</Label>
            <Textarea
              id="ns-asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Audiencia única de instalación y puntos controvertidos…"
              maxLength={300}
              aria-invalid={errores.asunto ? true : undefined}
              aria-describedby={errores.asunto ? "ns-asunto-error" : undefined}
              disabled={enviando}
            />
            {errores.asunto ? (
              <p id="ns-asunto-error" className="text-xs text-guinda-600">
                {errores.asunto}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ns-expediente">Número de expediente</Label>
            <Input
              id="ns-expediente"
              value={expediente}
              onChange={(e) => setExpediente(e.target.value)}
              placeholder="Exp. N.º 001-2026-CARD"
              maxLength={60}
              aria-invalid={errores.expediente ? true : undefined}
              aria-describedby={errores.expediente ? "ns-expediente-error" : undefined}
              disabled={enviando}
            />
            {errores.expediente ? (
              <p id="ns-expediente-error" className="text-xs text-guinda-600">
                {errores.expediente}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="ns-fecha">Fecha y hora de la audiencia</Label>
              <Input
                id="ns-fecha"
                type="datetime-local"
                value={fechaAudiencia}
                onChange={(e) => setFechaAudiencia(e.target.value)}
                aria-invalid={errores.fechaAudiencia ? true : undefined}
                aria-describedby={errores.fechaAudiencia ? "ns-fecha-error" : undefined}
                disabled={enviando}
              />
              {errores.fechaAudiencia ? (
                <p id="ns-fecha-error" className="text-xs text-guinda-600">
                  {errores.fechaAudiencia}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ns-modalidad">Modalidad</Label>
              <Select
                id="ns-modalidad"
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as ModalidadAudiencia)}
                aria-invalid={errores.modalidad ? true : undefined}
                aria-describedby={errores.modalidad ? "ns-modalidad-error" : undefined}
                disabled={enviando}
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="MIXTA">Mixta</option>
              </Select>
              {errores.modalidad ? (
                <p id="ns-modalidad-error" className="text-xs text-guinda-600">
                  {errores.modalidad}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ns-sede">Sede</Label>
            <Input
              id="ns-sede"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              maxLength={120}
              aria-invalid={errores.sede ? true : undefined}
              aria-describedby={errores.sede ? "ns-sede-error" : undefined}
              disabled={enviando}
            />
            {errores.sede ? (
              <p id="ns-sede-error" className="text-xs text-guinda-600">
                {errores.sede}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={enviando}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? <Spinner className="h-4 w-4 text-white" /> : null}
              {enviando ? "Creando sesión…" : "Crear sesión de firma"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
