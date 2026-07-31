"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { MetodoFirma, SesionPublicaDto, TipoDocumento } from "@/lib/types";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasoIdentificacion } from "@/components/firmar/paso-identificacion";
import { PasoFirma } from "@/components/firmar/paso-firma";
import { PasoConfirmacion } from "@/components/firmar/paso-confirmacion";
import { SesionCerrada } from "@/components/firmar/sesion-cerrada";
import { cn } from "@/lib/utils";

/** Identidad del firmante construida en el paso 1 (completa y válida). */
export interface IdentidadFirmante {
  docType: TipoDocumento;
  docNumber: string;
  displayName: string;
  repNombre?: string;
  repDni?: string;
  cargo: string;
  parte: string;
  verified: boolean;
  /** Solo RUC: true si SUNAT reporta ACTIVO y HABIDO. */
  habilitado?: boolean;
}

/** Firma capturada en el paso 2. */
export interface FirmaCapturada {
  dataUrl: string;
  metodo: MetodoFirma;
}

interface FlujoFirmaProps {
  sesion: SesionPublicaDto;
  token: string;
}

const PASOS = [
  { id: "identificacion", label: "Identificación" },
  { id: "firma", label: "Firma" },
  { id: "confirmacion", label: "Confirmación" },
] as const;

interface ResultadoExito {
  sha256: string;
  displayName: string;
  hora: string;
}

async function leerMensajeDeError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // El cuerpo no era JSON: se usa el mensaje genérico.
  }
  return "No se pudo registrar la firma. Verifique su conexión e intente nuevamente.";
}

export function FlujoFirma({ sesion, token }: FlujoFirmaProps) {
  const [paso, setPaso] = useState<number>(0);
  const [identidad, setIdentidad] = useState<IdentidadFirmante | null>(null);
  const [firma, setFirma] = useState<FirmaCapturada | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [sesionCerrada, setSesionCerrada] = useState(false);
  const [ofrecerRecarga, setOfrecerRecarga] = useState(false);
  const [exito, setExito] = useState<ResultadoExito | null>(null);

  const manejarIdentidad = useCallback((valor: IdentidadFirmante | null) => {
    setIdentidad(valor);
  }, []);

  const manejarFirma = useCallback((valor: FirmaCapturada | null) => {
    setFirma(valor);
  }, []);

  const retroceder = useCallback(() => {
    setErrorEnvio(null);
    setPaso((actual) => Math.max(0, actual - 1));
  }, []);

  const avanzar = useCallback(() => {
    setPaso((actual) => Math.min(PASOS.length - 1, actual + 1));
  }, []);

  const firmarActa = useCallback(async () => {
    if (!identidad || !firma || enviando) return;
    setEnviando(true);
    setErrorEnvio(null);
    setOfrecerRecarga(false);
    try {
      const res = await fetch(`/api/firmar/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: identidad.docType,
          docNumber: identidad.docNumber,
          displayName: identidad.displayName,
          ...(identidad.repNombre ? { repNombre: identidad.repNombre } : {}),
          ...(identidad.repDni ? { repDni: identidad.repDni } : {}),
          cargo: identidad.cargo,
          parte: identidad.parte,
          verified: identidad.verified,
          signMethod: firma.metodo,
          imageDataUrl: firma.dataUrl,
          conformidad: true,
        }),
      });

      if (res.status === 201) {
        setExito({
          sha256: (await res.json().then((d: unknown) => {
            const cuerpo = d as { sha256?: unknown };
            return typeof cuerpo.sha256 === "string" ? cuerpo.sha256 : "";
          })),
          displayName: identidad.displayName,
          hora: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        return;
      }

      const mensaje = await leerMensajeDeError(res);
      setErrorEnvio(mensaje);
      if (res.status === 423) {
        setOfrecerRecarga(true);
      }
    } catch {
      setErrorEnvio(
        "No se pudo establecer conexión con el servidor. Verifique su conexión a internet e intente nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  }, [identidad, firma, enviando, token]);

  if (sesionCerrada) {
    return <SesionCerrada sesion={{ ...sesion, status: "CLOSED" }} />;
  }

  if (exito) {
    return (
      <section
        aria-labelledby="titulo-firma-registrada"
        className="flex flex-col items-center rounded-[var(--radius-brand)] bg-white px-6 py-10 text-center shadow-card sm:px-10"
      >
        <style>{`
          @keyframes exito-aparecer {
            0% { transform: scale(0.6); opacity: 0; }
            70% { transform: scale(1.06); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-guinda-500 text-white"
          style={{ animation: "exito-aparecer 450ms ease-out both" }}
        >
          <Check className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2
          id="titulo-firma-registrada"
          className="titulo-institucional mt-5 text-base text-ciruela-700"
        >
          Su firma quedó registrada
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-berenjena">
          <span className="font-semibold">{exito.displayName}</span>
          <br />
          Firma registrada a las {exito.hora}.
        </p>
        <div className="mt-6 w-full max-w-md rounded-[var(--radius-brand)] bg-humo-100 px-4 py-3 text-left">
          <p className="text-xs font-medium text-ciruela-400">
            Código de verificación de integridad
          </p>
          <code className="mt-1 block break-all text-[0.7rem] leading-relaxed text-ciruela-700">
            {exito.sha256}
          </code>
        </div>
        <p className="mt-4 max-w-md text-xs leading-relaxed text-ciruela-400">
          Puede cerrar esta página. La secretaría arbitral conserva la constancia de su firma.
        </p>
      </section>
    );
  }

  const puedeContinuar = paso === 0 ? identidad !== null : paso === 1 ? firma !== null : false;

  return (
    <section aria-label="Proceso de firma del acta" className="flex flex-col gap-6">
      <Stepper steps={PASOS} current={paso} />

      <div className="rounded-[var(--radius-brand)] bg-white p-5 shadow-card sm:p-6">
        <div className={cn(paso === 0 ? "block" : "hidden")}>
          <PasoIdentificacion token={token} onChange={manejarIdentidad} />
        </div>
        <div className={cn(paso === 1 ? "block" : "hidden")}>
          <PasoFirma firma={firma} onChange={manejarFirma} />
        </div>
        <div className={cn(paso === 2 ? "block" : "hidden")}>
          <PasoConfirmacion
            sesion={sesion}
            identidad={identidad}
            firma={firma}
            enviando={enviando}
            onFirmar={firmarActa}
          />
        </div>

        {errorEnvio && paso === 2 ? (
          <Alert variant="error" className="mt-4">
            <AlertTitle>No se pudo registrar la firma</AlertTitle>
            <AlertDescription>
              <p>{errorEnvio}</p>
              {ofrecerRecarga ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSesionCerrada(true)}
                >
                  Actualizar estado de la sesión
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Navegación consistente Atrás / Continuar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={retroceder}
          disabled={paso === 0 || enviando}
          className={cn(paso === 0 && "invisible")}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Atrás
        </Button>
        {paso < 2 ? (
          <Button size="lg" onClick={avanzar} disabled={!puedeContinuar}>
            Continuar
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
