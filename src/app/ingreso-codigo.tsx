"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ApiError, EstadoSesion } from "@/lib/types";

interface CodigoRespuesta {
  token: string;
  status: EstadoSesion;
}

/**
 * Formulario público de ingreso del código corto de sesión.
 * POST /api/codigo → redirige a /firmar/{token} (la página de firma
 * muestra el estado aunque la sesión esté cerrada).
 */
export function IngresoCodigo() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  // Autofoco solo en pantallas amplias (en móvil evitamos abrir el teclado).
  // preventScroll es imprescindible: sin él, el navegador desplaza la página
  // hasta el input y el visitante se pierde la entrada del héroe con el logo.
  React.useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  function onCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const limpio = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCode(limpio);
    if (error) setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    const codigo = code.trim();
    if (codigo.length === 0) {
      setError("Ingrese el código que aparece en el afiche o en la pantalla de la audiencia.");
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codigo }),
      });

      if (res.ok) {
        const data = (await res.json()) as CodigoRespuesta;
        router.push(`/firmar/${data.token}`);
        return;
      }

      const data = (await res.json().catch(() => null)) as ApiError | null;
      setError(
        data?.error ??
          "No fue posible verificar el código. Revise su conexión e intente nuevamente."
      );
      setEnviando(false);
    } catch {
      setError("No fue posible verificar el código. Revise su conexión e intente nuevamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="codigo-sesion">Código de la sesión</Label>
        <Input
          ref={inputRef}
          id="codigo-sesion"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={6}
          value={code}
          onChange={onCodeChange}
          placeholder="A1B2C3"
          aria-invalid={error !== null}
          aria-describedby={error ? "codigo-error" : "codigo-ayuda"}
          className="h-20 text-center font-display text-3xl font-bold uppercase tracking-[0.3em] tabular-nums placeholder:tracking-[0.3em] placeholder:text-humo-300 sm:text-4xl"
        />
        <p id="codigo-ayuda" className="text-xs text-ciruela-400">
          Ingrese el código de 6 caracteres que se le proporcionó en la audiencia.
        </p>
      </div>

      {error !== null && (
        <Alert variant="error" id="codigo-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={enviando}>
        {enviando ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Verificando el código…
          </>
        ) : (
          "Continuar a la firma"
        )}
      </Button>
    </form>
  );
}
