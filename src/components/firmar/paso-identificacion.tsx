"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { dniSchema } from "@/lib/validation";
import type { CatalogoItemDto, IdentidadDto } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { SelectOInput } from "@/components/firmar/select-o-input";
import type { IdentidadFirmante } from "@/components/firmar/flujo-firma";

interface PasoIdentificacionProps {
  token: string;
  onChange: (identidad: IdentidadFirmante | null) => void;
}

const CARGOS_FRECUENTES = [
  "Árbitro único",
  "Árbitro",
  "Representante legal",
  "Abogado(a)",
  "Secretario(a) arbitral",
  "Perito",
  "Testigo",
] as const;

async function leerMensajeDeError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // Cuerpo no JSON.
  }
  return "El servicio de verificación no respondió. Intente nuevamente.";
}

export function PasoIdentificacion({ token, onChange }: PasoIdentificacionProps) {
  const idBase = useId();

  const [numero, setNumero] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState<IdentidadDto | null>(null);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [nombreManual, setNombreManual] = useState("");

  const [conEntidad, setConEntidad] = useState(false);
  const [entidad, setEntidad] = useState("");
  const [cargo, setCargo] = useState("");
  const [parte, setParte] = useState("");

  const [cargos, setCargos] = useState<CatalogoItemDto[]>([]);
  const [partes, setPartes] = useState<CatalogoItemDto[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Carga de catálogos.
  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const [resCargos, resPartes] = await Promise.all([
          fetch("/api/cargos"),
          fetch("/api/partes"),
        ]);
        const dataCargos = (await resCargos.json().catch(() => ({}))) as {
          cargos?: CatalogoItemDto[];
        };
        const dataPartes = (await resPartes.json().catch(() => ({}))) as {
          partes?: CatalogoItemDto[];
        };
        if (!cancelado) {
          setCargos(dataCargos.cargos ?? []);
          setPartes(dataPartes.partes ?? []);
        }
      } catch {
        // Fallback implícito con opciones frecuentes.
      } finally {
        if (!cancelado) setCargandoCatalogos(false);
      }
    }
    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const opcionesCargo = useMemo(
    () => (cargos.length > 0 ? cargos.map((c) => c.nombre) : CARGOS_FRECUENTES.slice()),
    [cargos]
  );
  const opcionesParte = useMemo(
    () => (partes.length > 0 ? partes.map((p) => p.nombre) : PARTES_FRECUENTES.slice()),
    [partes]
  );

  const numeroValido = dniSchema.safeParse(numero).success;

  const cambiarNumero = useCallback((valor: string) => {
    setNumero(valor.replace(/\D/g, ""));
    setResultado(null);
    setErrorConsulta(null);
    setManual(false);
  }, []);

  const verificar = useCallback(async () => {
    if (!numeroValido || consultando) return;
    setConsultando(true);
    setErrorConsulta(null);
    setResultado(null);
    setManual(false);
    try {
      const res = await fetch("/api/identidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "DNI", docNumber: numero, sessionToken: token }),
      });
      if (!res.ok) {
        setErrorConsulta(await leerMensajeDeError(res));
        return;
      }
      const data = (await res.json()) as { identidad?: IdentidadDto };
      if (!data.identidad) {
        setErrorConsulta("El servicio de verificación devolvió una respuesta inesperada.");
        return;
      }
      setResultado(data.identidad);
    } catch {
      setErrorConsulta("No se pudo conectar con el servicio de verificación.");
    } finally {
      setConsultando(false);
    }
  }, [numeroValido, consultando, numero, token]);

  const displayName = useMemo(() => {
    if (resultado?.tipo === "DNI") return resultado.nombreCompleto;
    return manual ? nombreManual.trim() : "";
  }, [resultado, manual, nombreManual]);

  const identificado = resultado !== null || manual;

  const identidadCompleta = useMemo<IdentidadFirmante | null>(() => {
    const entidadFinal = conEntidad ? entidad.trim() : "";
    const entidadValida = !conEntidad || entidadFinal.length >= 2;
    const completo =
      identificado &&
      numeroValido &&
      displayName.length >= 3 &&
      cargo.trim().length >= 2 &&
      parte.trim().length >= 2 &&
      entidadValida;
    if (!completo) return null;
    return {
      docType: "DNI",
      docNumber: numero,
      displayName,
      ...(conEntidad && entidadFinal ? { entidad: entidadFinal } : {}),
      cargo: cargo.trim(),
      parte: parte.trim(),
      verified: resultado !== null,
    };
  }, [identificado, numeroValido, displayName, conEntidad, entidad, cargo, parte, resultado, numero]);

  useEffect(() => {
    onChange(identidadCompleta);
  }, [identidadCompleta, onChange]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-ciruela-700">Identifíquese</h2>
        <p className="mt-0.5 text-sm text-ciruela-400">
          Ingrese sus datos para continuar con la firma.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idBase}-dni`}>DNI</Label>
        <Input
          id={`${idBase}-dni`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          placeholder="8 dígitos"
          value={numero}
          onChange={(e) => cambiarNumero(e.target.value)}
          className="min-h-11"
        />
        {!numeroValido && numero.length > 0 ? (
          <p className="text-xs text-guinda-600">El DNI debe tener 8 dígitos.</p>
        ) : null}
      </div>

      <Button
        onClick={verificar}
        disabled={!numeroValido || consultando}
        className="min-h-11 w-full"
      >
        {consultando ? (
          <Spinner className="h-4 w-4 text-white" />
        ) : (
          <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        )}
        Verificar identidad
      </Button>

      {consultando ? (
        <p className="flex items-center gap-2 text-sm text-ciruela-400" aria-live="polite">
          <Spinner className="h-4 w-4" />
          Consultando…
        </p>
      ) : null}

      {errorConsulta && !manual ? (
        <Alert variant="warning">
          <AlertTitle>No se pudo verificar la identidad</AlertTitle>
          <AlertDescription>
            <p>{errorConsulta}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 min-h-11 w-full border-humo-300 hover:border-ciruela-300"
              onClick={() => setManual(true)}
            >
              Continuar manualmente
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {resultado?.tipo === "DNI" ? (
        <div className="rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ciruela-400">Nombre verificado</p>
            <VerifiedBadge verified source="RENIEC" />
          </div>
          <p className="mt-1 text-sm font-semibold text-berenjena">{resultado.nombreCompleto}</p>
        </div>
      ) : null}

      {manual ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor={`${idBase}-nombre-manual`}>Nombre completo</Label>
            <VerifiedBadge verified={false} />
          </div>
          <Input
            id={`${idBase}-nombre-manual`}
            value={nombreManual}
            onChange={(e) => setNombreManual(e.target.value)}
            placeholder="Tal como figura en su DNI"
            aria-describedby={`${idBase}-nota-manual`}
            className="min-h-11"
          />
          <p id={`${idBase}-nota-manual`} className="text-xs leading-relaxed text-amber-800">
            Este registro quedará marcado como No verificado.
          </p>
        </div>
      ) : null}

      {identificado ? (
        <div className="anim-subir flex flex-col gap-4 border-t border-humo-200 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-ciruela-700">¿En qué calidad firma?</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-ciruela-400">
              Estos datos aparecerán bajo su firma en el acta.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-ciruela-700">¿Firma en representación de una entidad?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConEntidad(true)}
                className={
                  conEntidad
                    ? "rounded-[var(--radius-brand)] border border-guinda-300 bg-guinda-50 px-3 py-2 text-sm font-medium text-guinda-700"
                    : "rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 py-2 text-sm font-medium text-ciruela-500 transition-colors hover:border-ciruela-300 hover:text-ciruela-700"
                }
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => {
                  setConEntidad(false);
                  setEntidad("");
                }}
                className={
                  !conEntidad
                    ? "rounded-[var(--radius-brand)] border border-guinda-300 bg-guinda-50 px-3 py-2 text-sm font-medium text-guinda-700"
                    : "rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 py-2 text-sm font-medium text-ciruela-500 transition-colors hover:border-ciruela-300 hover:text-ciruela-700"
                }
              >
                No
              </button>
            </div>
          </div>

          {conEntidad ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idBase}-entidad`}>Entidad que representa</Label>
              <Input
                id={`${idBase}-entidad`}
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                placeholder="Ej.: Municipalidad Provincial de Lima"
                className="min-h-11"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectOInput
              id={`${idBase}-cargo`}
              label="Cargo o rol"
              options={opcionesCargo}
              value={cargo}
              onChange={setCargo}
              placeholder="Seleccione un cargo"
              placeholderInput="Escriba su cargo"
              otroLabel="Otro cargo"
              disabled={cargandoCatalogos}
            />
            <SelectOInput
              id={`${idBase}-parte`}
              label="Parte que representa"
              options={opcionesParte}
              value={parte}
              onChange={setParte}
              placeholder="Seleccione una parte"
              placeholderInput="Escriba la parte"
              otroLabel="Otra parte"
              disabled={cargandoCatalogos}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
