"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Download, MonitorUp, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrPosterProps {
  sesion: {
    code: string;
    asunto: string;
    expediente: string;
    fechaAudiencia: string;
    sede: string;
  };
  url: string;
}

const claseBotonBase =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-brand)] px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciruela-600 disabled:cursor-not-allowed disabled:opacity-60";

export function QrPoster({ sesion, url }: QrPosterProps) {
  const escenarioRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [proyectando, setProyectando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: "#2E1A30", light: "#FFFFFF" },
    })
      .then((dataUrl) => {
        if (vigente) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (vigente) {
          setQrDataUrl(null);
          setAviso("No fue posible generar el código QR. Recargue la página para intentarlo nuevamente.");
        }
      });
    return () => {
      vigente = false;
    };
  }, [url]);

  useEffect(() => {
    const alCambiarFullscreen = () => {
      setProyectando(document.fullscreenElement === escenarioRef.current);
    };
    document.addEventListener("fullscreenchange", alCambiarFullscreen);
    return () => document.removeEventListener("fullscreenchange", alCambiarFullscreen);
  }, []);

  // Dirección legible para quien no pueda escanear el QR: el host de la
  // URL de firma (derivada de APP_URL), donde se ingresa el código corto.
  const direccionLegible = useMemo(() => {
    try {
      return new URL(url).host;
    } catch {
      return null;
    }
  }, [url]);

  const fechaLegible = useMemo(() => {
    const fecha = new Date(sesion.fechaAudiencia);
    if (Number.isNaN(fecha.getTime())) return sesion.fechaAudiencia;
    return new Intl.DateTimeFormat("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Lima",
    }).format(fecha);
  }, [sesion.fechaAudiencia]);

  const descargarPng = useCallback(async () => {
    const nodo = posterRef.current;
    if (!nodo) return;
    setDescargando(true);
    setAviso(null);
    try {
      const dataUrl = await toPng(nodo, { pixelRatio: 3, cacheBust: true });
      const enlace = document.createElement("a");
      enlace.href = dataUrl;
      enlace.download = `cartel-qr-${sesion.code}.png`;
      enlace.click();
    } catch {
      setAviso("No fue posible generar la imagen PNG. Intente nuevamente o utilice la opción Imprimir / PDF.");
    } finally {
      setDescargando(false);
    }
  }, [sesion.code]);

  const imprimir = useCallback(() => {
    window.print();
  }, []);

  const proyectar = useCallback(() => {
    const escenario = escenarioRef.current;
    if (!escenario) return;
    setAviso(null);
    escenario.requestFullscreen().catch(() => {
      setAviso("Su navegador no permitió la proyección en pantalla completa.");
    });
  }, []);

  return (
    <section aria-label={`Cartel de firma de la sesión ${sesion.code}`}>
      {/* Escenario de proyección: en pantalla completa centra el póster sobre fondo ciruela */}
      <div
        ref={escenarioRef}
        className={cn(
          proyectando &&
            "flex h-full w-full items-center justify-center overflow-auto bg-ciruela-800 p-8"
        )}
      >
        {/* Nodo exportable del póster */}
        <div
          ref={posterRef}
          className={cn(
            // `poster-imprimible`: al imprimir, globals.css oculta el resto
            // de la interfaz y deja únicamente este nodo (cartel limpio).
            "poster-imprimible mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius-brand)] bg-white shadow-card",
            proyectando && "max-w-xl shadow-none"
          )}
        >
          {/* Cabecera institucional */}
          <header className="flex items-center gap-4 bg-ciruela-700 px-6 py-5">
            <Image
              src="/brand/logo.png"
              alt="Ankawa Internacional"
              width={52}
              height={52}
              className="h-13 w-13 shrink-0 object-contain"
            />
            <div>
              <p className="titulo-institucional text-[0.62rem] leading-relaxed text-white/85">
                Centro de Arbitraje y Resolución de Disputas
              </p>
              <p className="titulo-institucional text-base leading-tight text-white">
                CARD – ANKAWA INTL
              </p>
            </div>
          </header>

          {/* Asunto y expediente */}
          <div className="border-b border-humo-200 px-8 pb-5 pt-6 text-center">
            <p className="text-base font-semibold leading-snug text-berenjena">{sesion.asunto}</p>
            <p className="titulo-institucional mt-2 text-xs text-ciruela-700">
              Expediente {sesion.expediente}
            </p>
          </div>

          {/* Código QR con marco guinda */}
          <div className="flex flex-1 flex-col items-center px-8 py-8">
            <div className="rounded-none border-8 border-guinda-500 bg-white p-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Código QR para firmar el acta de la sesión ${sesion.code}`}
                  className={cn("block h-56 w-56", proyectando && "h-80 w-80")}
                />
              ) : (
                <div
                  role="status"
                  aria-label="Generando código QR"
                  className={cn(
                    "flex h-56 w-56 items-center justify-center bg-humo-100",
                    proyectando && "h-80 w-80"
                  )}
                >
                  <span className="text-sm text-ciruela-400">Generando código QR…</span>
                </div>
              )}
            </div>

            {/* Código corto */}
            <p
              aria-label={`Código de la sesión: ${sesion.code}`}
              className={cn(
                "mt-6 pl-[0.3em] text-center font-[family-name:var(--font-display)] text-5xl font-bold tracking-[0.3em] text-ciruela-700",
                proyectando && "text-6xl"
              )}
            >
              {sesion.code}
            </p>

            {/* Instrucciones */}
            <p className="mt-6 text-center text-base font-semibold text-berenjena">
              Escanee el código para firmar el acta
            </p>
            <p className="mt-1 text-center text-sm text-ciruela-500">
              o ingrese el código en{" "}
              {direccionLegible ? (
                <span className="font-semibold text-ciruela-700">{direccionLegible}</span>
              ) : (
                "la página principal"
              )}
            </p>
          </div>

          {/* Franja inferior */}
          <footer className="flex items-center justify-between gap-4 bg-guinda-500 px-6 py-3 text-sm text-white">
            <span className="font-medium">{sesion.sede}</span>
            <span>{fechaLegible}</span>
          </footer>
        </div>

        {proyectando && (
          <p className="no-print sr-only" role="status">
            Proyección en pantalla completa activa. Presione la tecla Escape para salir.
          </p>
        )}
      </div>

      {/* Acciones (fuera del nodo exportable, ocultas al imprimir) */}
      <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void descargarPng()}
          disabled={descargando || !qrDataUrl}
          className={cn(claseBotonBase, "bg-guinda-500 text-white hover:bg-guinda-600")}
        >
          <Download aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          {descargando ? "Generando imagen…" : "Descargar PNG"}
        </button>
        <button
          type="button"
          onClick={imprimir}
          className={cn(
            claseBotonBase,
            "border border-ciruela-600 bg-white text-ciruela-700 hover:bg-ciruela-50"
          )}
        >
          <Printer aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          Imprimir / PDF
        </button>
        <button
          type="button"
          onClick={proyectar}
          className={cn(
            claseBotonBase,
            "border border-ciruela-600 bg-white text-ciruela-700 hover:bg-ciruela-50"
          )}
        >
          <MonitorUp aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          Proyectar
        </button>
      </div>

      {aviso && (
        <p role="alert" className="no-print mt-3 text-center text-sm text-guinda-600">
          {aviso}
        </p>
      )}
    </section>
  );
}
