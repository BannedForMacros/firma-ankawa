"use client";

import { useId, useState } from "react";
import { PenLine } from "lucide-react";
import type { SesionPublicaDto } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  sesion,
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
        Complete los pasos de identificación y firma para revisar el resumen antes de firmar
        el acta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-ciruela-700">Revise y confirme</h2>
        <p className="mt-1 text-sm leading-relaxed text-ciruela-400">
          Verifique que los datos y la firma son correctos antes de estamparla en el acta.
        </p>
      </div>

      <Card className="border border-humo-300 shadow-none">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">{identidad.displayName}</CardTitle>
            <VerifiedBadge
              verified={identidad.verified}
              source={identidad.docType === "DNI" ? "RENIEC" : "SUNAT"}
            />
          </div>
          <CardDescription>
            {identidad.docType === "DNI" ? "DNI" : "RUC"} {identidad.docNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {identidad.repNombre ? (
              <div className="sm:col-span-2">
                <dt className="font-medium text-ciruela-700">Representante que firma</dt>
                <dd className="text-berenjena">
                  {identidad.repNombre}
                  {identidad.repDni ? ` — DNI ${identidad.repDni}` : null}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-medium text-ciruela-700">Cargo o rol</dt>
              <dd className="text-berenjena">{identidad.cargo}</dd>
            </div>
            <div>
              <dt className="font-medium text-ciruela-700">Parte que representa</dt>
              <dd className="text-berenjena">{identidad.parte}</dd>
            </div>
            <div>
              <dt className="font-medium text-ciruela-700">Expediente</dt>
              <dd className="text-berenjena">{sesion.expediente}</dd>
            </div>
            <div>
              <dt className="font-medium text-ciruela-700">Asunto</dt>
              <dd className="text-berenjena">{sesion.asunto}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-ciruela-700">Método de firma</dt>
              <dd className="text-berenjena">
                {firma.metodo === "DRAWN" ? "Dibujada en pantalla" : "Imagen cargada"}
              </dd>
            </div>
          </dl>
          <div className="fondo-ajedrez mt-4 flex items-center justify-center rounded-[var(--radius-brand)] border border-humo-300 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL local, no optimizable */}
            <img
              src={firma.dataUrl}
              alt="Miniatura de su firma"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        </CardContent>
      </Card>

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
          Declaro que la firma corresponde a mi persona / a la persona jurídica que represento
          y que se estampa en señal de conformidad con el contenido del acta de la presente
          audiencia.
        </span>
      </label>

      <Button
        size="lg"
        className="w-full sm:w-auto sm:self-end"
        disabled={!conformidad || enviando}
        onClick={onFirmar}
      >
        {enviando ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Registrando su firma…
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
