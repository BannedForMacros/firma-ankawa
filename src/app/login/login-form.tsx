"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

/** Solo aceptamos rutas internas como destino posterior al inicio de sesión. */
function destinoSeguro(callbackUrl: string | null): string {
  if (callbackUrl !== null && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return "/panel";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setError(null);
    try {
      const resultado = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (resultado?.error) {
        setError("Credenciales incorrectas o usuario inactivo.");
        setEnviando(false);
        return;
      }

      router.push(destinoSeguro(callbackUrl));
      router.refresh();
    } catch {
      setError("Credenciales incorrectas o usuario inactivo.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="usted@ankawaintl.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error !== null && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={enviando}>
        {enviando ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Verificando sus credenciales…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      <Link
        href="/"
        className="self-center rounded-[var(--radius-brand)] text-sm text-ciruela-400 underline-offset-4 transition-colors hover:text-ciruela-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guinda-500"
      >
        Volver al inicio
      </Link>
    </form>
  );
}
