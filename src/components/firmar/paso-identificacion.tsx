"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { dniSchema, rucSchema } from "@/lib/validation";
import type { IdentidadDto, TipoDocumento } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import type { IdentidadFirmante } from "@/components/firmar/flujo-firma";

interface PasoIdentificacionProps {
  token: string;
  /** Emite la identidad completa cuando el paso está listo; null si falta información. */
  onChange: (identidad: IdentidadFirmante | null) => void;
}

/** Opciones de un toque para no obligar al firmante a redactar. */
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
    // Cuerpo no JSON: se usa el mensaje genérico.
  }
  return "El servicio de verificación de identidad no respondió. Intente nuevamente.";
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

  const schemaNumero = docType === "DNI" ? dniSchema : rucSchema;
  const validacionNumero = schemaNumero.safeParse(numero);
  const numeroValido = validacionNumero.success;
  const mensajeNumero =
    numero.length > 0 && !numeroValido
      ? validacionNumero.success
        ? null
        : validacionNumero.error.issues[0]?.message ?? null
      : null;

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
      setErrorConsulta(
        "No se pudo establecer conexión con el servicio de verificación. Revise su conexión a internet.",
      );
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

  const identidadCompleta = useMemo<IdentidadFirmante | null>(() => {
    const requiereRep = docType === "RUC";
    const identificado = resultado !== null || manual;
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
    resultado,
    manual,
    displayName,
    repNombre,
    repDni,
    repDniValido,
    cargo,
    parte,
  ]);

  useEffect(() => {
    onChange(identidadCompleta);
  }, [identidadCompleta, onChange]);

  /** La identidad quedó establecida (verificada o manual): recién entonces
      se piden los datos de participación, para no abrumar al firmante. */
  const identificado = resultado !== null || manual;
  const mostrarRep = docType === "RUC" && identificado;
  const rucNoHabilitado = resultado?.tipo === "RUC" && !resultado.habilitado;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-ciruela-700">Identifíquese</h2>
        <p className="mt-1 text-sm leading-relaxed text-ciruela-400">
          Indique el documento con el que firmará el acta. Verificaremos su identidad ante
          RENIEC o SUNAT.
        </p>
      </div>

      <Tabs value={docType} onValueChange={cambiarTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-0 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="DNI"
            className="min-h-11 rounded-none border-b-2 border-humo-200 px-3 py-2.5 data-[state=active]:border-guinda-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-offset-white"
          >
            Persona natural (DNI)
          </TabsTrigger>
          <TabsTrigger
            value="RUC"
            className="min-h-11 rounded-none border-b-2 border-humo-200 px-3 py-2.5 data-[state=active]:border-guinda-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-offset-white"
          >
            Persona jurídica (RUC)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idBase}-numero`}>
          {docType === "DNI" ? "Número de DNI" : "Número de RUC"}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
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
            className="min-h-11 sm:max-w-56"
          />
          <Button
            onClick={verificar}
            disabled={!numeroValido || consultando}
            className="min-h-11"
          >
            {consultando ? (
              <Spinner className="h-4 w-4 text-white" />
            ) : (
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
            Verificar identidad
          </Button>
        </div>
        {mensajeNumero ? (
          <p id={`${idBase}-numero-error`} className="text-xs text-guinda-600">
            {mensajeNumero}
          </p>
        ) : null}
        {consultando ? (
          <p className="flex items-center gap-2 text-sm text-ciruela-400" aria-live="polite">
            <Spinner className="h-4 w-4" />
            Consultando RENIEC/SUNAT…
          </p>
        ) : null}
      </div>

      {errorConsulta && !manual ? (
        <Alert variant="warning">
          <AlertTitle>No fue posible verificar la identidad</AlertTitle>
          <AlertDescription>
            <p>{errorConsulta}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 min-h-11 border-humo-300 hover:border-ciruela-300"
              onClick={() => setManual(true)}
            >
              Continuar con registro manual
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {resultado?.tipo === "DNI" ? (
        <div className="rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ciruela-400">Nombre completo</p>
            <VerifiedBadge verified source="RENIEC" />
          </div>
          <p className="mt-1 text-sm font-semibold text-berenjena">{resultado.nombreCompleto}</p>
        </div>
      ) : null}

      {resultado?.tipo === "RUC" ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-[var(--radius-brand)] border border-humo-200 bg-humo-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-ciruela-400">Razón social</p>
              <VerifiedBadge verified source="SUNAT" />
            </div>
            <p className="mt-1 text-sm font-semibold text-berenjena">{resultado.razonSocial}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={resultado.estado === "ACTIVO" ? "success" : "warning"}>
                Estado: {resultado.estado}
              </Badge>
              <Badge variant={resultado.condicion === "HABIDO" ? "success" : "warning"}>
                Condición: {resultado.condicion}
              </Badge>
            </div>
          </div>
          {rucNoHabilitado ? (
            <Alert variant="warning">
              <AlertTitle>RUC con observaciones ante SUNAT</AlertTitle>
              <AlertDescription>
                SUNAT reporta este RUC como {resultado.estado} / {resultado.condicion}. Puede
                continuar, pero quedará registrado en la evidencia.
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
            placeholder={
              docType === "DNI" ? "Tal como figura en su DNI" : "Tal como figura ante SUNAT"
            }
            aria-describedby={`${idBase}-nota-manual`}
          />
          <p id={`${idBase}-nota-manual`} className="text-xs leading-relaxed text-amber-800">
            Este registro quedará marcado como No verificado en la evidencia de la sesión.
          </p>
        </div>
      ) : null}

      {mostrarRep ? (
        <fieldset className="flex flex-col gap-4 rounded-[var(--radius-brand)] border border-humo-300 p-4">
          <legend className="px-1 text-sm font-medium text-ciruela-700">
            Representante que firma
          </legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idBase}-rep-nombre`}>Nombre completo del representante</Label>
            <Input
              id={`${idBase}-rep-nombre`}
              value={repNombre}
              onChange={(e) => setRepNombre(e.target.value)}
              placeholder="Ej.: Juan Pérez Quispe"
              autoComplete="name"
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
            />
            {repDni.length > 0 && !repDniValido ? (
              <p id={`${idBase}-rep-dni-error`} className="text-xs text-guinda-600">
                El DNI debe tener exactamente 8 dígitos.
              </p>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {/* Los datos de participación aparecen recién con la identidad
          establecida: el firmante resuelve una sola cosa a la vez. */}
      {identificado ? (
        <div className="anim-subir flex flex-col gap-4 border-t border-humo-200 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-ciruela-700">
              Su participación en la audiencia
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-ciruela-400">
              Estos datos aparecerán bajo su firma en la planilla del acta.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idBase}-cargo`}>Cargo o rol en la audiencia</Label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cargos frecuentes">
              {CARGOS_FRECUENTES.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setCargo(opcion)}
                  className={
                    cargo === opcion
                      ? "rounded-full border border-guinda-300 bg-guinda-50 px-3 py-1.5 text-xs font-medium text-guinda-700 outline-none focus-visible:ring-2 focus-visible:ring-guinda-500"
                      : "rounded-full border border-humo-300 bg-white px-3 py-1.5 text-xs font-medium text-ciruela-500 outline-none transition-colors duration-150 hover:border-ciruela-300 hover:text-ciruela-700 focus-visible:ring-2 focus-visible:ring-guinda-500"
                  }
                >
                  {opcion}
                </button>
              ))}
            </div>
            <Input
              id={`${idBase}-cargo`}
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Seleccione una opción o escriba su cargo"
              className="min-h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idBase}-parte`}>Parte que representa</Label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Partes frecuentes">
              {PARTES_FRECUENTES.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setParte(opcion)}
                  className={
                    parte === opcion
                      ? "rounded-full border border-guinda-300 bg-guinda-50 px-3 py-1.5 text-xs font-medium text-guinda-700 outline-none focus-visible:ring-2 focus-visible:ring-guinda-500"
                      : "rounded-full border border-humo-300 bg-white px-3 py-1.5 text-xs font-medium text-ciruela-500 outline-none transition-colors duration-150 hover:border-ciruela-300 hover:text-ciruela-700 focus-visible:ring-2 focus-visible:ring-guinda-500"
                  }
                >
                  {opcion}
                </button>
              ))}
            </div>
            <Input
              id={`${idBase}-parte`}
              value={parte}
              onChange={(e) => setParte(e.target.value)}
              placeholder="Seleccione una opción o escríbala"
              className="min-h-11"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
