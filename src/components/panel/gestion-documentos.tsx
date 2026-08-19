"use client";

import { useState } from "react";
import { FileDown, FileText, Trash2, UploadCloud, Eye } from "lucide-react";
import type { DocumentoSesionDto, SesionDetalleDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PrevisualizarDocumento } from "@/components/panel/previsualizar-documento";

interface GestionDocumentosProps {
  sesion: SesionDetalleDto;
  abierta: boolean;
  onChange: () => void;
}

export function GestionDocumentos({ sesion, abierta, onChange }: GestionDocumentosProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type === "application/pdf");
    setArchivos(files);
    setError(null);
  };

  const handleSubir = async () => {
    if (archivos.length === 0) return;
    setSubiendo(true);
    setError(null);

    const formData = new FormData();
    for (const archivo of archivos) {
      formData.append("documentos", archivo);
    }

    try {
      const res = await fetch(`/api/sesiones/${sesion.id}/documentos`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as
        | { sesion: SesionDetalleDto }
        | { error: string }
        | null;

      if (res.ok && data && "sesion" in data) {
        setArchivos([]);
        onChange();
      } else {
        setError(data && "error" in data ? data.error : "No se pudieron subir los documentos.");
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (doc: DocumentoSesionDto) => {
    if (!confirm(`¿Eliminar "${doc.originalName}"? Esta acción no se puede deshacer.`)) return;
    setEliminandoId(doc.id);
    try {
      const res = await fetch(`/api/sesiones/${sesion.id}/documentos/${doc.id}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as
        | { sesion: SesionDetalleDto }
        | { error: string }
        | null;

      if (res.ok && data && "sesion" in data) {
        onChange();
      } else {
        setError(data && "error" in data ? data.error : "No se pudo eliminar el documento.");
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <section className="rounded-[var(--radius-brand)] border border-humo-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-ciruela-700">
        {sesion.status === "CLOSED" ? "Documentos firmados" : "Documentos a firmar"}
      </h2>
      <p className="text-xs text-ciruela-400">
        {sesion.status === "CLOSED"
          ? "Estos son los documentos finales con las firmas adjuntas. Se generaron automáticamente al cerrar la sesión."
          : "Puede adjuntar uno o más PDFs. Cada documento se firmará con la misma planilla de firmantes."}
      </p>

      {abierta ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Label htmlFor="sd-documento" className="sr-only">
              Archivos PDF
            </Label>
            <Input
              id="sd-documento"
              type="file"
              accept="application/pdf"
              multiple
              disabled={subiendo}
              onChange={handleFileChange}
            />
            {archivos.length > 0 ? (
              <p className="mt-1.5 text-xs text-ciruela-500">
                {archivos.length} archivo(s) seleccionado(s)
              </p>
            ) : null}
            {error ? (
              <p className="mt-1.5 text-xs text-guinda-600">{error}</p>
            ) : null}
          </div>
          <Button
            variant="primary"
            disabled={archivos.length === 0 || subiendo}
            onClick={handleSubir}
          >
            {subiendo ? (
              <Spinner className="h-4 w-4 text-white" />
            ) : (
              <UploadCloud className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
            {subiendo ? "Subiendo…" : "Subir documentos"}
          </Button>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2">
        {sesion.documentos.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-ciruela-400" strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ciruela-700" title={doc.originalName}>
                  {doc.originalName}
                </p>
                <p className="text-[0.65rem] text-ciruela-400">
                  {new Date(doc.createdAt).toLocaleString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href={`/api/documentos/${doc.originalPath}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-humo-300 bg-white px-2 text-xs font-medium text-ciruela-700 hover:bg-humo-100"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                Original
              </a>

              {sesion.status === "CLOSED" && doc.signedPath ? (
                <a
                  href={`/api/documentos/${doc.signedPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-transparent bg-guinda-600 px-2 text-xs font-medium text-white hover:bg-guinda-700"
                >
                  <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Firmado
                </a>
              ) : (
                <PrevisualizarDocumento
                  url={`/api/planilla/${sesion.id}?documentoId=${doc.id}&modo=preview`}
                  label="Planilla"
                />
              )}

              {abierta ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-guinda-600 hover:bg-guinda-50 hover:text-guinda-700"
                  disabled={eliminandoId === doc.id}
                  onClick={() => handleEliminar(doc)}
                  aria-label={`Eliminar ${doc.originalName}`}
                >
                  {eliminandoId === doc.id ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {sesion.documentos.length === 0 ? (
        <p className="mt-3 text-sm text-ciruela-400">
          Aún no hay documentos adjuntos.
        </p>
      ) : null}
    </section>
  );
}
