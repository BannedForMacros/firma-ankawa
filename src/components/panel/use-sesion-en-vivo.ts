"use client";

import { useCallback, useEffect, useState } from "react";

import type { SesionDetalleDto } from "@/lib/types";

const INTERVALO_MS = 4000;

interface UseSesionEnVivoResult {
  sesion: SesionDetalleDto | null;
  error: string | null;
  refetch: () => void;
}

/**
 * Mantiene el detalle de una sesión de firmas actualizado en vivo.
 * Consulta `/api/sesiones/{id}` cada 4 s mientras `activo` sea true y la
 * pestaña esté visible; al volver a la pestaña reanuda el sondeo de inmediato.
 */
export function useSesionEnVivo(id: string, activo: boolean): UseSesionEnVivoResult {
  const [sesion, setSesion] = useState<SesionDetalleDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultar = useCallback(async (): Promise<void> => {
    try {
      const respuesta = await fetch(`/api/sesiones/${id}`, { cache: "no-store" });
      const cuerpo: unknown = await respuesta.json();
      if (!respuesta.ok) {
        const mensaje =
          typeof cuerpo === "object" &&
          cuerpo !== null &&
          "error" in cuerpo &&
          typeof (cuerpo as { error: unknown }).error === "string"
            ? (cuerpo as { error: string }).error
            : "No se pudo actualizar la información de la sesión.";
        setError(mensaje);
        return;
      }
      setSesion((cuerpo as { sesion: SesionDetalleDto }).sesion);
      setError(null);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Verifique su conexión; la actualización se reintentará automáticamente."
      );
    }
  }, [id]);

  const refetch = useCallback((): void => {
    void consultar();
  }, [consultar]);

  // Consulta inmediata al montar (independiente del sondeo periódico).
  useEffect(() => {
    void consultar();
  }, [consultar]);

  // Sondeo periódico solo con la sesión activa y la pestaña visible.
  useEffect(() => {
    if (!activo) return;

    let intervalo: number | null = null;

    const iniciar = (): void => {
      if (intervalo === null) {
        intervalo = window.setInterval(() => {
          void consultar();
        }, INTERVALO_MS);
      }
    };

    const detener = (): void => {
      if (intervalo !== null) {
        window.clearInterval(intervalo);
        intervalo = null;
      }
    };

    const alCambiarVisibilidad = (): void => {
      if (document.visibilityState === "visible") {
        void consultar();
        iniciar();
      } else {
        detener();
      }
    };

    if (document.visibilityState === "visible") {
      iniciar();
    }
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      detener();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [activo, consultar]);

  return { sesion, error, refetch };
}
