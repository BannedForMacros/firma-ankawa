"use client";

import { useCallback, useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { cn } from "@/lib/utils";

interface SignaturePadCanvasProps {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

const COLOR_TINTA = "#1e1220";
const PADDING_RECORTE = 8;
const ALTO_MOVIL = 220;
const ALTO_ESCRITORIO = 260;

/**
 * Lee los píxeles del canvas, calcula el bounding box de la tinta y
 * devuelve un PNG transparente recortado con 8 px de margen.
 */
function recortarFirma(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

  const { width, height } = canvas;
  const pixeles = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixeles[(y * width + x) * 4 + 3] ?? 0;
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null;

  const anchoTinta = maxX - minX + 1;
  const altoTinta = maxY - minY + 1;

  const recorte = document.createElement("canvas");
  recorte.width = anchoTinta + PADDING_RECORTE * 2;
  recorte.height = altoTinta + PADDING_RECORTE * 2;

  const ctxRecorte = recorte.getContext("2d");
  if (!ctxRecorte) return null;

  ctxRecorte.drawImage(
    canvas,
    minX,
    minY,
    anchoTinta,
    altoTinta,
    PADDING_RECORTE,
    PADDING_RECORTE,
    anchoTinta,
    altoTinta,
  );

  return recorte.toDataURL("image/png");
}

export function SignaturePadCanvas({ onChange, className }: SignaturePadCanvasProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const emitirFirma = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad) return;
    onChangeRef.current(pad.isEmpty() ? null : recortarFirma(canvas));
  }, []);

  /**
   * Ajusta el tamaño real del canvas al ancho del contenedor manejando
   * devicePixelRatio. Si hay trazos, los conserva; si está vacío, limpia.
   */
  const redimensionar = useCallback(() => {
    const canvas = canvasRef.current;
    const contenedor = contenedorRef.current;
    const pad = padRef.current;
    if (!canvas || !contenedor || !pad) return;

    const ancho = contenedor.clientWidth;
    if (ancho === 0) return;

    const alto = window.matchMedia("(min-width: 768px)").matches
      ? ALTO_ESCRITORIO
      : ALTO_MOVIL;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const trazos = pad.isEmpty() ? null : pad.toData();

    canvas.width = Math.floor(ancho * ratio);
    canvas.height = Math.floor(alto * ratio);
    canvas.style.width = `${ancho}px`;
    canvas.style.height = `${alto}px`;
    canvas.getContext("2d")?.scale(ratio, ratio);

    pad.clear();
    if (trazos && trazos.length > 0) {
      pad.fromData(trazos);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = contenedorRef.current;
    if (!canvas || !contenedor) return;

    const pad = new SignaturePad(canvas, {
      penColor: COLOR_TINTA,
      minWidth: 1,
      maxWidth: 2.5,
      backgroundColor: "rgba(0,0,0,0)",
    });
    padRef.current = pad;

    const alTerminarTrazo = () => emitirFirma();
    pad.addEventListener("endStroke", alTerminarTrazo);

    redimensionar();

    const observador = new ResizeObserver(() => {
      redimensionar();
    });
    observador.observe(contenedor);

    return () => {
      observador.disconnect();
      pad.removeEventListener("endStroke", alTerminarTrazo);
      pad.off();
      padRef.current = null;
    };
  }, [emitirFirma, redimensionar]);

  const deshacer = () => {
    const pad = padRef.current;
    if (!pad) return;
    const trazos = pad.toData();
    if (trazos.length === 0) return;
    trazos.pop();
    pad.fromData(trazos);
    emitirFirma();
  };

  const limpiar = () => {
    const pad = padRef.current;
    if (!pad) return;
    pad.clear();
    onChangeRef.current(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={contenedorRef}
        className="relative overflow-hidden rounded-[var(--radius-brand)] border-2 border-dashed border-humo-300 bg-white"
      >
        {/* Línea guía sutil para orientar el trazo de la firma */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-[26%] border-t border-humo-200"
        />
        <canvas
          ref={canvasRef}
          className="relative block w-full touch-none select-none"
          aria-label="Área de firma. Trace su firma con el dedo, el lápiz óptico o el ratón."
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={deshacer}
          className="rounded-[var(--radius-brand)] border border-ciruela-600 px-4 py-2 text-sm font-medium text-ciruela-700 transition-colors hover:bg-ciruela-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
        >
          Deshacer
        </button>
        <button
          type="button"
          onClick={limpiar}
          className="rounded-[var(--radius-brand)] border border-ciruela-600 px-4 py-2 text-sm font-medium text-ciruela-700 transition-colors hover:bg-ciruela-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
        >
          Limpiar
        </button>
      </div>

      <p className="text-xs text-berenjena/70">
        Trace su firma dentro del recuadro tal como la consigna en documentos oficiales.
      </p>
    </div>
  );
}
