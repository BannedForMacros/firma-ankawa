"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { dniSchema, rucSchema } from "@/lib/validation";
import type { CatalogoItemDto, IdentidadDto, TipoDocumento } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const PARTES_FRECUENTES = [
  "Demandante",
  "Demandado",
  "Tribunal arbitral",
  "Secretaría arbitral",
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

  const [docType, setDocType] = useState<TipoDocumento>("DNI");
  const [numero, setNumero] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState<IdentidadDto | null>(null);
  const [errorConsulta, setErrorConsulta] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [nombreManual, setNombreManual] = useState("");

  const [repNombre, setRepNombre] = useState("");
  const [repDni, setRepDni] = useState("");
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

  const schemaNumero = docType === "DNI" ? dniSchema : rucSchema;
  const validacionNumero = schemaNumero.safeParse(numero);
  const numeroValido = validacionNumero.success;
  const mensajeNumero =
    numero.length > 0 && !numeroValido ? validacionNumero.error.issues[0]?.message ?? null : null;

  const repDniValido = dniSchema.safeParse(repDni).success;

  const cambiarTab = useCallback((valor: string) => {
    setDocType(valor === "RUC" ? "RUC" : "DNI");
    setNumero("");
    setResultado(null);
    setErrorConsulta(null);
    setManual(false);
    setNombreManual("");
    setRepNombre("");
    setRepDni("");
  }, []);

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
        body: JSON.stringify({ docType, docNumber: numero, sessionToken: token }),
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
  }, [numeroValido, consultando, docType, numero, token]);

  const displayName = useMemo(() => {
    if (resultado) {
      return resultado.tipo === "DNI" ? resultado.nombreCompleto : resultado.razonSocial;
    }
    return manual ? nombreManual.trim() : "";
  }, [resultado, manual, nombreManual]);

  const identificado = resultado !== null || manual;
  const requiereRep = docType === "RUC" && identificado;
  const rucNoHabilitado = resultado?.tipo === "RUC" && !resultado.habilitado;

  const identidadCompleta = useMemo<IdentidadFirmante | null>(() => {
    const completo =
      identificado &&
      numeroValido &&
      displayName.length >= 3 &&
      cargo.trim().length >= 2 &&
      parte.trim().length >= 2 &&
      (!requiereRep || (repNombre.trim().length >= 3 && repDniValido));
    if (!completo) return null;
    return {
      docType,
      docNumber: numero,
      displayName,
      ...(requiereRep ? { repNombre: repNombre.trim(), repDni: repDni.trim() } : {}),
      cargo: cargo.trim(),
      parte: parte.trim(),
      verified: resultado !== null,
      ...(resultado?.tipo === "RUC" ? { habilitado: resultado.habilitado } : {}),
    };
  }, [
    docType,
    numero,
    numeroValido,
    identificado,
    displayName,
    cargo,
    parte,
    requiereRep,
    repNombre,
    repDni,
    repDniValido,
    resultado,
  ]);

  useEffect(() => {
    onChange(identidadCompleta);
  }, [identidadCompleta, onChange]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-ciruela-700">Identifíquese</h2>
        <p className="mt-0.5 text-sm text-ciruela-400">
          Complete sus datos para continuar con la firma.
        </p>
      </div>

      <Tabs value={docType} onValueChange={cambiarTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-0 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="DNI"
            className="min-h-11 rounded-none border-b-2 border-humo-200 px-3 py-2.5 text-sm data-[state=active]:border-guinda-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Persona natural
          </TabsTrigger>
          <TabsTrigger
            value="RUC"
            className="min-h-11 rounded-none border-b-2 border-humo-200 px-3 py-2.5 text-sm data-[state=active]:border-guinda-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Persona jurídica
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idBase}-numero`}>{docType === "DNI" ? "DNI" : "RUC"}</Label>
        <Input
          id={`${idBase}-numero`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={docType === "DNI" ? 8 : 11}
          placeholder={docType === "DNI" ? "8 dígitos" : "11 dígitos"}
          value={numero}
          onChange={(e) => cambiarNumero(e.target.value)}
          aria-invalid={mensajeNumero ? true : undefined}
          aria-describedby={mensajeNumero ? `${idBase}-numero-error` : undefined}
          className="min-h-11"
        />
        {mensajeNumero ? (
          <p id={`${idBase}-numero-error`} className="text-xs text-guinda-600">
            {mensajeNumero}
          </p>
        ) : null}
      </div>

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

      {resultado?.tipo === "RUC" ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-ciruela-400">Razón social verificada</p>
              <VerifiedBadge verified source="SUNAT" />
            </div>
            <p className="mt-1 text-sm font-semibold text-berenjena">{resultado.razonSocial}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={resultado.estado === "ACTIVO" ? "success" : "warning"}>
                {resultado.estado}
              </Badge>
              <Badge variant={resultado.condicion === "HABIDO" ? "success" : "warning"}>
                {resultado.condicion}
              </Badge>
            </div>
          </div>
          {rucNoHabilitado ? (
            <Alert variant="warning">
              <AlertDescription>
                SUNAT reporta este RUC como {resultado.estado} / {resultado.condicion}. Puede
                continuar, pero quedará registrado.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}

      {manual ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor={`${idBase}-nombre-manual`}>
              {docType === "DNI" ? "Nombre completo" : "Razón social"}
            </Label>
            <VerifiedBadge verified={false} />
          </div>
          <Input
            id={`${idBase}-nombre-manual`}
            value={nombreManual}
            onChange={(e) => setNombreManual(e.target.value)}
            placeholder={docType === "DNI" ? "Tal como figura en su DNI" : "Tal como figura ante SUNAT"}
            aria-describedby={`${idBase}-nota-manual`}
            className="min-h-11"
          />
          <p id={`${idBase}-nota-manual`} className="text-xs leading-relaxed text-amber-800">
            Este registro quedará marcado como No verificado.
          </p>
        </div>
      ) : null}

      {requiereRep ? (
        <fieldset className="flex flex-col gap-3 rounded-[var(--radius-brand)] border border-humo-300 p-4">
          <legend className="px-1 text-sm font-medium text-ciruela-700">Representante</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idBase}-rep-nombre`}>Nombre completo</Label>
            <Input
              id={`${idBase}-rep-nombre`}
              value={repNombre}
              onChange={(e) => setRepNombre(e.target.value)}
              placeholder="Ej.: Juan Pérez Quispe"
              autoComplete="name"
              className="min-h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idBase}-rep-dni`}>DNI del representante</Label>
            <Input
              id={`${idBase}-rep-dni`}
              inputMode="numeric"
              maxLength={8}
              value={repDni}
              onChange={(e) => setRepDni(e.target.value.replace(/\D/g, ""))}
              placeholder="8 dígitos"
              aria-invalid={repDni.length > 0 && !repDniValido ? true : undefined}
              aria-describedby={
                repDni.length > 0 && !repDniValido ? `${idBase}-rep-dni-error` : undefined
              }
              className="min-h-11"
            />
            {repDni.length > 0 && !repDniValido ? (
              <p id={`${idBase}-rep-dni-error`} className="text-xs text-guinda-600">
                El DNI debe tener 8 dígitos.
              </p>
            ) : null}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
