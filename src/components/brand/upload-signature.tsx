"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface UploadSignatureProps {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;
const ANCHO_MAXIMO = 1200;
const PADDING_RECORTE = 8;
const UMBRAL_INICIAL = 200;
/** Tinta institucional #1e1220 */
const TINTA_R = 30;
const TINTA_G = 18;
const TINTA_B = 32;
const ALPHA_MINIMO_OSCURO = 180;

/**
 * Aplica el umbral de luminancia sobre la imagen original en memoria:
 * el fondo claro se vuelve transparente y el trazo se lleva a tinta
 * #1e1220 con alpha proporcional. Recorta el bounding box con margen.
 */
function procesarImagen(original: ImageData, umbral: number): string | null {
  const { width, height, data } = original;
  const salida = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const alphaOriginal = data[i + 3] ?? 0;

    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha = 0;
    if (alphaOriginal > 0 && umbral > 0 && luminancia < umbral) {
      const proporcion = 1 - luminancia / umbral;
      // Se eleva el contraste del trazo (factor 1.35 con tope en 255).
      alpha = Math.min(255, Math.round(255 * Math.min(1, proporcion * 1.35)));
      // Los trazos claramente oscuros conservan una opacidad mínima firme.
      if (proporcion >= 0.5) {
        alpha = Math.max(alpha, ALPHA_MINIMO_OSCURO);
      }
      // Se respeta la transparencia previa del PNG de origen.
      alpha = Math.round((alpha * alphaOriginal) / 255);
    }

    salida[i] = TINTA_R;
    salida[i + 1] = TINTA_G;
    salida[i + 2] = TINTA_B;
    salida[i + 3] = alpha;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = salida[(y * width + x) * 4 + 3] ?? 0;
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

  const canvas = document.createElement("canvas");
  canvas.width = anchoTinta + PADDING_RECORTE * 2;
  canvas.height = altoTinta + PADDING_RECORTE * 2;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.putImageData(
    new ImageData(salida, width, height),
    PADDING_RECORTE - minX,
    PADDING_RECORTE - minY,
    minX,
    minY,
    anchoTinta,
    altoTinta,
  );

  return canvas.toDataURL("image/png");
}

export function UploadSignature({ onChange, className }: UploadSignatureProps) {
  const idArchivo = useId();
  const idUmbral = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);

  const [original, setOriginal] = useState<ImageData | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [umbral, setUmbral] = useState(UMBRAL_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Reprocesa la imagen original en memoria cada vez que cambia el umbral.
  useEffect(() => {
    if (!original) return;
    const dataUrl = procesarImagen(original, umbral);
    setVistaPrevia(dataUrl);
    onChangeRef.current(dataUrl);
  }, [original, umbral]);

  const alSeleccionarArchivo = useCallback((evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    if (archivo.type !== "image/png" && archivo.type !== "image/jpeg") {
      setError("El formato del archivo no es admitido. Seleccione una imagen PNG o JPG.");
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      setError(
        "La imagen supera el límite de 5 MB. Reduzca el tamaño del archivo e inténtelo nuevamente.",
      );
      return;
    }

    setError(null);

    const url = URL.createObjectURL(archivo);
    const imagen = new Image();

    imagen.onload = () => {
      URL.revokeObjectURL(url);

      const escala = Math.min(1, ANCHO_MAXIMO / imagen.naturalWidth);
      const ancho = Math.max(1, Math.round(imagen.naturalWidth * escala));
      const alto = Math.max(1, Math.round(imagen.naturalHeight * escala));

      const canvas = document.createElement("canvas");
      canvas.width = ancho;
      canvas.height = alto;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setError("Su navegador no pudo procesar la imagen. Intente con otro navegador.");
        return;
      }

      ctx.drawImage(imagen, 0, 0, ancho, alto);
      setNombreArchivo(archivo.name);
      setOriginal(ctx.getImageData(0, 0, ancho, alto));
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      setError("No se pudo leer la imagen. Verifique que el archivo no esté dañado.");
    };

    imagen.src = url;
  }, []);

  const quitarImagen = useCallback(() => {
    setOriginal(null);
    setNombreArchivo(null);
    setVistaPrevia(null);
    setError(null);
    setUmbral(UMBRAL_INICIAL);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChangeRef.current(null);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <label htmlFor={idArchivo} className="block text-sm font-medium text-berenjena">
          Imagen de su firma (PNG o JPG, máximo 5 MB)
        </label>
        <input
          ref={inputRef}
          id={idArchivo}
          type="file"
          accept="image/png,image/jpeg"
          onChange={alSeleccionarArchivo}
          className="block w-full cursor-pointer rounded-[var(--radius-brand)] border border-humo-300 bg-white text-sm text-berenjena file:mr-3 file:cursor-pointer file:border-0 file:bg-guinda-500 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-guinda-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
        />
      </div>

      {error !== null && (
        <p role="alert" className="text-sm font-medium text-guinda-600">
          {error}
        </p>
      )}

      {original !== null && (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={idUmbral} className="text-sm font-medium text-berenjena">
                Umbral de fondo
              </label>
              <span className="text-sm tabular-nums text-berenjena/70" aria-hidden="true">
                {umbral}
              </span>
            </div>
            <input
              id={idUmbral}
              type="range"
              min={0}
              max={255}
              step={1}
              value={umbral}
              onChange={(evento) => setUmbral(Number(evento.target.value))}
              className="w-full accent-guinda-500"
            />
            <p className="text-xs text-berenjena/70">
              Ajuste el umbral hasta que el fondo desaparezca y el trazo se vea nítido.
            </p>
          </div>

          <div className="fondo-ajedrez flex min-h-[140px] items-center justify-center rounded-[var(--radius-brand)] border border-humo-300 p-4">
            {vistaPrevia !== null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vistaPrevia}
                alt={`Previsualización de la firma procesada${nombreArchivo ? ` del archivo ${nombreArchivo}` : ""}`}
                className="max-h-44 max-w-full"
              />
            ) : (
              <p className="text-center text-sm text-berenjena/70">
                Con el umbral actual no se detecta ningún trazo. Aumente el valor del umbral.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={quitarImagen}
            className="rounded-[var(--radius-brand)] border border-ciruela-600 px-4 py-2 text-sm font-medium text-ciruela-700 transition-colors hover:bg-ciruela-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
          >
            Quitar imagen
          </button>
        </>
      )}
    </div>
  );
}
