"use client";

import { useId, useState } from "react";
import { PenLine } from "lucide-react";
import type { SesionPublicaDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import type { FirmaCapturada, IdentidadFirmante } from "@/components/firmar/flujo-firma";

interface PasoConfirmacionProps {
  sesion: SesionPublicaDto;
  identidad: IdentidadFirmante | null;
  firma: FirmaCapturada | null;
  enviando: boolean;
  onFirmar: () => void;
}

export function PasoConfirmacion({
  identidad,
  firma,
  enviando,
  onFirmar,
}: PasoConfirmacionProps) {
  const idCheckbox = useId();
  const [conformidad, setConformidad] = useState(false);

  if (!identidad || !firma) {
    return (
      <p className="text-sm leading-relaxed text-ciruela-400">
        Complete la identificación y la firma para continuar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-ciruela-700">Confirme y firme</h2>
        <p className="mt-0.5 text-sm text-ciruela-400">
          Revise sus datos y estampe su firma en el acta.
        </p>
      </div>

      <div className="rounded-[var(--radius-brand)] border border-humo-300 bg-humo-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ciruela-700">{identidad.displayName}</p>
          <VerifiedBadge
            verified={identidad.verified}
            source={identidad.docType === "DNI" ? "RENIEC" : "SUNAT"}
          />
        </div>
        <p className="text-xs text-ciruela-400">
          {identidad.docType} {identidad.docNumber}
        </p>

        {identidad.repNombre ? (
          <p className="mt-2 text-xs text-ciruela-400">
            Representante: <span className="text-berenjena">{identidad.repNombre}</span>
            {identidad.repDni ? ` — DNI ${identidad.repDni}` : null}
          </p>
        ) : null}

        <div className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
          <p>
            <span className="font-medium text-ciruela-700">Cargo:</span>{" "}
            <span className="text-berenjena">{identidad.cargo}</span>
          </p>
          <p>
            <span className="font-medium text-ciruela-700">Parte:</span>{" "}
            <span className="text-berenjena">{identidad.parte}</span>
          </p>
          <p>
            <span className="font-medium text-ciruela-700">Firma:</span>{" "}
            <span className="text-berenjena">
              {firma.metodo === "DRAWN" ? "Dibujada" : "Cargada"}
            </span>
          </p>
        </div>

        <div className="fondo-ajedrez mt-4 flex items-center justify-center rounded-[var(--radius-brand)] border border-humo-300 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL local */}
          <img
            src={firma.dataUrl}
            alt="Miniatura de su firma"
            className="max-h-24 max-w-full object-contain"
          />
        </div>
      </div>

      <label
        htmlFor={idCheckbox}
        className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-brand)] border border-humo-300 bg-humo-50 p-4"
      >
        <input
          id={idCheckbox}
          type="checkbox"
          checked={conformidad}
          onChange={(e) => setConformidad(e.target.checked)}
          disabled={enviando}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-humo-300 accent-[#a21c26] outline-none focus-visible:ring-2 focus-visible:ring-guinda-500 focus-visible:ring-offset-2"
        />
        <span className="text-sm leading-relaxed text-berenjena">
          Declaro que la firma corresponde a mi persona / representada y se estampa en conformidad
          con el acta.
        </span>
      </label>

      <Button
        size="lg"
        className="min-h-12 w-full"
        disabled={!conformidad || enviando}
        onClick={onFirmar}
      >
        {enviando ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Registrando…
          </>
        ) : (
          <>
            <PenLine className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Firmar el acta
          </>
        )}
      </Button>
    </div>
  );
}
