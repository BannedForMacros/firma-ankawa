"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, FileUp, X } from "lucide-react";
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

type Campo = "asunto" | "expediente" | "fechaAudiencia" | "modalidad" | "documento";
type ErroresCampos = Partial<Record<Campo, string>>;

const CAMPOS: ReadonlyArray<Campo> = [
  "asunto",
  "expediente",
  "fechaAudiencia",
  "modalidad",
  "documento",
];

const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20 MB por archivo
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB total

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
  const [modalidad, setModalidad] = React.useState<ModalidadAudiencia>("PRESENCIAL");
  const [documentos, setDocumentos] = React.useState<File[]>([]);
  const [errores, setErrores] = React.useState<ErroresCampos>({});
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const reiniciarFormulario = (): void => {
    setAsunto("");
    setExpediente("");
    setFechaAudiencia("");
    setModalidad("PRESENCIAL");
    setDocumentos([]);
    setErrores({});
    setErrorGeneral(null);
  };

  const handleOpenChange = (siguiente: boolean): void => {
    if (enviando) return;
    setOpen(siguiente);
    if (!siguiente) reiniciarFormulario();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []).filter(
      (file) => file.type === "application/pdf"
    );
    setDocumentos((prev) => {
      const nuevos = [...prev];
      for (const file of files) {
        if (!nuevos.some((d) => d.name === file.name && d.size === file.size)) {
          nuevos.push(file);
        }
      }
      return nuevos;
    });
    setErrores((prev) => ({ ...prev, documento: undefined }));
  };

  const handleQuitarDocumento = (index: number): void => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
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

    if (documentos.length === 0) {
      setErrores({ documento: "Debe adjuntar al menos un documento PDF que se va a firmar." });
      return;
    }

    const invalido = documentos.find((d) => d.type !== "application/pdf");
    if (invalido) {
      setErrores({ documento: `Solo se permiten archivos PDF (${invalido.name}).` });
      return;
    }

    const totalSize = documentos.reduce((sum, d) => sum + d.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setErrores({ documento: "El total de los PDFs no puede superar los 50 MB." });
      return;
    }

    const muyGrande = documentos.find((d) => d.size > MAX_DOCUMENT_SIZE);
    if (muyGrande) {
      setErrores({ documento: `El archivo ${muyGrande.name} supera los 20 MB.` });
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("asunto", parsed.data.asunto);
      formData.append("expediente", parsed.data.expediente);
      formData.append("fechaAudiencia", parsed.data.fechaAudiencia.toISOString());
      formData.append("modalidad", parsed.data.modalidad);
      for (const documento of documentos) {
        formData.append("documentos", documento);
      }

      const res = await fetch("/api/sesiones", {
        method: "POST",
        body: formData,
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
            <Label htmlFor="ns-documento">Documentos PDF a firmar</Label>
            <Input
              id="ns-documento"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              aria-invalid={errores.documento ? true : undefined}
              aria-describedby={errores.documento ? "ns-documento-error" : undefined}
              disabled={enviando}
            />
            <p className="text-xs text-ciruela-400">
              <FileUp className="mr-1 inline h-3 w-3" aria-hidden="true" />
              Adjunte uno o más PDFs originales. Las firmas se agregarán al final de cada documento.
            </p>
            {documentos.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {documentos.map((d, i) => (
                  <li
                    key={`${d.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md bg-humo-100 px-2 py-1.5 text-xs text-ciruela-700"
                  >
                    <span className="truncate">{d.name}</span>
                    <button
                      type="button"
                      onClick={() => handleQuitarDocumento(i)}
                      className="shrink-0 rounded p-0.5 text-ciruela-400 hover:bg-humo-200 hover:text-guinda-600"
                      aria-label={`Quitar ${d.name}`}
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {errores.documento ? (
              <p id="ns-documento-error" className="text-xs text-guinda-600">
                {errores.documento}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-humo-300 text-ciruela-700 hover:border-ciruela-300 hover:bg-humo-50 active:bg-humo-100"
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
