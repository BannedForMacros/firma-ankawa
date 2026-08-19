"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, FileDown, FileText, MapPin, PenLine, UploadCloud, Users, XOctagon } from "lucide-react";

import type { ModalidadAudiencia, SesionDetalleDto } from "@/lib/types";
import { fechaCorta, fechaHoraLegal } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { QrPoster } from "@/components/brand/qr-poster";
import { SectionTitle } from "@/components/brand/section-title";
import { SessionStatusPill } from "@/components/brand/session-status-pill";
import { SignerCard } from "@/components/panel/signer-card";
import { CerrarSesionDialog } from "@/components/panel/cerrar-sesion-dialog";
import { useSesionEnVivo } from "@/components/panel/use-sesion-en-vivo";
import { PrevisualizarDocumento } from "@/components/panel/previsualizar-documento";

interface SesionDetalleProps {
  inicial: SesionDetalleDto;
  qrUrl: string;
}

const MODALIDAD_LEGIBLE: Record<ModalidadAudiencia, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
  MIXTA: "Mixta",
};

/** Vista de detalle de la sesión en el panel: QR proyectable + firmas en vivo. */
export function SesionDetalle({ inicial, qrUrl }: SesionDetalleProps) {
  const [dialogoCierreAbierto, setDialogoCierreAbierto] = useState(false);
  const [resaltadaId, setResaltadaId] = useState<string | null>(null);

  // Subida/reemplazo del documento PDF dentro de la sesión.
  const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
  const [subiendoPdf, setSubiendoPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
  const [exitoPdf, setExitoPdf] = useState(false);

  // El dato en vivo manda; mientras el hook carga se usa el snapshot del servidor.
  const [sesionBase, setSesionBase] = useState(inicial);
  const { sesion: enVivo, error, refetch } = useSesionEnVivo(
    inicial.id,
    sesionBase.status === "OPEN"
  );

  useEffect(() => {
    if (enVivo) setSesionBase(enVivo);
  }, [enVivo]);

  const sesion = enVivo ?? sesionBase;
  const abierta = sesion.status === "OPEN";

  // Resalta durante 2 s la firma recién llegada.
  const idsConocidosRef = useRef<ReadonlySet<string>>(
    new Set(inicial.firmas.map((firma) => firma.id))
  );
  useEffect(() => {
    const nuevas = sesion.firmas.filter((firma) => !idsConocidosRef.current.has(firma.id));
    if (nuevas.length === 0) return;
    idsConocidosRef.current = new Set(sesion.firmas.map((firma) => firma.id));
    const ultima = nuevas[nuevas.length - 1];
    if (!ultima) return;
    setResaltadaId(ultima.id);
    const temporizador = window.setTimeout(() => setResaltadaId(null), 2000);
    return () => window.clearTimeout(temporizador);
  }, [sesion.firmas]);

  const fechaAudienciaLegible = useMemo(() => {
    const fecha = new Date(sesion.fechaAudiencia);
    return Number.isNaN(fecha.getTime()) ? sesion.fechaAudiencia : fechaCorta(fecha);
  }, [sesion.fechaAudiencia]);

  const cierreLegible = useMemo(() => {
    if (!sesion.closedAt) return null;
    const fecha = new Date(sesion.closedAt);
    return Number.isNaN(fecha.getTime()) ? sesion.closedAt : fechaHoraLegal(fecha);
  }, [sesion.closedAt]);

  const totalFirmas = sesion.firmas.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link
        href="/panel"
        className="inline-flex items-center gap-2 text-sm font-medium text-ciruela-700 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-guinda-500 focus-visible:ring-offset-2 focus-visible:ring-offset-humo-100 rounded-[calc(var(--radius-brand)-0.25rem)]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        Volver a sesiones
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* Columna izquierda: cartel QR proyectable */}
        <div>
          <SectionTitle eyebrow="Acceso de firmantes" title="Cartel QR" className="mb-5" />
          <QrPoster
            sesion={{
              code: sesion.code,
              asunto: sesion.asunto,
              expediente: sesion.expediente,
              fechaAudiencia: sesion.fechaAudiencia,
              sede: sesion.sede,
            }}
            url={qrUrl}
          />
        </div>

        {/* Columna derecha: cabecera, contador y lista en vivo */}
        <div className="min-w-0">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="titulo-institucional text-xs text-guinda-600">
                    Sesión {sesion.code}
                  </p>
                  <h1 className="mt-1 text-xl font-semibold leading-snug text-ciruela-700">
                    {sesion.asunto}
                  </h1>
                  <p className="mt-1 text-sm text-ciruela-400">
                    Expediente {sesion.expediente}
                  </p>
                </div>
                <SessionStatusPill status={sesion.status} />
              </div>

              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-berenjena">
                <div className="flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="h-4 w-4 text-ciruela-400" strokeWidth={1.5} />
                  <dt className="sr-only">Fecha de la audiencia</dt>
                  <dd>{fechaAudienciaLegible}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-ciruela-400" strokeWidth={1.5} />
                  <dt className="sr-only">Sede</dt>
                  <dd>{sesion.sede}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Users aria-hidden="true" className="h-4 w-4 text-ciruela-400" strokeWidth={1.5} />
                  <dt className="sr-only">Modalidad</dt>
                  <dd>Modalidad {MODALIDAD_LEGIBLE[sesion.modalidad]}</dd>
                </div>
              </dl>
              <p className="text-xs text-ciruela-400">
                Sesión creada por {sesion.createdByNombre}
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Documento a firmar */}
              <section className="rounded-[var(--radius-brand)] border border-humo-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-ciruela-700">
                  {sesion.status === "CLOSED" ? "Documento firmado" : "Documento a firmar"}
                </h2>
                <p className="text-xs text-ciruela-400">
                  {sesion.status === "CLOSED" && sesion.documentoFirmadoPdf
                    ? "Este es el documento final con las firmas adjuntas. Se generó automáticamente al cerrar la sesión."
                    : sesion.documentoPdf
                      ? "Ya hay un PDF adjunto. Puede reemplazarlo o verlo."
                      : "Aún no hay un PDF adjunto. Adjunte el documento que firmarán los participantes."}
                </p>

                {sesion.status === "CLOSED" && sesion.documentoFirmadoPdf ? (
                  <a
                    href={`/api/documentos/${sesion.documentoFirmadoPdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-3 inline-flex",
                    )}
                  >
                    <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Ver documento firmado
                  </a>
                ) : (
                  <>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <Label htmlFor="sd-documento" className="sr-only">
                          Archivo PDF
                        </Label>
                        <Input
                          id="sd-documento"
                          type="file"
                          accept="application/pdf"
                          disabled={subiendoPdf}
                          onChange={(e) => {
                            setArchivoPdf(e.target.files?.[0] ?? null);
                            setErrorPdf(null);
                            setExitoPdf(false);
                          }}
                        />
                        {errorPdf ? (
                          <p className="mt-1.5 text-xs text-guinda-600">{errorPdf}</p>
                        ) : null}
                        {exitoPdf ? (
                          <p className="mt-1.5 text-xs text-emerald-600">Documento actualizado correctamente.</p>
                        ) : null}
                      </div>
                      <Button
                        variant="primary"
                        disabled={!archivoPdf || subiendoPdf}
                        onClick={async () => {
                          if (!archivoPdf) return;
                          setSubiendoPdf(true);
                          setErrorPdf(null);
                          setExitoPdf(false);

                          if (archivoPdf.type !== "application/pdf") {
                            setErrorPdf("El archivo debe ser un PDF.");
                            setSubiendoPdf(false);
                            return;
                          }
                          if (archivoPdf.size > 8 * 1024 * 1024) {
                            setErrorPdf("El PDF no puede superar los 8 MB.");
                            setSubiendoPdf(false);
                            return;
                          }

                          const formData = new FormData();
                          formData.append("documento", archivoPdf);

                          try {
                            const res = await fetch(`/api/sesiones/${sesion.id}`, {
                              method: "PATCH",
                              body: formData,
                            });
                            const data = (await res.json().catch(() => null)) as
                              | { sesion: SesionDetalleDto }
                              | { error: string }
                              | null;

                            if (res.ok && data && "sesion" in data) {
                              setSesionBase(data.sesion);
                              setArchivoPdf(null);
                              setExitoPdf(true);
                              void refetch();
                            } else {
                              setErrorPdf(
                                data && "error" in data
                                  ? data.error
                                  : "No se pudo actualizar el documento.",
                              );
                            }
                          } catch {
                            setErrorPdf("Error de conexión. Intente nuevamente.");
                          } finally {
                            setSubiendoPdf(false);
                          }
                        }}
                      >
                        {subiendoPdf ? (
                          <Spinner className="h-4 w-4 text-white" />
                        ) : (
                          <UploadCloud className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                        )}
                        {subiendoPdf ? "Subiendo…" : "Subir / reemplazar"}
                      </Button>
                    </div>

                    {sesion.documentoPdf ? (
                      <a
                        href={`/api/documentos/${sesion.documentoPdf}`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "mt-3 inline-flex",
                        )}
                      >
                        <FileText className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                        Ver documento adjunto
                      </a>
                    ) : null}
                  </>
                )}
              </section>

              {/* Contador grande de firmas */}
              <div className="rounded-[var(--radius-brand)] bg-humo-100 px-6 py-5">
                <p
                  aria-live="polite"
                  className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none tracking-tight text-guinda-600"
                >
                  {totalFirmas}
                  <span className="ml-3 align-middle text-lg font-semibold tracking-normal text-berenjena">
                    {totalFirmas === 1 ? "firma recibida" : "firmas recibidas"}
                  </span>
                </p>
                {abierta ? (
                  <p className="mt-2 flex items-center gap-2 text-xs text-ciruela-400">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                    />
                    Actualización automática cada 4 segundos.
                  </p>
                ) : null}
              </div>

              {error ? (
                <Alert variant="warning">
                  <AlertTitle>Actualización interrumpida</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {!abierta ? (
                <Alert variant="info">
                  <AlertTitle>Sesión cerrada</AlertTitle>
                  <AlertDescription>
                    Sesión cerrada{cierreLegible ? ` el ${cierreLegible}` : ""}
                    {sesion.closedByNombre ? ` por ${sesion.closedByNombre}` : ""}. Ya no
                    es posible registrar nuevas firmas en esta acta.
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* Acciones según estado */}
              <div className="flex flex-wrap items-center gap-3">
                {abierta ? (
                  <>
                    {/* El personal que conduce la audiencia también firma el acta:
                        entra al mismo flujo público del token para que exista un
                        único camino de firma con la misma evidencia. */}
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "primary", size: "md" }))}
                    >
                      <PenLine aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                      Firmar esta acta
                    </a>
                    <Button
                      variant="destructive"
                      onClick={() => setDialogoCierreAbierto(true)}
                    >
                      <XOctagon aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                      Cerrar sesión de firmas
                    </Button>
                  </>
                ) : null}
                {!abierta && sesion.documentoFirmadoPdf ? (
                  <>
                    <a
                      href={`/api/documentos/${sesion.documentoFirmadoPdf}`}
                      className={cn(buttonVariants({ variant: "primary", size: "md" }))}
                    >
                      <FileDown aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                      Descargar documento firmado
                    </a>
                    <PrevisualizarDocumento url={`/api/documentos/${sesion.documentoFirmadoPdf}`} />
                  </>
                ) : (
                  <>
                    <a
                      href={`/api/planilla/${sesion.id}`}
                      className={cn(
                        buttonVariants({ variant: abierta ? "outline" : "primary", size: "md" })
                      )}
                    >
                      <FileDown aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                      Descargar documento firmado
                    </a>
                    <PrevisualizarDocumento sesionId={sesion.id} />
                  </>
                )}
              </div>
              {abierta ? (
                <p className="text-xs text-ciruela-400">
                  Se recomienda cerrar la sesión antes de generar el documento final.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Lista en vivo de firmas */}
          <section aria-label="Firmas registradas" className="mt-8">
            <SectionTitle eyebrow="En vivo" title="Firmas registradas" className="mb-5" />
            {totalFirmas === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <PenLine aria-hidden="true" className="h-8 w-8 text-ciruela-300" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-berenjena">
                    Aún no se ha registrado ninguna firma.
                  </p>
                  <p className="max-w-sm text-sm text-ciruela-400">
                    {abierta
                      ? "Proyecte el cartel QR para que los participantes escaneen el código y firmen el acta desde sus dispositivos."
                      : "La sesión se cerró sin firmas registradas."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ol className="space-y-3" aria-live="polite">
                {sesion.firmas.map((firma, indice) => (
                  <SignerCard
                    key={firma.id}
                    firma={firma}
                    orden={indice + 1}
                    resaltada={firma.id === resaltadaId}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <CerrarSesionDialog
        sesionId={sesion.id}
        code={sesion.code}
        open={dialogoCierreAbierto}
        onOpenChange={setDialogoCierreAbierto}
        onCerrada={refetch}
      />
    </div>
  );
}
